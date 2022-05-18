import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUserDto';
import { compare } from 'bcrypt';

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

    // const user = new UserEntity()
    // const newUser = {
    //     user,
    //     ...createUserDto,
    // }
    return await this.userRepository.save(newUser);
  }

  //поиск user по id
  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  //создание токена
  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  //добавляет токен в ответ для клиента после регистрации + самого user  {username: 'Alex', email: 'msdymail@gmail.com',password: '$2b$10$9Y8PsF/4Cux/g.exW6lXte6VvuMo4H11U87wc3q0.lVsj9ElYZclK',id: 16,bio: '',image: ''}
  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      {
        email: loginUserDto.email, // делаем запрос в BD и проверяем есть ли такой пользователь c email в BD
      },
      //все это делаем чтобы получить password
      { select: ['id', 'username', 'email', 'bio', 'image', 'password'] }, //т.к. только здесь нам нужен password, но мы его исключили по умолчанию, то приходится делать селект всех свойств
    );

    // console.log('---user---', user);
    // console.log(loginUserDto);
    // console.log(user);

    //если мы не получили пользователя ---> Error
    if (!user) {
      throw new HttpException(
        'There is no user with this name',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Wrong password try again',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    delete user.password; // нам не нужно возвращать пароль пользователя при входе в лич кабинет
    return user;
  }
}
