import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  //проверяем есть ли пользователь в запросе
  if (!request.user) {
    return null;
  }

  if (data) {
    return request.user[data];
  }
  return request.user;
});
