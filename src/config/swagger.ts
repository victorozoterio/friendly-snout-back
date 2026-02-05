import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Friendly Snout')
  .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
  .addBearerAuth({ type: 'http', name: 'bearer-token', in: 'header' }, 'bearer-token')
  .build();
