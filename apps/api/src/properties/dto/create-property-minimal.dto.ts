import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType, ListingType } from '../../../generated/prisma/client';

/**
 * DTO minimal pour créer une propriété avec uniquement le type
 * Utilisé pour l'initialisation rapide depuis le frontend
 */
export class CreatePropertyMinimalDto {
  @ApiProperty({
    enum: PropertyType,
    description: 'Type of property to create',
    example: 'HOUSE',
  })
  @IsEnum(PropertyType, {
    message: 'propertyType must be a valid PropertyType enum value',
  })
  propertyType: PropertyType;

  @ApiProperty({
    enum: ListingType,
    description: 'Optional listing type (SALE, RENT, SHORT_TERM)',
    required: false,
  })
  @IsOptional()
  @IsEnum(ListingType, {
    message: 'listingType must be a valid ListingType enum value',
  })
  listingType?: ListingType;
}
