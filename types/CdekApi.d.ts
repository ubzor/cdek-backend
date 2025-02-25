import type { CdekDeliveryPoint } from './CdekDeliveryPoint'

export declare class CdekApi {
    constructor(cdekClientId: string, cdekApiSecret: string)

    getDeliveryPoints(): Promise<CdekDeliveryPoint[]>
}
