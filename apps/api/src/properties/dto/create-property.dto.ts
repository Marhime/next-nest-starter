import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Currency,
  ListingType,
  PropertyStatus,
  PropertyType,
} from '../../../generated/prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ description: 'Owner ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ enum: ListingType })
  @IsOptional()
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ description: 'Property title' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.MXN })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Country code (ISO 3166-1 alpha-2)',
    default: 'MX',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Area in m²' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  floor?: number;

  @ApiPropertyOptional({
    description: 'List of amenities',
    example: ['wifi', 'parking', 'pool', 'air_conditioning'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.DRAFT })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: 'Année de construction' })
  @IsOptional()
  @IsInt()
  constructionYear?: number;

  @ApiPropertyOptional({ description: 'Surface du terrain (m²)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  landSurface?: number;

  // edit token
  @ApiPropertyOptional({ description: 'Edit token for unauthenticated edits' })
  @IsOptional()
  @IsString()
  editToken?: string;
}
