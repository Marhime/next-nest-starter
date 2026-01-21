import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all favorites for a user with property details
   */
  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => fav.property);
  }

  /**
   * Add a property to favorites
   */
  async add(userId: string, propertyId: number) {
    // Check if property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Property is already in favorites');
    }

    // Add to favorites
    await this.prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });

    return { message: 'Added to favorites', propertyId };
  }

  /**
   * Remove a property from favorites
   */
  async remove(userId: string, propertyId: number) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    return { message: 'Removed from favorites', propertyId };
  }

  /**
   * Check if a property is favorited by user
   */
  async isFavorited(userId: string, propertyId: number): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    return !!favorite;
  }

  /**
   * Get favorites count for a user
   */
  async count(userId: string): Promise<number> {
    return this.prisma.favorite.count({
      where: { userId },
    });
  }
}
