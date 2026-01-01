import { Controller, Get } from '@nestjs/common';
import { PublicRoute } from 'src/decorators';

@Controller('health')
export class HealthController {
  @PublicRoute()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
