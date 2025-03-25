import dotenv from 'dotenv'
import cron from 'node-cron'

import prisma from './prisma'
import cdekApi from './cdekApi'
import { start } from './fastify'

import DeliveryPointsUpdater from './classes/DeliveryPointsUpdater'

dotenv.config()

if (!process.env.SERVER_HOST)
    throw new Error('SERVER_HOST must be provided in env variables')

if (!process.env.SERVER_PORT)
    throw new Error('SERVER_PORT must be provided in env variables')

const updater = new DeliveryPointsUpdater(
    cdekApi,
    prisma,
    process.env.NODE_ENV !== 'production',
    process.env.UPDATER_BATCH_SIZE ? +process.env.UPDATER_BATCH_SIZE : undefined
)

if (process.env.UPDATER_RUN_ON_START === 'true') updater.run()

cron.schedule(
    process.env.UPDATER_CRON_SCHEDULE ?? '0 0 * * *',
    async () => await updater.run(),
    {
        ...(process.env.UPDATER_CRON_TIMEZONE && {
            timezone: process.env.UPDATER_CRON_TIMEZONE
        })
    }
)

start(process.env.SERVER_HOST, +process.env.SERVER_PORT)
