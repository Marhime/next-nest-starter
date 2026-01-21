import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  private readonly uploadDir = path.join(
    process.cwd(),
    'uploads',
    'properties',
  );
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload and compress a photo for a property
   */
  async uploadPhoto(
    propertyId: number,
    userId: string,
    file: Express.Multer.File,
    editToken?: string,
  ): Promise<any> {
    // Verify property ownership
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (userId) {
      if (property.userId !== userId) {
        throw new NotFoundException(`You do not own this property`);
      }
    } else if (editToken) {
      if ((property as any).editToken !== editToken) {
        throw new NotFoundException(`You do not own this property token`);
      }
    } else {
      // No credentials provided
      throw new NotFoundException(`You do not own this property`);
    }

    // Validate file
    const fileMimeType: string = file.mimetype;
    if (!this.allowedMimeTypes.includes(fileMimeType)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    await this.ensureUploadDirExists();

    // Get current photo count for ordering
    const photoCount = await this.prisma.photo.count({
      where: { propertyId },
    });

    // Generate unique filename
    const filename = `${propertyId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const outputPath = path.join(this.uploadDir, `${filename}.webp`);

    // Compress and convert to WebP
    const fileBuffer: Buffer = file.buffer;
    await sharp(fileBuffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Create thumbnail
    const thumbnailPath = path.join(this.uploadDir, `${filename}-thumb.webp`);
    await sharp(fileBuffer)
      .resize(400, 300, {
        fit: 'cover',
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    // Save to database
    const photo = await this.prisma.photo.create({
      data: {
        propertyId,
        url: `/uploads/properties/${filename}.webp`,
        thumbnailUrl: `/uploads/properties/${filename}-thumb.webp`,
        order: photoCount,
        isPrimary: photoCount === 0, // First photo is primary
      },
    });

    return photo;
  }

  /**
   * Get all photos for a property
   */
  async getPropertyPhotos(
    propertyId: number,
    userId?: string,
    editToken?: string,
  ) {
    // If userId provided, verify ownership

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (userId) {
      if (property.userId !== userId) {
        throw new NotFoundException(
          `Property with ID ${propertyId} not found or you don't have permission to update it`,
        );
      }
    } else if (editToken) {
      if ((property as any).editToken !== editToken) {
        throw new NotFoundException(
          `Property with ID ${propertyId} not found or invalid edit token`,
        );
      }
    } else {
      // No credentials provided
      throw new NotFoundException(
        `Property with ID ${propertyId} not found or you don't have permission to update it`,
      );
    }

    return this.prisma.photo.findMany({
      where: { propertyId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: number, userId?: string, editToken?: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { property: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Verify ownership via userId or editToken
    if (userId) {
      if (photo.property.userId !== userId) {
        throw new BadRequestException('You do not own this property');
      }
    } else if (editToken) {
      if ((photo.property as any).editToken !== editToken) {
        throw new BadRequestException('Invalid edit token');
      }
    } else {
      throw new BadRequestException('You do not own this property');
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), photo.url);
    const thumbnailPath = filePath.replace('.webp', '-thumb.webp');

    try {
      await fs.unlink(filePath);
      await fs.unlink(thumbnailPath);
    } catch (error) {
      console.error('Error deleting files:', error);
    }

    // If this was the primary photo, make the next one primary
    if (photo.isPrimary) {
      const nextPhoto = await this.prisma.photo.findFirst({
        where: {
          propertyId: photo.propertyId,
          id: { not: photoId },
        },
        orderBy: { order: 'asc' },
      });

      if (nextPhoto) {
        await this.prisma.photo.update({
          where: { id: nextPhoto.id },
          data: { isPrimary: true },
        });
      }
    }

    // Delete from database
    await this.prisma.photo.delete({
      where: { id: photoId },
    });

    // Reorder remaining photos
    await this.reorderPhotosAfterDelete(photo.propertyId);

    return { success: true };
  }

  /**
   * Reorder photos
   */
  async reorderPhotos(
    propertyId: number,
    userId: string,
    photoOrders: { photoId: number; order: number }[],
  ) {
    // Verify property ownership
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      console.log('error: reorderPhotos');
      throw new BadRequestException('You do not own this property');
    }

    // Update all photo orders in a transaction
    await this.prisma.$transaction(
      photoOrders.map(({ photoId, order }) =>
        this.prisma.photo.update({
          where: { id: photoId },
          data: { order },
        }),
      ),
    );

    return this.getPropertyPhotos(propertyId, userId, undefined);
  }

  /**
   * Set a photo as primary
   */
  async setPrimaryPhoto(photoId: number, userId?: string, editToken?: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { property: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Verify ownership via userId or editToken
    if (userId) {
      if (photo.property.userId !== userId) {
        throw new BadRequestException('You do not own this property');
      }
    } else if (editToken) {
      if ((photo.property as any).editToken !== editToken) {
        throw new BadRequestException('Invalid edit token');
      }
    } else {
      throw new BadRequestException('You do not own this property');
    }

    // Remove primary from all photos of this property
    await this.prisma.photo.updateMany({
      where: { propertyId: photo.propertyId },
      data: { isPrimary: false },
    });

    // Set this photo as primary
    await this.prisma.photo.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });

    return this.getPropertyPhotos(photo.propertyId, userId, editToken);
  }

  /**
   * Reorder photos after deletion
   */
  private async reorderPhotosAfterDelete(propertyId: number) {
    const photos = await this.prisma.photo.findMany({
      where: { propertyId },
      orderBy: { order: 'asc' },
    });

    await this.prisma.$transaction(
      photos.map((photo, index) =>
        this.prisma.photo.update({
          where: { id: photo.id },
          data: { order: index },
        }),
      ),
    );
  }
}
