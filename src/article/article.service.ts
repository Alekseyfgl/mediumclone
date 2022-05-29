import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserEntity } from "@app/user/user.entity";
import { CreateArticleDto } from "@app/article/dto/createArticle.dto";
import { ArticleEntity } from "@app/article/article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, getRepository, Repository } from "typeorm";
import { ArticleResponseInterface } from "@app/article/types/articleResponse.interface";
import slugify from "slugify";
import { ArticlesResponseInterface } from "@app/article/types/ArticlesResponse.interface";

@Injectable()
export class ArticleService {

  constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
              @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {
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


  async updateArticle(slug: string, updateArticleDto: CreateArticleDto, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
//проверяем пост на существование
    if (!article) {
      throw new HttpException("Article does not exist", HttpStatus.NOT_FOUND);
    }
    //проверяем пост принадлежит ли автору или нет
    if (article.author.id !== currentUserId) {
      throw new HttpException("You are not an author", HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder("articles")
      .leftJoinAndSelect("articles.author", "author");



    queryBuilder.orderBy("articles.createdAt", "DESC"); //по какому полю делать сортировку
    const articlesCount = await queryBuilder.getCount();

    if(query.categories) {
      queryBuilder.andWhere('articles.categoriesList LIKE :categories', {
        categories: `${query.categories}`,
      })
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author
      });
      queryBuilder.andWhere("articles.authorId = :id", {
        id: author.id
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit); //делаем лимит
    }

    if (query.offset) {
      queryBuilder.offset(query.offset); //делаем лимит
    }

    const articles = await queryBuilder.getMany();


    return { articles, articlesCount };
  }

}
