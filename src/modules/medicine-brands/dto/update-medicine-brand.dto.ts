import { PartialType } from '@nestjs/swagger';
import { CreateMedicineBrandDto } from './create-medicine-brand.dto';

export class UpdateMedicineBrandDto extends PartialType(CreateMedicineBrandDto) {}
