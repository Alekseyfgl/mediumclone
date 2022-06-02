import { BeforeInsert, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { hash } from 'bcrypt';
import { ArticleEntity } from "@app/article/article.entity";
import { JoinTable } from "typeorm"; //Check your imports, it should be import {...} from 'typeorm'. Avoid imports from 'typeorm/browser'.

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({ default: null })
  bio: string;

  @Column({ default: null })
  image: string;

  @Column({ select: false }) //так мы исключаем пароль по умолчанию
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @OneToMany(()=> ArticleEntity, article => article.author) // один ко многим, так мы получим автора поста
  articles: ArticleEntity[]

  @ManyToMany(()=> ArticleEntity)
  @JoinTable() // нужен для создание 3 табл
  favorites: ArticleEntity[]; //favorites - поле с лайками и дизлайками
}
