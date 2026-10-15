import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators';
import { UserEntity } from '../users/entities/user.entity';
import { RegisterPushDeviceDto } from './dto/register-push-device.dto';
import { UnregisterPushDeviceDto } from './dto/unregister-push-device.dto';
import { PushNotificationsService } from './push-notifications.service';

@ApiTags('Push Notifications')
@Controller('push-notifications')
export class PushNotificationsController {
  constructor(private readonly pushNotificationsService: PushNotificationsService) {}

  @Post('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registers the current device for push notifications.' })
  async registerDevice(@Body() dto: RegisterPushDeviceDto, @CurrentUser() user: UserEntity) {
    await this.pushNotificationsService.registerDevice(user, dto);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disables the current device push token.' })
  async unregisterDevice(@Body() dto: UnregisterPushDeviceDto, @CurrentUser() user: UserEntity) {
    await this.pushNotificationsService.unregisterDevice(user, dto.expoPushToken);
  }
}
