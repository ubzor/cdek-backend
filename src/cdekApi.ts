import 'dotenv/config'

import CdekApi from './classes/CdekApi'

if (!process.env.CDEK_CLIENT_ID)
    throw new Error('CDEK_CLIENT_ID must be provided in env variables')

if (!process.env.CDEK_CLIENT_SECRET)
    throw new Error('CDEK_API_SECRET must be provided in env variables')

const cdekApi = new CdekApi(process.env.CDEK_CLIENT_ID, process.env.CDEK_CLIENT_SECRET)

export default cdekApi
