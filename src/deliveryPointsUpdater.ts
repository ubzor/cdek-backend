import dotenv from 'dotenv'

import type { PrismaClient } from '@prisma/client'

import type { CdekApi } from '../types/CdekApi'
import type { CdekDeliveryPoint } from '../types/CdekDeliveryPoint'

dotenv.config()

export default class DeliveryPointsUpdater {
    #cdekApi: CdekApi
    #prisma: PrismaClient

    #deliveryPoints: CdekDeliveryPoint[] | undefined

    constructor(cdekApi: CdekApi, prisma: PrismaClient) {
        ;[this.#cdekApi, this.#prisma] = [cdekApi, prisma]
    }

    #transformDeliveryPointToPrismaFormat(dp: CdekDeliveryPoint, isUpdating: boolean) {
        const location = {
            countryCode: dp.location.country_code,
            regionCode: dp.location.region_code,
            region: dp.location.region,
            cityCode: dp.location.city_code,
            city: dp.location.city,
            fiasGuid: dp.location.fias_guid ?? null,
            postalCode: dp.location.postal_code ?? null,
            longitude: dp.location.longitude,
            latitude: dp.location.latitude,
            address: dp.location.address,
            addressFull: dp.location.address_full,
            cityUuid: dp.location.city_uuid ?? null
        }

        const data = {
            code: dp.code,
            name: dp.name,
            addressComment: dp.address_comment ?? null,
            nearestStation: dp.nearest_station ?? null,
            nearestMetroStation: dp.nearest_metro_station ?? null,
            workTime: dp.work_time,

            phones: {
                ...(isUpdating && { deleteMany: {} }),
                create: dp.phones.map((p) => ({
                    number: p.number,
                    additional: p.additional ?? null
                }))
            },

            email: dp.email ?? null,
            note: dp.note ?? null,
            type: dp.type,
            ownerCode: dp.owner_code,

            takeOnly: dp.take_only,
            isHandout: dp.is_handout,
            isReception: dp.is_reception,
            isDressingRoom: dp.is_dressing_room,
            isMarketplace: dp.is_marketplace ?? null,
            isLtl: dp.is_ltl ?? null,
            haveCashless: dp.have_cashless,
            haveCash: dp.have_cash,
            haveFastPaymentSystem: dp.have_fast_payment_system,
            allowedCod: dp.allowed_cod,

            site: dp.site ?? null,

            officeImages: {
                ...(isUpdating && { deleteMany: {} }),
                create: dp.office_image_list?.map((oi) => ({
                    number: oi.number ?? null,
                    url: oi.url
                }))
            },

            workTimes: {
                ...(isUpdating && { deleteMany: {} }),
                create: dp.work_time_list.map((wt) => ({
                    day: wt.day,
                    time: wt.time
                }))
            },

            workTimeExceptions: {
                ...(isUpdating && { deleteMany: {} }),
                create: dp.work_time_exception_list?.map((wte) => ({
                    dateStart: wte.date_start,
                    dateEnd: wte.date_end,
                    timeStart: wte.time_start ?? null,
                    timeEnd: wte.time_end ?? null,
                    isWorking: wte.is_working
                }))
            },

            weightMin: dp.weight_min !== undefined ? dp.weight_min : null,
            weightMax: dp.weight_max !== undefined ? dp.weight_max : null,

            dimensions: {
                ...(isUpdating && { deleteMany: {} }),
                create: dp.dimensions?.map((d) => ({
                    height: d.height,
                    width: d.width,
                    depth: d.depth
                }))
            },

            location: {
                ...(isUpdating && { update: location }),
                ...(!isUpdating && { create: location })
            },

            ...(dp.distance !== undefined && { distance: dp.distance }),

            fulfillment: !!dp.fulfillment
        }

        return data
    }

    // Synchronize delivery points with the database.
    async #syncDeliveryPoints() {
        // Ensure feed exists
        const feedUuids = new Set(this.#deliveryPoints?.map((dp) => dp.uuid))

        // Fetch existing delivery points (only uuid)
        const existing = await this.#prisma.deliveryPoint.findMany({
            select: { uuid: true }
        })

        const existingUuids = new Set(existing.map((dp) => dp.uuid))

        let createdCount = 0
        let updatedCount = 0
        let deletedCount = 0

        // Upsert feed items: update if exists, else create.
        for (const dp of this.#deliveryPoints ?? []) {
            try {
                const isUpdating = existingUuids.has(dp.uuid)

                const data = this.#transformDeliveryPointToPrismaFormat(dp, isUpdating)

                if (existingUuids.has(dp.uuid)) {
                    await this.#prisma.deliveryPoint.update({
                        where: { uuid: dp.uuid },
                        data
                    })

                    console.log(`Updated delivery point: ${dp.code}`)
                    updatedCount++
                } else {
                    await this.#prisma.deliveryPoint.create({
                        data: { uuid: dp.uuid, ...data }
                    })

                    console.log(`Created delivery point: ${dp.code}`)
                    createdCount++
                }
            } catch (error: any) {
                console.log(`Error: ${error.message}`)
                console.log(`Delivery point: `, dp)
                break
            }
        }

        // Delete delivery points that exist in the database but not in the feed.
        for (const uuid of existingUuids) {
            if (!feedUuids.has(uuid)) {
                await this.#prisma.deliveryPoint.delete({ where: { uuid } })

                console.log(`Deleted delivery point: ${uuid}`)
                deletedCount++
            }
        }

        return { createdCount, updatedCount, deletedCount }
    }

    async run() {
        this.#deliveryPoints = await this.#cdekApi.getDeliveryPoints()
        return await this.#syncDeliveryPoints()
    }
}
