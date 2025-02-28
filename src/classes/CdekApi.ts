import type { CdekDeliveryPoint } from '../../types/CdekDeliveryPoint'

export default class CdekApi {
    #cdekClientId: string
    #cdekApiSecret: string
    #cdekAccessToken: string | undefined

    #writeLogs: boolean

    constructor(cdekClientId: string, cdekApiSecret: string, writeLogs: boolean = false) {
        ;[this.#cdekClientId, this.#cdekApiSecret, this.#writeLogs] = [
            cdekClientId,
            cdekApiSecret,
            writeLogs
        ]
    }

    async #authorize() {
        try {
            if (this.#writeLogs) console.log('Authorizing with CDEK API...')

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

            if (this.#writeLogs) console.log('Sucessfully authorized with CDEK API')
        } catch (error: any) {
            if (this.#writeLogs) console.log(error)

            throw new Error('Failed to authorize with CDEK API')
        }
    }

    async getDeliveryPoints() {
        await this.#authorize()

        try {
            if (this.#writeLogs) console.log('Getting delivery points from CDEK API...')

            const response = await fetch('https://api.cdek.ru/v2/deliverypoints', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.#cdekAccessToken}`
                }
            })

            if (this.#writeLogs) console.log('Got delivery points from CDEK API')

            return (await response.json()) as Array<CdekDeliveryPoint>
        } catch (error: any) {
            if (this.#writeLogs) console.log(error)

            throw new Error('Failed to get delivery points from CDEK API')
        }
    }
}
