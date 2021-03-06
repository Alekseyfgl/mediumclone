import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserService } from '@app/user/user.service';

//декодируем токен и получаем текущеного пользователя до контроллера т.к. - мидлвары вызываются до контроллера
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    console.log('auth middleware', req.headers);

    //если нет токена  заголовке присваиваем null
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    //получаем токен из заголовка
    const token = req.headers.authorization.split(' ')[1];
    // console.log('token', token);
    //декодируем токен + try/catch для проверки на валидность токена
    try {
      const decode = verify(token, JWT_SECRET);

      const user = await this.userService.findById(decode.id);
      req.user = user;
      console.log('req.user', req.user);
    } catch (e) {
      req.user = null;
    }
    next();
  }
}
