import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { MedicineDto } from './dto/medicine.dto';
import { PaginatedMedicineDto } from './dto/paginated-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicinesService } from './medicines.service';

@ApiTags('Medicines')
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: MedicineDto })
  @ApiOperation({ summary: 'Creates a new medicine in the system.' })
  async create(@Body() dto: CreateMedicineDto) {
    return await this.medicinesService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: PaginatedMedicineDto })
  @ApiOperation({ summary: 'Retrieves a paginated list of medicines.' })
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.medicinesService.findAll(query);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineDto })
  @ApiOperation({ summary: 'Retrieves information about a specific medicine.' })
  async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicinesService.findOne(uuid);
  }

  @Patch(':uuid/activate')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineDto })
  @ApiOperation({ summary: 'Activates an existing medicine.' })
  async activate(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicinesService.activate(uuid);
  }

  @Patch(':uuid/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineDto })
  @ApiOperation({ summary: 'Deactivates an existing medicine.' })
  async deactivate(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicinesService.deactivate(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineDto })
  @ApiOperation({ summary: 'Updates information of an existing medicine.' })
  async update(@Param('uuid', new ParseUUIDPipe()) uuid: string, @Body() dto: UpdateMedicineDto) {
    return await this.medicinesService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a medicine from the system.' })
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicinesService.remove(uuid);
  }
}
