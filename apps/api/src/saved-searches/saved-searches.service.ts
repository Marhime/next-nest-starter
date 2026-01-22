import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';

@Injectable()
export class SavedSearchesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateSavedSearchDto) {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        name: createDto.name,
        filters: createDto.filters,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: string) {
    const savedSearch = await this.prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!savedSearch) {
      throw new NotFoundException(`Saved search with ID ${id} not found`);
    }

    if (savedSearch.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this saved search',
      );
    }

    return savedSearch;
  }

  async update(id: number, userId: string, updateDto: UpdateSavedSearchDto) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.savedSearch.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.savedSearch.delete({
      where: { id },
    });
  }

  async count(userId: string) {
    return this.prisma.savedSearch.count({
      where: { userId },
    });
  }
}
