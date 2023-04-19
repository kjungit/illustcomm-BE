import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.followers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  follower: User;

  @ManyToOne(() => User, (user) => user.followings, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  following: User;
}
