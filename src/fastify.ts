import Fastify from 'fastify'
import 'dotenv/config'

import DeliveryPointsUpdater from './classes/DeliveryPointsUpdater'
import prisma from './prisma'
import cdekApi from './cdekApi'

const fastify = Fastify({ logger: process.env.NODE_ENV !== 'production' })

fastify.get('/', async (request, reply) => {
    return { message: 'Fastify & Prisma backend' }
})

fastify.get('/delivery-points', async (request, reply) => {
    const pickupPoints = await prisma.deliveryPoint.findMany()
    return pickupPoints
})

// Temporary route to update delivery points
// TODO: move to cron job
fastify.get('/update-delivery-points', async (request, reply) => {
    const updater = new DeliveryPointsUpdater(cdekApi, prisma)
    const deliveryPoints = await updater.run()

    return deliveryPoints
})

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' })
        fastify.log.info('Server started')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

if (process.env.NODE_ENV !== 'production') {
    start()
}

export default fastify
