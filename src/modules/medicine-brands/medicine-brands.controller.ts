import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateMedicineBrandDto } from './dto/create-medicine-brand.dto';
import { MedicineBrandDto } from './dto/medicine-brand.dto';
import { PaginatedMedicineBrandsDto } from './dto/paginated-medicine-brand.dto';
import { UpdateMedicineBrandDto } from './dto/update-medicine-brand.dto';
import { MedicineBrandsService } from './medicine-brands.service';

@ApiTags('Medicine Brands')
@Controller('medicine-brands')
export class MedicineBrandsController {
  constructor(private readonly medicineBrandsService: MedicineBrandsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: MedicineBrandDto })
  @ApiOperation({ summary: 'Creates a new medicine brand in the system.' })
  async create(@Body() dto: CreateMedicineBrandDto) {
    return await this.medicineBrandsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: PaginatedMedicineBrandsDto })
  @ApiOperation({ summary: 'Retrieves a paginated list of medicine brands.' })
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.medicineBrandsService.findAll(query);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineBrandDto })
  @ApiOperation({ summary: 'Retrieves information about a specific medicine brand.' })
  async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicineBrandsService.findOne(uuid);
  }

  @Put(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineBrandDto })
  @ApiOperation({ summary: 'Updates information of an existing medicine brand.' })
  async update(@Param('uuid', new ParseUUIDPipe()) uuid: string, @Body() dto: UpdateMedicineBrandDto) {
    return await this.medicineBrandsService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a medicine brand from the system.' })
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicineBrandsService.remove(uuid);
  }
}
