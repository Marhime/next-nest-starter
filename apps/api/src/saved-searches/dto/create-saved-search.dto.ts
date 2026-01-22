import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateSavedSearchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  filters: Record<string, any>;
}
