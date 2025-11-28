// src/properties/properties.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from '@/src/properties/dto/create-property.dto';
import { UpdatePropertyDto } from '@/src/properties/dto/update-property.dto';
import { QueryPropertyDto } from '@/src/properties/dto/query-property.dto';
import { CreatePropertyMinimalDto } from '@/src/properties/dto/create-property-minimal.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  PropertyStatus,
  Currency,
} from '../../generated/prisma/client';

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
        status: data.status || PropertyStatus.DRAFT, // Par défaut en brouillon
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
        status: PropertyStatus.DRAFT, // Les nouvelles propriétés sont en brouillon
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
      // Default to ACTIVE if no status specified (for public searches)
      status: status || PropertyStatus.ACTIVE,
      ...(minBedrooms && { bedrooms: { gte: minBedrooms } }),
    };

    // Price filtering based on listing type
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};

      // Convert to Decimal for Prisma
      if (minPrice !== undefined) priceFilter.gte = String(minPrice);
      if (maxPrice !== undefined) priceFilter.lte = String(maxPrice);

      if (listingType === 'SHORT_TERM') {
        where.nightlyPrice = priceFilter;
      } else if (listingType === 'RENT') {
        where.monthlyPrice = priceFilter;
      } else if (listingType === 'SALE') {
        where.salePrice = priceFilter;
      } else {
        // If no listingType specified, search across all price types (OR condition)
        where.OR = [
          { nightlyPrice: priceFilter },
          { monthlyPrice: priceFilter },
          { salePrice: priceFilter },
        ];
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

  /**
   * Valider si une propriété peut être publiée
   * Retourne un objet avec isValid et les champs manquants
   */
  async validatePropertyForPublishing(id: number, userId: string) {
    const property = await this.findOne(id);

    // Vérifier la propriété
    if (property.userId !== userId) {
      throw new NotFoundException(
        `Property with ID ${id} not found or you don't have permission to access it`,
      );
    }

    const missingFields: string[] = [];
    const requiredFields: Record<string, any> = {
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
    };

    // Vérifier qu'au moins un type de prix est défini
    if (
      !property.monthlyPrice &&
      !property.nightlyPrice &&
      !property.salePrice
    ) {
      missingFields.push('price (monthly, nightly, or sale price required)');
    }

    // Vérifier les champs requis de base
    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value) {
        missingFields.push(field);
      }
    });

    // Pour les locations et ventes, certains champs sont requis
    if (property.listingType) {
      const locationRequiredFields: Record<string, any> = {
        address: property.address,
        city: property.city,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
      };

      Object.entries(locationRequiredFields).forEach(([field, value]) => {
        if (!value) {
          missingFields.push(field);
        }
      });
    }

    // Au moins une photo est requise
    if (!property.photos || property.photos.length === 0) {
      missingFields.push('photos (at least one photo required)');
    }

    const isValid = missingFields.length === 0;

    return {
      isValid,
      missingFields,
      canPublish: isValid,
    };
  }

  /**
   * Publier une propriété (passer de DRAFT à ACTIVE)
   */
  async publishProperty(id: number, userId: string) {
    // Valider d'abord
    const validation = await this.validatePropertyForPublishing(id, userId);

    if (!validation.isValid) {
      throw new Error(
        `Cannot publish property. Missing required fields: ${validation.missingFields.join(', ')}`,
      );
    }

    // Mettre à jour le statut
    return this.prisma.property.update({
      where: { id },
      data: {
        status: PropertyStatus.ACTIVE,
        updatedAt: new Date(),
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
   * Remettre une propriété en brouillon
   */
  async unpublishProperty(id: number, userId: string) {
    const property = await this.findOne(id);

    if (property.userId !== userId) {
      throw new NotFoundException(
        `Property with ID ${id} not found or you don't have permission to modify it`,
      );
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        status: PropertyStatus.DRAFT,
        updatedAt: new Date(),
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

  /**
   * Search properties within exact map bounds (no radius extension)
   * Optimized for map-based search with debouncing
   */
  async searchInBounds(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      latitude: {
        gte: bounds.south,
        lte: bounds.north,
      },
      longitude: {
        gte: bounds.west,
        lte: bounds.east,
      },
      status: 'ACTIVE',
    };

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          photos: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
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
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all property markers (id, lat, lng, price) within bounds for map display
   * Returns lightweight data for all properties (no pagination)
   */
  async getMapMarkers(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) {
    const properties = await this.prisma.property.findMany({
      where: {
        latitude: {
          gte: bounds.south,
          lte: bounds.north,
        },
        longitude: {
          gte: bounds.west,
          lte: bounds.east,
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        salePrice: true,
        monthlyPrice: true,
        nightlyPrice: true,
        listingType: true,
        propertyType: true,
      },
    });

    return properties;
  }
}
