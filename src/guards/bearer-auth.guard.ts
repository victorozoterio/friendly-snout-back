import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/modules/users/entities/user.entity';
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

  handleRequest<TUser = UserEntity>(err: unknown, user: TUser) {
    if (err || !user) throw new UnauthorizedException('Invalid bearer token.');
    return user;
  }
}
