import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@/generated/prisma';

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
}
