import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators';
import { UserEntity } from '../users/entities/user.entity';
import { CreateMedicineApplicationDto } from './dto/create-medicine-application.dto';
import { MedicineApplicationDto } from './dto/medicine-application.dto';
import { MedicineApplicationsService } from './medicine-applications.service';

@ApiTags('Medicine Applications')
@Controller('medicine-applications')
export class MedicineApplicationsController {
  constructor(private readonly medicineApplicationsService: MedicineApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: MedicineApplicationDto })
  @ApiOperation({ summary: 'Creates a new medicine application in the system.' })
  async create(@CurrentUser() user: UserEntity, @Body() dto: CreateMedicineApplicationDto) {
    return await this.medicineApplicationsService.create(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineApplicationDto, isArray: true })
  @ApiOperation({ summary: 'Retrieves information about all medicine applications.' })
  async findAll() {
    return await this.medicineApplicationsService.findAll();
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineApplicationDto })
  @ApiOperation({ summary: 'Retrieves information about a specific medicine application.' })
  async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicineApplicationsService.findOne(uuid);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a medicine application from the system.' })
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicineApplicationsService.remove(uuid);
  }
}
