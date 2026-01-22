import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateSavedSearchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}
