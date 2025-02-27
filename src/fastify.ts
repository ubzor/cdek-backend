import Fastify from 'fastify'
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

    const { minLongitude, minLatitude, maxLongitude, maxLatitude } = data

    const deliveryPoints = await prisma.$queryRawTyped(
        getGeoLocations(minLongitude, minLatitude, maxLongitude, maxLatitude)
    )

    return deliveryPoints.map(({ coordinates, deliveryPointId, ...rest }) => ({
        uuid: deliveryPointId,
        ...rest
    }))
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

export const start = async (host: string, port: number) => {
    try {
        await fastify.listen({ host, port })
        fastify.log.info('Server started')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
