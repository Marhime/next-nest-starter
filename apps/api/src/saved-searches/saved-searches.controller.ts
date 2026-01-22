import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('saved-searches')
@UseGuards(AuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Post()
  create(
    @Body() createDto: CreateSavedSearchDto,
    @Session() session: UserSession,
  ) {
    return this.savedSearchesService.create(session.user.id, createDto);
  }

  @Get()
  findAll(@Session() session: UserSession) {
    return this.savedSearchesService.findAll(session.user.id);
  }

  @Get('count')
  count(@Session() session: UserSession) {
    return this.savedSearchesService.count(session.user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Session() session: UserSession,
  ) {
    return this.savedSearchesService.findOne(id, session.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSavedSearchDto,
    @Session() session: UserSession,
  ) {
    return this.savedSearchesService.update(id, session.user.id, updateDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Session() session: UserSession,
  ) {
    return this.savedSearchesService.remove(id, session.user.id);
  }
}
