// src/properties/properties.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from '@/src/properties/dto/create-property.dto';
import { UpdatePropertyDto } from '@/src/properties/dto/update-property.dto';
import { QueryPropertyDto } from '@/src/properties/dto/query-property.dto';
import { CreatePropertyMinimalDto } from '@/src/properties/dto/create-property-minimal.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PropertyStatus, Currency } from '@/generated/prisma';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une propriété avec données complètes
   * @deprecated Utiliser createMinimal pour l'initialisation, puis update pour compléter
   */
  async create(createPropertyDto: CreatePropertyDto, userId: string) {
    const { amenities, ...data } = createPropertyDto;

    // Valider que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.property.create({
      data: {
        ...data,
        userId,
        amenities: amenities || [],
        status: data.status || PropertyStatus.ACTIVE,
        currency: data.currency || Currency.MXN,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        photos: true,
      },
    });
  }

  /**
   * Créer une propriété minimale (seulement le type)
   * Recommandé pour l'initialisation rapide
   */
  async createMinimal(
    createPropertyMinimalDto: CreatePropertyMinimalDto,
    userId: string,
  ) {
    // Valider que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Générer un titre par défaut basé sur le type de propriété
    const defaultTitles = {
      HOUSE: 'New House',
      APARTMENT: 'New Apartment',
      LAND: 'New Land',
      HOTEL: 'New Hotel',
      HOSTEL: 'New Hostel',
      GUESTHOUSE: 'New Guesthouse',
      ROOM: 'New Room',
    };

    // Créer la propriété avec des valeurs par défaut
    return this.prisma.property.create({
      data: {
        userId,
        propertyType: createPropertyMinimalDto.propertyType,
        title: defaultTitles[createPropertyMinimalDto.propertyType],
        status: PropertyStatus.ACTIVE,
        currency: Currency.MXN,
        amenities: [],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        photos: true,
      },
    });
  }

  async findAll(query: QueryPropertyDto) {
    const {
      propertyType,
      listingType,
      city,
      state,
      minPrice,
      maxPrice,
      minBedrooms,
      status,
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.PropertyWhereInput = {
      ...(propertyType && { propertyType }),
      ...(listingType && { listingType }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
      ...(status && { status }),
      ...(minBedrooms && { bedrooms: { gte: minBedrooms } }),
    };

    // Price filtering based on listing type
    if (minPrice || maxPrice) {
      const priceFilter: any = {};

      if (listingType === 'SHORT_TERM') {
        if (minPrice) priceFilter.gte = minPrice;
        if (maxPrice) priceFilter.lte = maxPrice;
        where.nightlyPrice = priceFilter;
      } else if (listingType === 'LONG_TERM') {
        if (minPrice) priceFilter.gte = minPrice;
        if (maxPrice) priceFilter.lte = maxPrice;
        where.monthlyPrice = priceFilter;
      } else if (listingType === 'SALE') {
        if (minPrice) priceFilter.gte = minPrice;
        if (maxPrice) priceFilter.lte = maxPrice;
        where.salePrice = priceFilter;
      }
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          photos: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              reservations: true,
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        photos: {
          orderBy: { order: 'asc' },
        },
        availabilities: {
          where: {
            startDate: { gte: new Date() },
          },
          orderBy: { startDate: 'asc' },
        },
        _count: {
          select: {
            reservations: true,
            favorites: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
    userId?: string,
  ) {
    const property = await this.findOne(id);

    // Si un userId est fourni, vérifier que l'utilisateur est bien le propriétaire
    if (userId && property.userId !== userId) {
      throw new NotFoundException(
        `Property with ID ${id} not found or you don't have permission to update it`,
      );
    }

    const { amenities, ...data } = updatePropertyDto;

    return this.prisma.property.update({
      where: { id },
      data: {
        ...data,
        ...(amenities && { amenities }),
        updatedAt: new Date(), // Mettre à jour explicitement le timestamp
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        photos: true,
      },
    });
  }

  async remove(id: number, userId?: string) {
    const property = await this.findOne(id);

    // Si un userId est fourni, vérifier que l'utilisateur est bien le propriétaire
    if (userId && property.userId !== userId) {
      throw new NotFoundException(
        `Property with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    return this.prisma.property.delete({
      where: { id },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.property.findMany({
      where: { userId },
      include: {
        photos: {
          where: { isPrimary: true },
        },
        _count: {
          select: {
            reservations: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
  ) {
    // Calculate rough bounding box
    const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
    const lonDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    return this.prisma.property.findMany({
      where: {
        latitude: {
          gte: latitude - latDelta,
          lte: latitude + latDelta,
        },
        longitude: {
          gte: longitude - lonDelta,
          lte: longitude + lonDelta,
        },
        status: 'ACTIVE',
      },
      include: {
        photos: {
          where: { isPrimary: true },
        },
      },
    });
  }
}
