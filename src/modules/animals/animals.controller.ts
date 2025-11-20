import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAnimalDto) {
    return await this.animalsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.animalsService.findAll();
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('uuid') uuid: string) {
    return await this.animalsService.findOne(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateAnimalDto) {
    return await this.animalsService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('uuid') uuid: string) {
    return await this.animalsService.remove(uuid);
  }
}
