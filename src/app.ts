import 'dotenv/config'
import cron from 'node-cron'

import prisma from './prisma'
import cdekApi from './cdekApi'
import { start } from './fastify'

import DeliveryPointsUpdater from './classes/DeliveryPointsUpdater'

if (!process.env.SERVER_HOST)
    throw new Error('SERVER_HOST must be provided in env variables')

if (!process.env.SERVER_PORT)
    throw new Error('SERVER_PORT must be provided in env variables')

const updater = new DeliveryPointsUpdater(cdekApi, prisma)

cron.schedule('0 0 * * *', async () => await updater.run(), { timezone: 'Europe/Moscow' })

start(process.env.SERVER_HOST, +process.env.SERVER_PORT)
