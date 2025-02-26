import 'dotenv/config'
import cliProgress from 'cli-progress'

import type { PrismaClient } from '@prisma/client'

import { transformDeliveryPointsToPrismaObjectBatch } from '../transformers/deliveryPoints'

import type { CdekApi } from '../../types/CdekApi'
import type { CdekDeliveryPoint } from '../../types/CdekDeliveryPoint'

export default class DeliveryPointsUpdater {
    #cdekApi: CdekApi
    #prisma: PrismaClient

    #deliveryPoints: CdekDeliveryPoint[] | undefined

    constructor(cdekApi: CdekApi, prisma: PrismaClient) {
        ;[this.#cdekApi, this.#prisma] = [cdekApi, prisma]
    }

    async #batchCreateDeliveryPoints(batch: CdekDeliveryPoint[]): Promise<number> {
        const {
            pickupPoints,
            dimensions,
            locations,
            officeImages,
            phones,
            workTimeExceptions,
            workTimes
        } = transformDeliveryPointsToPrismaObjectBatch(batch)

        await this.#prisma.deliveryPoint.createMany({ data: pickupPoints })
        await this.#prisma.phone.createMany({ data: phones })
        await this.#prisma.officeImage.createMany({ data: officeImages })
        await this.#prisma.workTime.createMany({ data: workTimes })
        await this.#prisma.workTimeException.createMany({
            data: workTimeExceptions
        })
        await this.#prisma.dimensions.createMany({ data: dimensions })
        await this.#prisma.location.createMany({ data: locations })

        return pickupPoints.length
    }

    // Synchronize delivery points with the database.
    async #syncDeliveryPoints() {
        console.log('Calculating diff between data from api and database...')

        // Ensure feed exists
        const feedUuids = new Set(this.#deliveryPoints?.map((dp) => dp.uuid))

        // Fetch existing delivery points (only uuid)
        const existing = await this.#prisma.deliveryPoint.findMany({
            select: { uuid: true }
        })

        const existingUuids = new Set(existing.map((dp) => dp.uuid))

        const uuidsToCreate = new Set(
            [...feedUuids].filter((uuid) => !existingUuids.has(uuid))
        )
        const uuidsToUpdate = new Set(
            [...feedUuids].filter((uuid) => existingUuids.has(uuid))
        )
        const uuidsToDelete = new Set(
            [...existingUuids].filter((uuid) => !feedUuids.has(uuid))
        )

        const deliveryPointsToCreate =
            this.#deliveryPoints?.filter((dp) => uuidsToCreate.has(dp.uuid)) ?? []

        const deliveryPointsToUpdate =
            this.#deliveryPoints?.filter((dp) => uuidsToUpdate.has(dp.uuid)) ?? []

        console.log('Diff calculated')

        if (deliveryPointsToCreate.length) {
            console.log('Creating delivery points...')

            const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
            bar.start(deliveryPointsToCreate.length, 0)

            for (let i = 0; i < deliveryPointsToCreate.length; i += 100) {
                const pickupPoints = deliveryPointsToCreate.slice(i, i + 100)
                await this.#batchCreateDeliveryPoints(pickupPoints)

                bar.increment(pickupPoints.length)
            }

            bar.stop()
        } else {
            console.log('No delivery points to create')
        }

        if (deliveryPointsToUpdate.length) {
            console.log('Updating delivery points...')

            const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
            bar.start(deliveryPointsToUpdate.length, 0)

            for (let i = 0; i < deliveryPointsToUpdate.length; i += 100) {
                const pickupPoints = deliveryPointsToUpdate.slice(i, i + 100)

                await this.#prisma.deliveryPoint.deleteMany({
                    where: { uuid: { in: pickupPoints.map((dp) => dp.uuid) } }
                })

                await this.#batchCreateDeliveryPoints(pickupPoints)

                bar.increment(pickupPoints.length)
            }

            bar.stop()
        } else {
            console.log('No delivery points to update')
        }

        if (uuidsToDelete.size) {
            await this.#prisma.deliveryPoint.deleteMany({
                where: { uuid: { in: [...uuidsToDelete] } }
            })

            console.log(
                `Deleted ${uuidsToDelete.size}/${uuidsToDelete.size} delivery points`
            )
        } else {
            console.log('No delivery points to delete')
        }

        console.log('Sync complete')

        return { status: 'success' }
    }

    async run() {
        this.#deliveryPoints = await this.#cdekApi.getDeliveryPoints()
        return await this.#syncDeliveryPoints()
    }
}
