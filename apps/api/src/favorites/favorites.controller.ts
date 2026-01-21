import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Session } from '@/auth';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Session() session: { user: { id: string } }) {
    return this.favoritesService.findAll(session.user.id);
  }

  @Get('count')
  count(@Session() session: { user: { id: string } }) {
    return this.favoritesService.count(session.user.id);
  }

  @Get('check/:propertyId')
  checkFavorite(
    @Session() session: { user: { id: string } },
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ) {
    return this.favoritesService.isFavorited(session.user.id, propertyId);
  }

  @Post(':propertyId')
  add(
    @Session() session: { user: { id: string } },
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ) {
    return this.favoritesService.add(session.user.id, propertyId);
  }

  @Delete(':propertyId')
  remove(
    @Session() session: { user: { id: string } },
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ) {
    return this.favoritesService.remove(session.user.id, propertyId);
  }
}
