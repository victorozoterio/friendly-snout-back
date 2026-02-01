import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CurrentUser } from 'src/decorators';
import { UserEntity } from '../users/entities/user.entity';
import { CreateMedicineApplicationDto } from './dto/create-medicine-application.dto';
import { MedicineApplicationDto } from './dto/medicine-application.dto';
import { MedicineApplicationsService } from './medicine-applications.service';

@ApiTags('Medicine Applications')
@Controller('medicine-applications')
export class MedicineApplicationsController {
  constructor(private readonly medicineApplicationsService: MedicineApplicationsService) {}

  @Post('animal/:animalUuid')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: MedicineApplicationDto })
  @ApiOperation({ summary: 'Creates a new medicine application in the system.' })
  async create(
    @Param('animalUuid', new ParseUUIDPipe()) animalUuid: string,
    @Body() dto: CreateMedicineApplicationDto,
    @CurrentUser() user: UserEntity,
  ) {
    return await this.medicineApplicationsService.create(animalUuid, dto, user);
  }

  @Get('by-animal/:animalUuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: MedicineApplicationDto, isArray: true })
  @ApiOperation({ summary: 'Retrieves a paginated list of medications applied into a specific animal.' })
  async findAllByAnimal(
    @Param('animalUuid', new ParseUUIDPipe()) animalUuid: string,
    @Paginate() query: PaginateQuery,
  ) {
    return await this.medicineApplicationsService.findAllByAnimal(animalUuid, query);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a medicine application from the system.' })
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.medicineApplicationsService.remove(uuid);
  }
}
