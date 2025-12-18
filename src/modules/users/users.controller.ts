import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: UserDto })
  @ApiOperation({ summary: 'Creates a new user in the system.' })
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: UserDto, isArray: true })
  @ApiOperation({ summary: 'Retrieves information about all users.' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: UserDto })
  @ApiOperation({ summary: 'Retrieves information about a specific user.' })
  async findOne(@Param('uuid') uuid: string) {
    return await this.usersService.findOne(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: UserDto })
  @ApiOperation({ summary: 'Updates information of an existing user.' })
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a animal from the system.' })
  async remove(@Param('uuid') uuid: string) {
    return await this.usersService.remove(uuid);
  }
}
