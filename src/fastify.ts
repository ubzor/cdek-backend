import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyPostgres from '@fastify/postgres'
import QueryStream from 'pg-query-stream'
import jsonstream from 'jsonstream'
import 'dotenv/config'

import { getGeoLocations } from '@prisma/client/sql'

import {
    validateObject,
    boundingBoxValidationSchema,
    deliveryPointIdValidationSchema,
    deliveryPointsValidationSchema,
    codeValidationSchema
} from './utils/validation'
import prisma from './prisma'

const fastify = Fastify({ logger: process.env.DISPLAY_LOGS === 'true' })

fastify.get<{
    Querystring: Record<
        'minLongitude' | 'minLatitude' | 'maxLongitude' | 'maxLatitude',
        string
    > &
        Record<
            'isPickupPoint' | 'isPostamat' | 'hasCash' | 'hasCard' | 'hasFittingRoom',
            string | undefined
        >
}>('/delivery-points/bounding-box', async (request, reply) => {
    const { data, error } = await validateObject<typeof boundingBoxValidationSchema>(
        boundingBoxValidationSchema,
        request.query
    )

    if (error) {
        reply.code(400)
        return error
    }

    const pgClient = await fastify.pg.connect()

    const {
        minLongitude,
        minLatitude,
        maxLongitude,
        maxLatitude,
        isPickupPoint,
        isPostamat,
        hasCash,
        hasCard,
        hasFittingRoom
    } = data

    let sql = getGeoLocations(minLongitude, minLatitude, maxLongitude, maxLatitude).sql

    if (isPickupPoint === false) sql += ` AND dp."type" = 'PVZ'`
    if (isPostamat === false) sql += ` AND dp."type" = 'POSTAMAT'`
    if (hasCash === false) sql += ` AND dp."haveCash" = false`
    if (hasCard === false) sql += ` AND dp."haveCashless" = false`
    if (hasFittingRoom === true) sql += ` AND dp."isDressingRoom" = true`

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

fastify.get<{ Params: { code: string }; Querystring: { allFields: string | undefined } }>(
    '/delivery-points/code/:code',
    async (request, reply) => {
        const { data, error } = await validateObject(codeValidationSchema, {
            ...request.params,
            ...request.query
        })

        if (error) {
            reply.code(400)
            return error
        }

        const deliveryPoint = await prisma.deliveryPoint.findUnique({
            where: { code: data.code },
            ...(data.allFields && {
                include: {
                    dimensions: true,
                    location: true,
                    workTimes: true,
                    workTimeExceptions: true,
                    phones: true,
                    officeImages: true
                }
            }),
            ...(!data.allFields && {
                select: {
                    uuid: true,
                    code: true,
                    workTime: true,
                    type: true,
                    location: {
                        select: {
                            city: true,
                            address: true,
                            latitude: true,
                            longitude: true
                        }
                    }
                }
            })
        })

        if (!deliveryPoint) {
            reply.code(404)
            return { error: 'Delivery point not found' }
        }

        return deliveryPoint
    }
)

fastify.get<{ Params: { uuid: string }; Querystring: { allFields: string | undefined } }>(
    '/delivery-points/:uuid',
    async (request, reply) => {
        const { data, error } = await validateObject(deliveryPointIdValidationSchema, {
            ...request.params,
            ...request.query
        })

        if (error) {
            reply.code(400)
            return error
        }

        const deliveryPoint = await prisma.deliveryPoint.findUnique({
            where: { uuid: data.uuid },
            ...(data.allFields && {
                include: {
                    dimensions: true,
                    location: true,
                    workTimes: true,
                    workTimeExceptions: true,
                    phones: true,
                    officeImages: true
                }
            }),
            ...(!data.allFields && {
                select: {
                    uuid: true,
                    code: true,

                    workTime: true,
                    type: true,
                    addressComment: true,

                    haveCash: true,
                    haveCashless: true,
                    isDressingRoom: true,

                    location: {
                        select: {
                            city: true,
                            address: true
                        }
                    }
                }
            })
        })

        if (!deliveryPoint) {
            reply.code(404)
            return { error: 'Delivery point not found' }
        }

        return deliveryPoint
    }
)

fastify.get<{ Querystring: { uuids: string | string[] } }>(
    '/delivery-points/array',
    async (request, reply) => {
        const { data, error } = await validateObject<
            typeof deliveryPointsValidationSchema
        >(deliveryPointsValidationSchema, request.query)

        if (error) {
            reply.code(400)
            return error
        }

        const deliveryPoints = await prisma.deliveryPoint.findMany({
            where: {
                uuid: {
                    ...(typeof data.uuids !== 'string' && { in: data.uuids }),
                    ...(typeof data.uuids === 'string' && { equals: data.uuids })
                }
            },
            select: {
                uuid: true,
                code: true,
                workTime: true,
                type: true,
                location: {
                    select: {
                        city: true,
                        address: true
                    }
                }
            }
        })

        return deliveryPoints
    }
)

// Removed top-level await for cors and fastifyPostgres registration

export const start = async (host: string, port: number) => {
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

    try {
        // Register plugins inside the async start function
        await fastify.register(cors, {
            origin: process.env.ALLOWED_REFERRERS?.split(',')
        })
        fastify.register(fastifyPostgres, {
            host: process.env.DATABASE_HOST,
            port: +process.env.DATABASE_PORT,
            database: process.env.DATABASE_DATABASE,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        })
        // Wait until all plugins are registered
        await fastify.ready()

        await fastify.listen({ host, port })
        fastify.log.info('Server started')
    } catch (error: any) {
        fastify.log.error(error)
        process.exit(1)
    }
}
