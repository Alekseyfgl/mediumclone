import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Delete,
  Put,
  UsePipes,
  ValidationPipe,
  Query
} from "@nestjs/common";
import { ArticleService } from "@app/article/article.service";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { User } from "@app/user/decorators/user.decarator";
import { UserEntity } from "@app/user/user.entity";
import { CreateArticleDto } from "@app/article/dto/createArticle.dto";
import { ArticleResponseInterface } from "@app/article/types/articleResponse.interface";
import { DeleteResult } from "typeorm";
import { ArticlesResponseInterface } from "@app/article/types/ArticlesResponse.interface";

@Controller("articles")
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
  }

  @Post()
  @UseGuards(AuthGuard)// теперь только зарегистрированный пользователь может сюда зайти
  @UsePipes(new ValidationPipe())
  async create(@User() currentUser: UserEntity,
               @Body("article") createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> { //теперь мы должны прочитать текущего пользователя
    const article = await this.articleService.createArticle(currentUser, createArticleDto);
    return this.articleService.buildArticleResponse(article); // возвращаем ответ клиенту
  }


  @Get(":slug")
  async getSingleArticle(@Param("slug") slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }


  @Delete(":slug")
  @UseGuards(AuthGuard)
  async deleteArticle(@User("id") currentUserId: number, @Param("slug") slug: string): Promise<DeleteResult> {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Put(":slug")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(@User("id") currentUserId: number, @Param("slug") slug: string, @Body("article") updateArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(slug, updateArticleDto, currentUserId);
    return this.articleService.buildArticleResponse(article);
  }

  @Get()
  async findAll(@User("id") currentUserId: number, @Query() query: any): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query);
  }

  @Post(":slug/favorite")
  @UseGuards(AuthGuard)
  async addArticleToFavorites(@User("id") currentUserId: number, @Param("slug") slug: string) {
    const article = await this.articleService.addArticleToFavorites(slug, currentUserId);
    return  this.articleService.buildArticleResponse(article)
  }


  @Delete(":slug/favorite")
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(@User("id") currentUserId: number, @Param("slug") slug: string) {
    const article = await this.articleService.deleteArticleFromFavorites(slug, currentUserId);
    return  this.articleService.buildArticleResponse(article)
  }
}
