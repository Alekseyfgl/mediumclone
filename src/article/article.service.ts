import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserEntity } from "@app/user/user.entity";
import { CreateArticleDto } from "@app/article/dto/createArticle.dto";
import { ArticleEntity } from "@app/article/article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, getRepository, Repository } from "typeorm";
import { ArticleResponseInterface } from "@app/article/types/articleResponse.interface";
import slugify from "slugify";
import { ArticlesResponseInterface } from "@app/article/types/ArticlesResponse.interface";
import { log } from "util";

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


//если есть categories в query
    if (query.categories) {
      queryBuilder.andWhere("articles.categoriesList LIKE :categories", {
        categories: `%${query.categories}`
      });
    }

    //если есть автор в query
    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author
      });
      queryBuilder.andWhere("articles.authorId = :id", {
        id: author.id
      });
    }

    //ищем какие посты залайкал user
    if (query.favorited) {
      //ищем автора при условии что такой существует, с массивом постов который он залайкал
      const author: UserEntity = await this.userRepository.findOne({
        username: query.favorited
      }, {relations: ['favorites']});


      //получаем id всех постов которые залайкал этот автор
      const ids = author.favorites.map(article =>  article.id )

      if (ids.length> 0) {
        //проверяем у каждого article id и проверяем есть ли в массиве наших ids
        queryBuilder.andWhere('articles.id IN (:...ids)', {ids})
      } else {
        queryBuilder.andWhere('1=0') // обрываем queryBuilder
      }
    }

    queryBuilder.orderBy("articles.createdAt", "DESC"); //по какому полю делать сортировку
    const articlesCount = await queryBuilder.getCount();

    //если есть limit в query
    if (query.limit) {
      queryBuilder.limit(query.limit); //делаем лимит
    }

    //если есть offset в query
    if (query.offset) {
      queryBuilder.offset(query.offset); //делаем лимит
    }

    //если мы не залогинены favoritedIds будет пустым
    let favoriteIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne(currentUserId, {
        relations: ['favorites'],
      });
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorited, articlesCount };
  }

  async addArticleToFavorites(slug: string, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    // console.log('article=====>>>', article);

    const user = await this.userRepository.findOne(currentUserId, {
      relations: ["favorites"]
    }); // здесь лежит user c favorites: [ArticleEntity, ArticleEntity] которые он залайкал


    // console.log("----------user------", user);
    // console.log('authir ARTICLE ', );

    //проверяем залайкан ли у нас пост
    const isNotFavorited: boolean = user.favorites.findIndex(articleInFavorites => articleInFavorites.id === article.id) === -1;
    // console.log('isNotFavorited',isNotFavorited);

    //если пост не залайкан, то попадаем внутрь
    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++; // кол-во людей которые залайкали наш article
      await this.userRepository.save(user); // сохраняем user
      await this.articleRepository.save(article); // сохраняем article
    }

    return article;
  }


  async deleteArticleFromFavorites(slug: string, userId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(userId, {
      relations: ['favorites'],
    });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

}
