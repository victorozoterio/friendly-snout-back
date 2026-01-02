import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): object => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as UserEntity;
});
