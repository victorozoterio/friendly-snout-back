import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Friendly Snout')
  .addBearerAuth({ type: 'http', name: 'bearer-token', in: 'header' }, 'bearer-token')
  .build();
