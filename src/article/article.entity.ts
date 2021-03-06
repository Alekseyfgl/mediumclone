import {
  BeforeUpdate,
  Column,
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

  @Column({type: 'timestamp', default: ()=> 'CURRENT_TIMESTAMP'}) // так автоматически заполниться поле с созданием артикл, CURRENT_TIMESTAMP - текущая дата
  createdAt: Date

  @Column({type: 'timestamp', default: ()=> 'CURRENT_TIMESTAMP'}) // само меняться не будет, поятому каждый раз как меняем запись его нужно перезаписывать
  updatedAt: Date

  @Column('simple-array') // создаем []
  categoriesList: string[]

  @Column({default: 0})
  favoritesCount: number

  @BeforeUpdate()
  updateTimeStamp() {
    this.updatedAt = new Date() // каждый раз когда мы обновляем запись, мы обновляем updatedAt и присваиваем туда новую дату
  }
                                                                                    //с постом получаем пользователя {eager: true}
  @ManyToOne(()=> UserEntity, user => user.articles, {eager: true}) // так мы получаем посты автора - в файле user.entity @OneToMany, который обяз нужно сделать
  author: UserEntity
}