import { z } from 'zod'

export const validateObject = async <T extends z.AnyZodObject>(
    schema: T,
    object: any
) => {
    const { zu } = await import('zod_utilz')

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

export const booleanValidationSchema = z.string().transform((value, context) => {
    if (value === 'true') return true
    if (value === 'false') return false

    context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Not a boolean'
    })

    return z.NEVER
})

export const boundingBoxValidationSchema = z.object({
    minLongitude: longitudeValidationSchema,
    maxLongitude: longitudeValidationSchema,
    minLatitude: latitudeValidationSchema,
    maxLatitude: latitudeValidationSchema,

    isPickupPoint: booleanValidationSchema.optional(),
    isPostamat: booleanValidationSchema.optional(),
    hasCash: booleanValidationSchema.optional(),
    hasCard: booleanValidationSchema.optional(),
    hasFittingRoom: booleanValidationSchema.optional()
})

export const codeValidationSchema = z.object({
    code: z.string().min(1),
    allFields: booleanValidationSchema.optional()
})

export const uuidValidationSchema = z.string().uuid('Must be valid uuid')

export const deliveryPointIdValidationSchema = z.object({
    uuid: uuidValidationSchema,
    allFields: booleanValidationSchema.optional()
})

export const deliveryPointsValidationSchema = z.object({
    uuids: z.union([uuidValidationSchema, z.array(uuidValidationSchema)])
})
