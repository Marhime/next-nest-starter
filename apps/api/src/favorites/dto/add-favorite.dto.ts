import { IsInt, IsPositive } from 'class-validator';

export class AddFavoriteDto {
  @IsInt()
  @IsPositive()
  propertyId: number;
}
