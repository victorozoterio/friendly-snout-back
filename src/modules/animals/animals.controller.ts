import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { OptionalImageValidationPipe } from '../../pipes';
import { AnimalsService } from './animals.service';
import { AnimalDto } from './dto/animal.dto';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { PaginatedAnimalsDto } from './dto/paginated-animals.dto';
import { TotalAnimalsPerStageDto } from './dto/total-animal-per-stage.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

const TEN_MEGABYTES = 10 * 1024 * 1024;

@ApiTags('Animals')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: TEN_MEGABYTES } }))
  @ApiResponse({ status: 201, type: AnimalDto })
  @ApiOperation({ summary: 'Creates a new animal in the system.' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async create(@Body() dto: CreateAnimalDto, @UploadedFile(OptionalImageValidationPipe) file?: Express.Multer.File) {
    return await this.animalsService.create(dto, file);
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

  @Patch('/:uuid')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: TEN_MEGABYTES } }))
  @ApiResponse({ status: 200, type: AnimalDto })
  @ApiOperation({ summary: 'Updates information of an existing animal.' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() dto: UpdateAnimalDto,
    @UploadedFile(OptionalImageValidationPipe) file?: Express.Multer.File,
  ) {
    return await this.animalsService.update(uuid, dto, file);
  }

  @Delete('/:uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes an animal from the system.' })
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.animalsService.remove(uuid);
  }
}
