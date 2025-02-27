import type { CdekDeliveryPoint } from '../../types/CdekDeliveryPoint'

export const transformDeliveryPointToPrismaObjects = (dp: CdekDeliveryPoint) => {
    const deliveryPoint = {
        uuid: dp.uuid,
        code: dp.code,
        name: dp.name,
        addressComment: dp.address_comment ?? null,
        nearestStation: dp.nearest_station ?? null,
        nearestMetroStation: dp.nearest_metro_station ?? null,
        workTime: dp.work_time,

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

        weightMin: dp.weight_min !== undefined ? dp.weight_min : null,
        weightMax: dp.weight_max !== undefined ? dp.weight_max : null,

        ...(dp.distance !== undefined && { distance: dp.distance }),

        fulfillment: !!dp.fulfillment
    }

    const phones = dp.phones.map((p) => ({
        deliveryPointId: dp.uuid,
        number: p.number,
        additional: p.additional ?? null
    }))

    const officeImages =
        dp.office_image_list?.map((oi) => ({
            deliveryPointId: dp.uuid,
            number: oi.number ?? null,
            url: oi.url
        })) ?? []

    const workTimes = dp.work_time_list.map((wt) => ({
        deliveryPointId: dp.uuid,
        day: wt.day,
        time: wt.time
    }))

    const workTimeExceptions =
        dp.work_time_exception_list?.map((wte) => ({
            deliveryPointId: dp.uuid,
            dateStart: wte.date_start,
            dateEnd: wte.date_end,
            timeStart: wte.time_start ?? null,
            timeEnd: wte.time_end ?? null,
            isWorking: wte.is_working
        })) ?? []

    const dimensions =
        dp.dimensions?.map((d) => ({
            deliveryPointId: dp.uuid,
            height: d.height,
            width: d.width,
            depth: d.depth
        })) ?? []

    const location = {
        deliveryPointId: dp.uuid,
        countryCode: dp.location.country_code,
        regionCode: dp.location.region_code ?? null,
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

    return {
        deliveryPoint,
        phones,
        officeImages,
        workTimes,
        workTimeExceptions,
        dimensions,
        location
    }
}

export const transformDeliveryPointsToPrismaObjectBatch = (dps: CdekDeliveryPoint[]) =>
    dps
        .map((dp) => transformDeliveryPointToPrismaObjects(dp))
        .reduce(
            (acc, item) => ({
                deliveryPoints: [...acc.deliveryPoints, item.deliveryPoint],
                phones: [...acc.phones, ...item.phones],
                officeImages: [...acc.officeImages, ...item.officeImages],
                workTimes: [...acc.workTimes, ...item.workTimes],
                workTimeExceptions: [
                    ...acc.workTimeExceptions,
                    ...item.workTimeExceptions
                ],
                dimensions: [...acc.dimensions, ...item.dimensions],
                locations: [...acc.locations, item.location]
            }),
            {
                deliveryPoints: [] as ReturnType<
                    typeof transformDeliveryPointToPrismaObjects
                >['deliveryPoint'][],
                phones: [] as ReturnType<
                    typeof transformDeliveryPointToPrismaObjects
                >['phones'],
                officeImages: [] as ReturnType<
                    typeof transformDeliveryPointToPrismaObjects
                >['officeImages'],
                workTimes: [] as ReturnType<
                    typeof transformDeliveryPointToPrismaObjects
                >['workTimes'],
                workTimeExceptions: [] as ReturnType<
                    typeof transformDeliveryPointToPrismaObjects
                >['workTimeExceptions'],
                dimensions: [] as ReturnType<
                    typeof transformDeliveryPointToPrismaObjects
                >['dimensions'],
                locations: [] as ReturnType<
                    typeof transformDeliveryPointToPrismaObjects
                >['location'][]
            }
        )
