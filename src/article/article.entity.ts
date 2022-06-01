import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { UserEntity } from "@app/user/user.entity";

@Entity({ name: "article" }) // {name:'article'} создает таблицу с названием article
export class ArticleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ default: null })
  description: string;

  @Column({ default: null })
  body: string;

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column('simple-array') // создаем []
  categoriesList: string[]

  @Column({default: 0})
  favoritesCount: number


                                                                                    //с постом получаем пользователя {eager: true}
  @ManyToOne(()=> UserEntity, user => user.articles, {eager: true}) // так мы получаем посты автора - в файле user.entity @OneToMany, который обяз нужно сделать
  author: UserEntity
}