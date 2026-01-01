import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_ROUTE_KEY = 'isPublic';

/**
 * Decorator para marcar rotas como públicas (não requerem autenticação)
 * Alias para Public()
 */
export const PublicRoute = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true);
