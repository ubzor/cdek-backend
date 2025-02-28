import { z } from 'zod'
import { zu } from 'zod_utilz'

export const validateObject = <T extends z.AnyZodObject>(schema: T, object: any) => {
    const { data, error } = zu.SPR(schema.safeParse(object))

    return {
        data: data as z.infer<T>,
        error: error ? { ...error, message: JSON.parse(error.message) } : undefined
    }
}

const transformStringToFloat = (value: string, context: z.RefinementCtx) => {
    const parsed = parseFloat(value)

    if (isNaN(parsed)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Not a number'
        })

        // This is a special symbol you can use to
        // return early from the transform function.
        // It has type `never` so it does not affect the
        // inferred return type.
        return z.NEVER
    }

    return parsed
}

export const longitudeValidationSchema = z
    .string()
    .transform(transformStringToFloat)
    .refine((value) => value >= -180 && value <= 180, 'Must be between -180 and 180')

export const latitudeValidationSchema = z
    .string()
    .transform(transformStringToFloat)
    .refine((value) => value >= -90 && value <= 90, 'Must be between -90 and 90')

export const boundingBoxValidationSchema = z.object({
    minLongitude: longitudeValidationSchema,
    maxLongitude: longitudeValidationSchema,
    minLatitude: latitudeValidationSchema,
    maxLatitude: latitudeValidationSchema
})

export const uuidValidationSchema = z.string().uuid('Must be valid uuid')

export const deliveryPointValidationSchema = z.object({
    uuid: uuidValidationSchema
})

export const deliveryPointsValidationSchema = z.object({
    uuids: z.array(uuidValidationSchema)
})
