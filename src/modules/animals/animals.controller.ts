import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { AnimalsService } from './animals.service';
import { AnimalDto } from './dto/animal.dto';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { PaginatedAnimalsDto } from './dto/paginated-animals.dto';
import { TotalAnimalsPerStageDto } from './dto/total-animal-per-stage.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@ApiTags('Animals')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: AnimalDto })
  @ApiOperation({ summary: 'Creates a new animal in the system.' })
  async create(@Body() dto: CreateAnimalDto) {
    return await this.animalsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: PaginatedAnimalsDto })
  @ApiOperation({ summary: 'Retrieves a paginated list of animals.' })
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.animalsService.findAll(query);
  }

  @Get('/total-per-stage')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: TotalAnimalsPerStageDto })
  @ApiOperation({ summary: 'Retrieves the total number of animals in each stage.' })
  async totalPerStage() {
    return await this.animalsService.totalPerStage();
  }

  @Get('/:uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: AnimalDto })
  @ApiOperation({ summary: 'Retrieves information about a specific animal.' })
  async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.animalsService.findOne(uuid);
  }

  @Put('/:uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: AnimalDto })
  @ApiOperation({ summary: 'Updates information of an existing animal.' })
  async update(@Param('uuid', new ParseUUIDPipe()) uuid: string, @Body() dto: UpdateAnimalDto) {
    return await this.animalsService.update(uuid, dto);
  }

  @Delete('/:uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes an animal from the system.' })
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.animalsService.remove(uuid);
  }
}
