import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    // лучше явно указываать что мы хотим вернуть

    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email, // делаем запрос в BD и проверяем есть ли такой пользователь c email в BD
    });

    const userByName = await this.userRepository.findOne({
      email: createUserDto.email, // делаем запрос в BD и проверяем есть ли такой пользователь name в BD
    });

    //вывод ошибки если есть пользователь с таким email | name
    if (userByEmail || userByName) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();

    Object.assign(newUser, createUserDto);

    console.log('-----newUser------', newUser);

    // const user = new UserEntity()
    // const newUser = {
    //     user,
    //     ...createUserDto,
    // }

    return await this.userRepository.save(newUser);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
