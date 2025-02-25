import dotenv from 'dotenv'

import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

dotenv.config()

if (!process.env.TURSO_DATABASE_URL)
    throw new Error('TURSO_DATABASE_URL must be provided in env variables')

if (!process.env.TURSO_AUTH_TOKEN)
    throw new Error('TURSO_AUTH_TOKEN must be provided in env variables')

const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

export default prisma
