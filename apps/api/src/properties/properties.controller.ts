// src/properties/properties.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyMinimalDto } from '@/src/properties/dto/create-property-minimal.dto';
import { UpdatePropertyDto } from '@/src/properties/dto/update-property.dto';
import { QueryPropertyDto } from '@/src/properties/dto/query-property.dto';
import {
  AllowAnonymous,
  AuthGuard,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';
import { RateLimitGuard } from '@/src/common/guards/rate-limit.guard';

@ApiTags('properties')
@Controller('properties')
@UseGuards(AuthGuard, RateLimitGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new property (minimal)',
    description:
      'Creates a property with only the type. Use PATCH to complete the property details later.',
  })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createPropertyDto: CreatePropertyMinimalDto,
    @Session() session: UserSession,
  ) {
    return this.propertiesService.createMinimal(
      createPropertyDto,
      session.user.id,
    );
  }

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get all properties with filters' })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
  })
  findAll(@Query() query: QueryPropertyDto) {
    return this.propertiesService.findAll(query);
  }

  @Get('nearby')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Search properties within exact map bounds with pagination',
    description:
      'Fetches properties within exact map bounds (no radius extension) with pagination for infinite scroll',
  })
  @ApiQuery({
    name: 'north',
    type: Number,
    required: true,
    description: 'North bound latitude',
  })
  @ApiQuery({
    name: 'south',
    type: Number,
    required: true,
    description: 'South bound latitude',
  })
  @ApiQuery({
    name: 'east',
    type: Number,
    required: true,
    description: 'East bound longitude',
  })
  @ApiQuery({
    name: 'west',
    type: Number,
    required: true,
    description: 'West bound longitude',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Items per page (default: 20)',
  })
  searchNearby(
    @Query('north') northStr: string,
    @Query('south') southStr: string,
    @Query('east') eastStr: string,
    @Query('west') westStr: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    // Parse query params to numbers
    const north = parseFloat(northStr);
    const south = parseFloat(southStr);
    const east = parseFloat(eastStr);
    const west = parseFloat(westStr);
    const page = pageStr ? parseInt(pageStr) : 1;
    const limit = limitStr ? parseInt(limitStr) : 20;

    return this.propertiesService.searchInBounds(
      { north, south, east, west },
      page,
      limit,
    );
  }

  @Get('map-markers')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Get all property markers within map bounds',
    description:
      'Returns lightweight property data (id, coordinates, price) for map display without pagination',
  })
  @ApiQuery({
    name: 'north',
    type: Number,
    required: true,
    description: 'North bound latitude',
  })
  @ApiQuery({
    name: 'south',
    type: Number,
    required: true,
    description: 'South bound latitude',
  })
  @ApiQuery({
    name: 'east',
    type: Number,
    required: true,
    description: 'East bound longitude',
  })
  @ApiQuery({
    name: 'west',
    type: Number,
    required: true,
    description: 'West bound longitude',
  })
  getMapMarkers(
    @Query('north') northStr: string,
    @Query('south') southStr: string,
    @Query('east') eastStr: string,
    @Query('west') westStr: string,
  ) {
    const north = parseFloat(northStr);
    const south = parseFloat(southStr);
    const east = parseFloat(eastStr);
    const west = parseFloat(westStr);

    return this.propertiesService.getMapMarkers({
      north,
      south,
      east,
      west,
    });
  }

  @Get('user/me')
  @ApiOperation({ summary: 'Get all properties of the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User properties retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyProperties(@Session() session: UserSession) {
    return this.propertiesService.findByUser(session.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all properties of a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User properties retrieved successfully',
  })
  findByUser(@Param('userId') userId: string) {
    return this.propertiesService.findByUser(userId);
  }

  @Get(':id')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get a property by ID' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Session() session: UserSession,
  ) {
    return this.propertiesService.update(
      id,
      updatePropertyDto,
      session.user.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 204, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Session() session: UserSession,
  ) {
    return this.propertiesService.remove(id, session.user.id);
  }

  @Get(':id/validate')
  @ApiOperation({
    summary: 'Validate if property can be published',
    description: 'Check if all required fields are filled',
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      properties: {
        isValid: { type: 'boolean' },
        canPublish: { type: 'boolean' },
        missingFields: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  validateProperty(
    @Param('id', ParseIntPipe) id: number,
    @Session() session: UserSession,
  ) {
    return this.propertiesService.validatePropertyForPublishing(
      id,
      session.user.id,
    );
  }

  @Post(':id/publish')
  @ApiOperation({
    summary: 'Publish a property',
    description: 'Change status from DRAFT to ACTIVE',
  })
  @ApiResponse({ status: 200, description: 'Property published successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot publish - missing required fields',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  publishProperty(
    @Param('id', ParseIntPipe) id: number,
    @Session() session: UserSession,
  ) {
    return this.propertiesService.publishProperty(id, session.user.id);
  }

  @Post(':id/unpublish')
  @ApiOperation({
    summary: 'Unpublish a property',
    description: 'Change status from ACTIVE to DRAFT',
  })
  @ApiResponse({
    status: 200,
    description: 'Property unpublished successfully',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  unpublishProperty(
    @Param('id', ParseIntPipe) id: number,
    @Session() session: UserSession,
  ) {
    return this.propertiesService.unpublishProperty(id, session.user.id);
  }
}
