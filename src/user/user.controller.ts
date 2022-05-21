import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUserDto';
import { User } from '@app/user/decorators/user.decarator';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';

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

  /*этот запрос только для залогиненых пользователей,т.к. токен обязательно должен быть прикреплен к запросу,
   если токен не прикреплен или не валиден мы должны выбросить ошибку 401
   но мы не хотим выбрасывать ошибки внутри middleware, т.к. мы зарегистрировали их глобально для абсолютно всех запросов
   и мы хотим точечно говорить на какие именно Router мы хотим выбрасывать ошибки
   -------здесь мы получаем текущего пользователя*/
  @Get('user') // здесь парсим наш токен и получаем текущего пользователя
  @UseGuards(AuthGuard) // проверяет залогинены мы или нет, то выбрас ошибку
  async currentUser(
    //получаем только id текущего пользователяч
    @User() user: UserEntity,
    @User('id') currentUserId: number,
  ): Promise<UserResponseInterface> {
    console.log('userId', currentUserId);
    console.log('UserEntity', user);

    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(
      currentUserId,
      updateUserDto,
    );
    return this.userService.buildUserResponse(user);
  }
}
