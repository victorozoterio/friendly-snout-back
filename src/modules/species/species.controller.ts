import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { BreedDto } from './dto/breed.dto';
import { CreateBreedDto } from './dto/create-breed.dto';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { PaginatedBreedsDto } from './dto/paginated-breeds.dto';
import { PaginatedSpeciesDto } from './dto/paginated-species.dto';
import { SpeciesDto } from './dto/species.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { SpeciesService } from './species.service';

@ApiTags('Species')
@Controller('species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: SpeciesDto })
  @ApiOperation({ summary: 'Creates a new species in the system.' })
  async create(@Body() dto: CreateSpeciesDto) {
    return await this.speciesService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: PaginatedSpeciesDto })
  @ApiOperation({ summary: 'Retrieves a paginated list of species.' })
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.speciesService.findAll(query);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: SpeciesDto })
  @ApiOperation({ summary: 'Retrieves information about a specific species.' })
  async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.speciesService.findOne(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: SpeciesDto })
  @ApiOperation({ summary: 'Updates information of an existing species.' })
  async update(@Param('uuid', new ParseUUIDPipe()) uuid: string, @Body() dto: UpdateSpeciesDto) {
    return await this.speciesService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a species from the system.' })
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.speciesService.remove(uuid);
  }

  @Post(':speciesUuid/breeds')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: BreedDto })
  @ApiOperation({ summary: 'Creates a new breed for a species.' })
  async createBreed(@Param('speciesUuid', new ParseUUIDPipe()) speciesUuid: string, @Body() dto: CreateBreedDto) {
    return await this.speciesService.createBreed(speciesUuid, dto);
  }

  @Get(':speciesUuid/breeds')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: PaginatedBreedsDto })
  @ApiOperation({ summary: 'Retrieves a paginated list of breeds for a species.' })
  async findBreeds(@Param('speciesUuid', new ParseUUIDPipe()) speciesUuid: string, @Paginate() query: PaginateQuery) {
    return await this.speciesService.findBreeds(speciesUuid, query);
  }

  @Patch(':speciesUuid/breeds/:uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: BreedDto })
  @ApiOperation({ summary: 'Updates information of an existing breed.' })
  async updateBreed(
    @Param('speciesUuid', new ParseUUIDPipe()) speciesUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() dto: UpdateBreedDto,
  ) {
    return await this.speciesService.updateBreed(speciesUuid, uuid, dto);
  }

  @Delete(':speciesUuid/breeds/:uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a breed from the system.' })
  async removeBreed(
    @Param('speciesUuid', new ParseUUIDPipe()) speciesUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return await this.speciesService.removeBreed(speciesUuid, uuid);
  }
}
