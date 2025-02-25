import dotenv from 'dotenv'

import type { CdekDeliveryPoint } from '../types/CdekDeliveryPoint'

class CdekApi {
    #cdekClientId: string
    #cdekApiSecret: string
    #cdekAccessToken: string | undefined

    constructor(cdekClientId: string, cdekApiSecret: string) {
        ;[this.#cdekClientId, this.#cdekApiSecret] = [cdekClientId, cdekApiSecret]
    }

    async #authorize() {
        try {
            console.log('Authorizing with CDEK API...')

            const response = await fetch('https://api.cdek.ru/v2/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.#cdekClientId,
                    client_secret: this.#cdekApiSecret
                })
            })

            if (response.status !== 200)
                throw new Error('Failed to authorize with CDEK API')

            this.#cdekAccessToken = (await response.json()).access_token

            console.log('Sucessfully authorized with CDEK API')
        } catch (error: any) {
            console.log(error)
            throw new Error('Failed to authorize with CDEK API')
        }
    }

    async getDeliveryPoints() {
        await this.#authorize()

        try {
            console.log('Getting delivery points from CDEK API...')

            const response = await fetch('https://api.cdek.ru/v2/deliverypoints', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.#cdekAccessToken}`
                }
            })

            console.log('Got delivery points from CDEK API')

            return (await response.json()) as Array<CdekDeliveryPoint>
        } catch (error: any) {
            console.log(error)
            throw new Error('Failed to get delivery points from CDEK API')
        }
    }
}

dotenv.config()

if (!process.env.CDEK_CLIENT_ID)
    throw new Error('CDEK_CLIENT_ID must be provided in env variables')

if (!process.env.CDEK_CLIENT_SECRET)
    throw new Error('CDEK_API_SECRET must be provided in env variables')

const cdekApi = new CdekApi(process.env.CDEK_CLIENT_ID, process.env.CDEK_CLIENT_SECRET)

export default cdekApi
