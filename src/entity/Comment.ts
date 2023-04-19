import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  author: User;
}
