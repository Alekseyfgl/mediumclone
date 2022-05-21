import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ArticleService } from "@app/article/article.service";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { User } from "@app/user/decorators/user.decarator";
import { UserEntity } from "@app/user/user.entity";
import { CreateArticleDto } from "@app/article/dto/createArticle.dto";

@Controller("articles")
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
  }

  @Post()
  @UseGuards(AuthGuard)// теперь только зарегистрированный пользователь может сюда зайти
  async create(@User() currentUser: UserEntity,
               @Body("article") createArticleDto: CreateArticleDto): Promise<any> { //теперь мы должны прочитать текущего пользователя
    return this.articleService.createArticle(currentUser, createArticleDto);
  }
}
