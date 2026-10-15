import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterPushDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  expoPushToken: string;

  @IsIn(['android', 'ios'])
  platform: 'android' | 'ios';
}
