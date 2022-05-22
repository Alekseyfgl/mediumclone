import { Body, Controller, Get, Post, UseGuards, Param } from "@nestjs/common";
import { ArticleService } from "@app/article/article.service";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { User } from "@app/user/decorators/user.decarator";
import { UserEntity } from "@app/user/user.entity";
import { CreateArticleDto } from "@app/article/dto/createArticle.dto";
import { ArticleResponseInterface } from "@app/article/types/articleResponse.interface";

@Controller("articles")
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
  }

  @Post()
  @UseGuards(AuthGuard)// теперь только зарегистрированный пользователь может сюда зайти
  async create(@User() currentUser: UserEntity,
               @Body("article") createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> { //теперь мы должны прочитать текущего пользователя
    const article = await this.articleService.createArticle(currentUser, createArticleDto);
    return this.articleService.buildArticleResponse(article); // возвращаем ответ клиенту
  }


  @Get(":slug")
  async getSingleArticle(@Param("slug") slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article)
  }
}
