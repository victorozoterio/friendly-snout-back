import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_ROUTE_KEY } from '../decorators';
import { Environment } from '../utils';

@Injectable()
export class BearerAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (process.env.NODE_ENV === Environment.DEV) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }

  // biome-ignore lint/suspicious/noExplicitAny: Required 'any' type due to AuthGuard generic signature.
  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException('Invalid bearer token.');
    return user;
  }
}
