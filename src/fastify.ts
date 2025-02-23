import Fastify from 'fastify'
import dotenv from 'dotenv'

// import prisma from './prisma'

dotenv.config()

const fastify = Fastify({ logger: process.env.NODE_ENV !== 'production' })

// fastify.get('/pickup-points', async (request, reply) => {
//     const pickupPoints = await prisma.pickupPoint.findMany()
//     return pickupPoints
// })

fastify.get('/', async (request, reply) => {
    return { message: 'Fastify & Prisma backend' }
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
