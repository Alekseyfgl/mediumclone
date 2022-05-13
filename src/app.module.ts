import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import {CategoriesModule} from "@app/categories/categories.module";
import {TypeOrmModule} from '@nestjs/typeorm'
import ormconfig from "@app/ormconfig";
import {UserModule} from "@app/user/user.module";


@Module({
  imports: [TypeOrmModule.forRoot(ormconfig),CategoriesModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
