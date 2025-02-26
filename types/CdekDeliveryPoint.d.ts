export interface CdekDeliveryPoint {
    uuid: string

    code: string
    name: string
    address_comment?: string
    nearest_station?: string
    nearest_metro_station?: string
    work_time: string

    phones: {
        number: string
        additional?: string
    }[]

    email?: string
    note?: string
    type: string
    owner_code: string

    take_only: boolean
    is_handout: boolean
    is_reception: boolean
    is_dressing_room: boolean
    is_marketplace?: boolean
    is_ltl?: boolean
    have_cashless: boolean
    have_cash: boolean
    have_fast_payment_system: boolean
    allowed_cod: boolean

    site?: string

    office_image_list?: {
        number?: number
        url: string
    }[]

    work_time_list: {
        day: number
        time: string
    }[]

    work_time_exception_list?: {
        date_start: string
        date_end: string
        time_start?: string
        time_end?: string
        is_working: boolean
    }[]

    weight_max?: number
    weight_min?: number

    dimensions?: {
        height: number
        width: number
        depth: number
    }[]

    location: {
        country_code: string
        region_code: number
        region?: string
        city_code: number
        city: string
        fias_guid?: string
        postal_code?: string
        longitude: number
        latitude: number
        address: string
        address_full: string
        city_uuid?: string
    }

    distance?: number

    fulfillment: boolean
}
