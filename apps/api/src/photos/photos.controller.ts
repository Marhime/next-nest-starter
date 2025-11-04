import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';

@ApiTags('photos')
@Controller('photos')
@UseGuards(AuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('property/:propertyId')
  @ApiOperation({ summary: 'Upload a photo for a property' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadPhoto(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: UserSession,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.photosService.uploadPhoto(propertyId, session.user.id, file);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all photos for a property' })
  async getPropertyPhotos(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Session() session: UserSession,
  ) {
    return this.photosService.getPropertyPhotos(propertyId, session.user?.id);
  }

  @Delete(':photoId')
  @ApiOperation({ summary: 'Delete a photo' })
  async deletePhoto(
    @Param('photoId', ParseIntPipe) photoId: number,
    @Session() session: UserSession,
  ) {
    return this.photosService.deletePhoto(photoId, session.user.id);
  }

  @Patch('property/:propertyId/reorder')
  @ApiOperation({ summary: 'Reorder photos' })
  async reorderPhotos(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() body: { photos: { photoId: number; order: number }[] },
    @Session() session: UserSession,
  ) {
    return this.photosService.reorderPhotos(
      propertyId,
      session.user.id,
      body.photos,
    );
  }

  @Patch(':photoId/primary')
  @ApiOperation({ summary: 'Set a photo as primary' })
  async setPrimaryPhoto(
    @Param('photoId', ParseIntPipe) photoId: number,
    @Session() session: UserSession,
  ) {
    return this.photosService.setPrimaryPhoto(photoId, session.user.id);
  }
}
