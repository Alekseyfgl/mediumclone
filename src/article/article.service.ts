import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserEntity } from "@app/user/user.entity";
import { CreateArticleDto } from "@app/article/dto/createArticle.dto";
import { ArticleEntity } from "@app/article/article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { ArticleResponseInterface } from "@app/article/types/articleResponse.interface";
import slugify from "slugify";

@Injectable()
export class ArticleService {

  constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>) {
  }


  async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.categoriesList) {
      article.categoriesList = [];
    }

    article.slug = ArticleService.getSlug(createArticleDto.title);// по slug мы всегда можем найти пост, т.к. он уникален
    article.author = currentUser; // добавляем ключ с юзером в объект article

    return await this.articleRepository.save(article);
  }


  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article: article };
  }

  private static getSlug(title: string): string {
    return slugify(title, { lower: true }) + "-" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ slug });
  }

  async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {

    const article = await this.findBySlug(slug);
//проверяем пост на существование
    if (!article) {
      throw new HttpException("Article does not exist", HttpStatus.NOT_FOUND);
    }
    //проверяем пост принадлежит ли автору или нет
    if (article.author.id !== currentUserId) {
      throw new HttpException("You are not an author", HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }
}