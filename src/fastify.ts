import Fastify from 'fastify'
import fastifyPostgres from '@fastify/postgres'
import QueryStream from 'pg-query-stream'
import jsonstream from 'jsonstream'
import 'dotenv/config'

import { getGeoLocations } from '@prisma/client/sql'

import {
    validateObject,
    boundingBoxValidationSchema,
    deliveryPointValidationSchema,
    deliveryPointsValidationSchema
} from './utils/validation'
import prisma from './prisma'

const fastify = Fastify({ logger: process.env.NODE_ENV !== 'production' })

fastify.get<{
    Querystring: Record<
        'minLongitude' | 'minLatitude' | 'maxLongitude' | 'maxLatitude',
        string
    >
}>('/delivery-points/bounding-box', async (request, reply) => {
    const { data, error } = validateObject<typeof boundingBoxValidationSchema>(
        boundingBoxValidationSchema,
        request.query
    )

    if (error) {
        reply.code(400)
        return error
    }

    const pgClient = await fastify.pg.connect()

    const { minLongitude, minLatitude, maxLongitude, maxLatitude } = data

    const sql = getGeoLocations(minLongitude, minLatitude, maxLongitude, maxLatitude).sql

    const query = new QueryStream(
        sql,
        [minLongitude, minLatitude, maxLongitude, maxLatitude],
        { batchSize: 100, highWaterMark: 100 }
    )

    const stream = pgClient.query(query)

    stream.on('end', () => {
        pgClient.release()
    })

    reply.header('Content-Type', 'application/octet-stream')
    return reply.send(stream.pipe(jsonstream.stringify()))
})

fastify.get<{ Params: { uuid: string } }>(
    '/delivery-points/:uuid',
    async (request, reply) => {
        const { data, error } = validateObject(
            deliveryPointValidationSchema,
            request.params
        )

        if (error) {
            reply.code(400)
            return error
        }

        const deliveryPoint = await prisma.deliveryPoint.findUnique({
            where: { uuid: data.uuid },
            include: {
                dimensions: true,
                location: true,
                workTimes: true,
                workTimeExceptions: true,
                phones: true,
                officeImages: true
            }
        })

        if (!deliveryPoint) {
            reply.code(404)
            return { error: 'Delivery point not found' }
        }

        return deliveryPoint
    }
)

fastify.get<{ Querystring: { uuids: string[] } }>(
    '/delivery-points/array',
    async (request, reply) => {
        const { data, error } = validateObject<typeof deliveryPointsValidationSchema>(
            deliveryPointsValidationSchema,
            request.query
        )

        if (error) {
            reply.code(400)
            return error
        }

        const deliveryPoints = await prisma.deliveryPoint.findMany({
            where: { uuid: { in: data.uuids } },
            include: {
                dimensions: true,
                location: true,
                workTimes: true,
                workTimeExceptions: true,
                phones: true,
                officeImages: true
            }
        })

        return deliveryPoints
    }
)

if (!process.env.DATABASE_HOST)
    throw new Error('DATABASE_HOST must be provided in env variables')

if (!process.env.DATABASE_PORT)
    throw new Error('DATABASE_PORT must be provided in env variables')

if (!process.env.DATABASE_DATABASE)
    throw new Error('DATABASE_DATABASE must be provided in env variables')

if (!process.env.DATABASE_USER)
    throw new Error('DATABASE_USER must be provided in env variables')

if (!process.env.DATABASE_PASSWORD)
    throw new Error('DATABASE_PASSWORD must be provided in env variables')

fastify.register(fastifyPostgres, {
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    database: process.env.DATABASE_DATABASE,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
})

export const start = async (host: string, port: number) => {
    try {
        await fastify.listen({ host, port })
        fastify.log.info('Server started')
    } catch (error: any) {
        fastify.log.error(error)
        process.exit(1)
    }
}
