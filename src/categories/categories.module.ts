import {Module} from "@nestjs/common";
import {CategoriesController} from "./categories.controller";
import {CategoriesService} from "./categories.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CategoriesEntity} from "@app/categories/categories.entity";

@Module({
    imports: [TypeOrmModule.forFeature([CategoriesEntity])],
    controllers: [CategoriesController],
    providers: [CategoriesService],
})
export class CategoriesModule {

}