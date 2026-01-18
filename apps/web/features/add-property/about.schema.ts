// about-property.schema.ts
import { z } from 'zod';

/* ---------------------------------------------
 * ENUMS
 * -------------------------------------------- */

export const PropertyTypes = ['HOUSE', 'APARTMENT', 'LAND'] as const;
export const ListingTypes = ['RENT', 'SALE'] as const;

export const PropertyTypeEnum = z.enum(PropertyTypes);
export const ListingTypeEnum = z.enum(ListingTypes);
export const StatusEnum = z.enum([
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'RENTED',
  'SOLD',
]);

/* ---------------------------------------------
 * HELPERS
 * -------------------------------------------- */

const optionalNumber = z
  .union([z.coerce.number(), z.literal('')])
  .transform((v) => (v === '' || Number.isNaN(v) ? undefined : v))
  .optional();

/* ---------------------------------------------
 * SCHEMA
 * -------------------------------------------- */

export const AboutPropertySchema = z
  .object({
    propertyType: PropertyTypeEnum,
    listingType: ListingTypeEnum,

    price: z.coerce.number().positive(),

    bedrooms: optionalNumber,
    bathrooms: optionalNumber,
    landSurface: optionalNumber,

    amenities: z.array(z.string()).optional(),
    status: StatusEnum,
  })
  .superRefine((data, ctx) => {
    /* LAND → landSurface obligatoire */
    if (data.propertyType === 'LAND') {
      if (!data.landSurface || data.landSurface <= 0) {
        ctx.addIssue({
          path: ['landSurface'],
          message: 'Land surface is required',
          code: z.ZodIssueCode.custom,
        });
      }
    }

    /* HOUSE / APARTMENT → bedrooms & bathrooms obligatoires */
    if (data.propertyType !== 'LAND') {
      if (!data.bedrooms || data.bedrooms <= 0) {
        ctx.addIssue({
          path: ['bedrooms'],
          message: 'Bedrooms required',
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.bathrooms || data.bathrooms <= 0) {
        ctx.addIssue({
          path: ['bathrooms'],
          message: 'Bathrooms required',
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

/* ---------------------------------------------
 * TYPE (AUTO — JAMAIS MANUEL)
 * -------------------------------------------- */

export type AboutPropertyForm = z.infer<typeof AboutPropertySchema>;
