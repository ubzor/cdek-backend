import fastify from '../src/fastify'

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(request: VercelRequest, reply: VercelResponse) {
    await fastify.ready()
    fastify.server.emit('request', request, reply)
}
