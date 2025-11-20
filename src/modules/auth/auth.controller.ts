import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 201, type: AuthDto })
  @ApiOperation({ summary: 'Authenticates a user to log into the system.' })
  async signIn(@Body() dto: CreateAuthDto) {
    return this.authService.signIn(dto);
  }
}
