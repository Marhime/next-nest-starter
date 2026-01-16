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
  Headers,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import {
  AllowAnonymous,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@ApiTags('photos')
@Controller('photos')
@UseGuards(RateLimitGuard)
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
  @AllowAnonymous()
  async uploadPhoto(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: UserSession,
    @Headers('x-edit-token') editToken?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    console.log(editToken);

    return this.photosService.uploadPhoto(
      propertyId,
      session?.user?.id,
      file,
      editToken,
    );
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all photos for a property' })
  @AllowAnonymous()
  async getPropertyPhotos(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Session() session: UserSession,
    @Headers('x-edit-token') editToken?: string,
  ) {
    return this.photosService.getPropertyPhotos(
      propertyId,
      session?.user?.id,
      editToken,
    );
  }

  @Delete(':photoId')
  @ApiOperation({ summary: 'Delete a photo' })
  @AllowAnonymous()
  async deletePhoto(
    @Param('photoId', ParseIntPipe) photoId: number,
    @Session() session: UserSession,
  ) {
    return this.photosService.deletePhoto(photoId, session?.user?.id);
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
