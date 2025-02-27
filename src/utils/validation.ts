import { z } from 'zod'
import { zu } from 'zod_utilz'

export const validateObject = <T extends z.AnyZodObject>(schema: T, object: any) => {
    const { data, error } = zu.SPR(schema.safeParse(object))

    return {
        data: data as z.infer<T>,
        error: error ? { ...error, message: JSON.parse(error.message) } : undefined
    }
}

export const latitudeLongitudeValidationSchema = z
    .string()
    .transform((value, context) => {
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
    })
    .refine((value) => value >= -180 && value <= 180, 'Must be between -180 and 180')

export const boundingBoxValidationSchema = z.object({
    minLongitude: latitudeLongitudeValidationSchema,
    maxLongitude: latitudeLongitudeValidationSchema,
    minLatitude: latitudeLongitudeValidationSchema,
    maxLatitude: latitudeLongitudeValidationSchema
})

export const uuidValidationSchema = z.string().uuid('Must be valid uuid')

export const deliveryPointValidationSchema = z.object({
    uuid: uuidValidationSchema
})

export const deliveryPointsValidationSchema = z.object({
    uuids: z.array(uuidValidationSchema)
})
