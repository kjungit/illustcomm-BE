import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Source } from "./Source";

@Entity()
export class Collaboration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  image: string;

  @ManyToOne(() => Source, (source) => source.mainBanners)
  source: Source;
}
