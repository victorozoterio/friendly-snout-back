import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from 'src/decorators';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: AuthDto })
  @ApiOperation({ summary: 'Authenticates a user to log into the system.' })
  async signIn(@Body() dto: CreateAuthDto) {
    return this.authService.signIn(dto);
  }

  @PublicRoute()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: AuthDto })
  @ApiOperation({ summary: 'Refreshes a user session.' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }
}
