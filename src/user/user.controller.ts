import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUserDto';
import { User } from '@app/user/decorators/user.decarator';

import { UserEntity } from '@app/user/user.entity';

@Controller()
export class UserController {
  // используем service в нашем контроллере
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe()) // проверяет наш body и проверяет что мы передали в createUserDto
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    // console.log(createUserDto); // это поля из боди { username: 'foo', email: 'foo@gmail.com', password: '123' }

    const user = await this.userService.createUser(createUserDto); // здесь мы получаем пользователя
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  //могут заходить только залогиненные пользователи
  @Get('user')
  async currentUser(
    //получаем только id текущего пользователяч
    @User() user: UserEntity,
    @User('id') currentUserId: number,
  ): Promise<UserResponseInterface> {
    console.log('userId', currentUserId);
    console.log('UserEntity', user);

    return this.userService.buildUserResponse(user);
  }
}
