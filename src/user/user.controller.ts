import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';

@Controller()
export class UserController {
  // используем service в нашем контроллере
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    console.log(createUserDto); // это поля из боди { username: 'foo', email: 'foo@gmail.com', password: '123' }

    return await this.userService.createUser(createUserDto);
  }
}
