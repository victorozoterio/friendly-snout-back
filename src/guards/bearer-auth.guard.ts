import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class BearerAuthGuard extends AuthGuard('jwt') {
  // biome-ignore lint/suspicious/noExplicitAny: Required 'any' type due to AuthGuard generic signature.
  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException('Invalid bearer token.');
    return user;
  }
}
