import z from 'zod';

// Enums matching Prisma schema
export const PropertyTypeEnum = z.enum([
  'HOTEL',
  'HOSTEL',
  'GUESTHOUSE',
  'HOUSE',
  'APARTMENT',
  'LAND',
  'ROOM',
]);

export const ListingTypeEnum = z.enum(['SHORT_TERM', 'LONG_TERM', 'SALE']);

export const CurrencyEnum = z.enum(['MXN', 'USD']);

export const PropertyStatusEnum = z.enum([
  'ACTIVE',
  'RENTED',
  'SOLD',
  'INACTIVE',
]);

export const addPropertySchema = z.object({
  // Required fields
  propertyType: PropertyTypeEnum,
  listingType: ListingTypeEnum,
  title: z.string().min(1, 'Title is required').max(255),

  // Optional fields
  description: z.string().max(5000).optional(),

  // Pricing (conditional based on listing type)
  monthlyPrice: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .optional(),
  nightlyPrice: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .optional(),
  salePrice: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .optional(),
  currency: CurrencyEnum.default('MXN'),

  // Location
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  latitude: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .optional(),
  longitude: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .optional(),

  // Property details
  area: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  capacity: z.number().int().min(1).optional(), // for hotels/hostels
  floor: z.number().int().optional(),

  // Amenities as JSON
  amenities: z.record(z.string(), z.any()).or(z.array(z.string())).optional(),

  // Status and availability
  status: PropertyStatusEnum.default('ACTIVE'),
  availableFrom: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .optional(),
});

export type AddPropertySchema = z.infer<typeof addPropertySchema>;
