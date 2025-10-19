// src/properties/properties.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from '@/src/properties/dto/create-property.dto';
import { UpdatePropertyDto } from '@/src/properties/dto/update-property.dto';
import { QueryPropertyDto } from '@/src/properties/dto/query-property.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@/generated/prisma';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto) {
    const { amenities, ...data } = createPropertyDto;

    return this.prisma.property.create({
      data: {
        ...data,
        amenities: amenities || [],
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

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    await this.findOne(id); // Check if exists

    const { amenities, ...data } = updatePropertyDto;

    return this.prisma.property.update({
      where: { id },
      data: {
        ...data,
        ...(amenities && { amenities }),
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

  async remove(id: number) {
    await this.findOne(id); // Check if exists

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
