import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder().setTitle('Friendly Snout').build();
