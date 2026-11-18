import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UnregisterPushDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  expoPushToken: string;
}
