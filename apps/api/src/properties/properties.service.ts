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
import { randomUUID } from 'node:crypto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une propriété avec données complètes
   * @deprecated Utiliser createMinimal pour l'initialisation, puis update pour compléter
   */
  async create(createPropertyDto: CreatePropertyDto, userId?: string) {
    const { amenities, ...data } = createPropertyDto;

    // Générer un edit token pour permettre l'édition sans compte
    const editToken = randomUUID();

    // Si userId est fourni, vérifier que l'utilisateur existe
    let owner = null;
    if (userId) {
      owner = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!owner) {
        throw new NotFoundException(`User avec l'ID ${userId} introuvable`);
      }
    }

    const created = await this.prisma.property.create({
      data: {
        ...data,
        // n'ajouter userId dans la création que s'il est présent
        ...(userId && { userId }),
        editToken,
        amenities: amenities || [],
        status: data.status || PropertyStatus.DRAFT, // Par défaut en brouillon
        currency: data.currency || Currency.MXN,
      } as any,
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

    // Si création anonyme, retourner aussi le token pour que le créateur puisse l'enregistrer
    if (!userId) {
      return {
        property: this.sanitizeProperty(created),
        editToken,
      };
    }

    // Pour les créations authentifiées, ne jamais exposer l'editToken
    return this.sanitizeProperty(created);
  }

  /**
   * Créer une propriété minimale (seulement le type)
   * Recommandé pour l'initialisation rapide
   */
  async createMinimal(
    createPropertyMinimalDto: CreatePropertyMinimalDto,
    userId?: string,
  ) {
    // Valider que l'utilisateur existe si fourni
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    }

    // Générer un titre par défaut basé sur le type de propriété
    const defaultTitles = {
      HOUSE: 'Nueva casa',
      APARTMENT: 'Nuevo departamento',
      LAND: 'Nuevo terreno',
    };

    // Générer un edit token pour les créations anonymes
    const editToken = !userId ? randomUUID() : undefined;

    // Créer la propriété avec des valeurs par défaut
    const created = await this.prisma.property.create({
      data: {
        ...(userId && { userId }),
        ...(editToken && { editToken }),
        propertyType: createPropertyMinimalDto.propertyType,
        ...(createPropertyMinimalDto.listingType && {
          listingType: createPropertyMinimalDto.listingType,
        }),
        title: defaultTitles[createPropertyMinimalDto.propertyType],
        status: PropertyStatus.DRAFT, // Les nouvelles propriétés sont en brouillon
        currency: Currency.MXN,
        amenities: [],
      } as any,
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

    if (editToken) {
      return {
        property: this.sanitizeProperty(created),
        editToken,
      };
    }

    return this.sanitizeProperty(created);
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
      maxBedrooms,
      minBathrooms,
      minArea,
      maxArea,
      amenities,
      status,
      page = 1,
      limit = 20,
    } = query;

    // 🔍 Debug: Log received filters
    console.log('🔍 [findAll] Received filters:', {
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      minBedrooms,
      minBathrooms,
    });

    const where: Prisma.PropertyWhereInput = {
      ...(propertyType && { propertyType }),
      ...(listingType && { listingType }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
      // Default to ACTIVE if no status specified (for public searches)
      status: status || PropertyStatus.ACTIVE,
    };

    // 🔍 Debug: Log constructed where clause
    console.log('🔍 [findAll] Where clause:', JSON.stringify(where, null, 2));

    // Bedrooms filtering
    if (minBedrooms !== undefined || maxBedrooms !== undefined) {
      where.bedrooms = {};
      if (minBedrooms !== undefined) where.bedrooms.gte = minBedrooms;
      if (maxBedrooms !== undefined) where.bedrooms.lte = maxBedrooms;
    }

    // Bathrooms filtering
    if (minBathrooms !== undefined) {
      where.bathrooms = { gte: minBathrooms };
    }

    // Area filtering
    if (minArea !== undefined || maxArea !== undefined) {
      where.area = {};
      if (minArea !== undefined) where.area.gte = String(minArea);
      if (maxArea !== undefined) where.area.lte = String(maxArea);
    }

    // Amenities filtering (property must have ALL specified amenities)
    if (amenities && amenities.length > 0) {
      // Use AND to ensure property has all amenities
      where.AND = amenities.map((amenity) => ({
        amenities: {
          path: '$',
          array_contains: [amenity],
        },
      }));
    }

    // Price filtering based on listing type
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};

      // Convert to Decimal for Prisma
      if (minPrice !== undefined) priceFilter.gte = String(minPrice);
      if (maxPrice !== undefined) priceFilter.lte = String(maxPrice);

      where.price = priceFilter;
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
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties.map((p) => this.sanitizeProperty(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Internal: fetch property including secret fields (editToken) for server-side checks
  private async getPropertyRaw(id: number) {
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
        _count: {
          select: {
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

  // Public: sanitized property without secret fields (editToken)
  async findOne(id: number) {
    const prop = await this.getPropertyRaw(id);
    return this.sanitizeProperty(prop);
  }

  // Allow update with either owner userId or editToken
  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
    userId?: string,
    editToken?: string,
  ) {
    // Need raw property (contains editToken and userId)
    const property = await this.getPropertyRaw(id);

    // Authorization: either matching userId or matching editToken is required
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

    const {
      amenities,
      firstName,
      lastName,
      phone,
      price,
      latitude,
      longitude,
      area,
      landSurface,
      ...data
    } = updatePropertyDto;

    // Prepare property update data
    const propertyUpdateData: any = {
      ...data,
      ...(amenities && { amenities }),
      updatedAt: new Date(),
    };

    // Convert Decimal fields (Prisma requires string for Decimal type)
    if (price !== undefined)
      propertyUpdateData.price = price ? String(price) : null;
    if (latitude !== undefined)
      propertyUpdateData.latitude = latitude ? String(latitude) : null;
    if (longitude !== undefined)
      propertyUpdateData.longitude = longitude ? String(longitude) : null;
    if (area !== undefined)
      propertyUpdateData.area = area ? String(area) : null;
    if (landSurface !== undefined)
      propertyUpdateData.landSurface = landSurface ? String(landSurface) : null;

    // Always store contact info on property
    if (firstName !== undefined) propertyUpdateData.firstName = firstName;
    if (lastName !== undefined) propertyUpdateData.lastName = lastName;
    if (phone !== undefined) propertyUpdateData.phone = phone;

    // If authenticated user and contact info provided, also sync to user profile
    if (
      userId &&
      (firstName !== undefined || lastName !== undefined || phone !== undefined)
    ) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(phone !== undefined && { phone }),
        },
      });
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: propertyUpdateData,
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

    return this.sanitizeProperty(updated);
  }

  async remove(id: number, userId?: string, editToken?: string) {
    // Use raw because findOne sanitizes editToken
    const property = await this.getPropertyRaw(id);

    // Authorization: either matching userId or matching editToken is required
    if (userId) {
      if (property.userId !== userId) {
        throw new NotFoundException(
          `Property with ID ${id} not found or you don't have permission to delete it`,
        );
      }
    } else if (editToken) {
      if ((property as any).editToken !== editToken) {
        throw new NotFoundException(
          `Property with ID ${id} not found or invalid edit token`,
        );
      }
    } else {
      throw new NotFoundException(
        `Property with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    return this.prisma.property.delete({ where: { id } });
  }

  /**
   * Valider si une propriété peut être publiée
   * Retourne un objet avec isValid et les champs manquants
   */
  async validatePropertyForPublishing(id: number, userId: string) {
    const property = await this.getPropertyRaw(id);

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
    if (!property.price) {
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
    const updated = await this.prisma.property.update({
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

    return this.sanitizeProperty(updated);
  }

  /**
   * Remettre une propriété en brouillon
   */
  async unpublishProperty(id: number, userId: string) {
    const property = await this.getPropertyRaw(id);

    if (property.userId !== userId) {
      throw new NotFoundException(
        `Property with ID ${id} not found or you don't have permission to modify it`,
      );
    }

    const updated = await this.prisma.property.update({
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

    return this.sanitizeProperty(updated);
  }

  async findByUser(userId: string) {
    const properties = await this.prisma.property.findMany({
      where: { userId },
      include: {
        photos: {
          where: { isPrimary: true },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map((p) => this.sanitizeProperty(p));
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
      data: properties.map((p) => this.sanitizeProperty(p)),
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
        listingType: true,
        propertyType: true,
      },
    });

    return properties;
  }

  // Utility: remove sensitive/internal-only fields before exposing to API clients
  private sanitizeProperty(property: any) {
    if (!property) return property;

    // Clone to avoid mutating original object returned by Prisma client
    const clone = JSON.parse(JSON.stringify(property));
    if (Object.prototype.hasOwnProperty.call(clone, 'editToken')) {
      delete clone.editToken;
    }
    return clone;
  }
}
