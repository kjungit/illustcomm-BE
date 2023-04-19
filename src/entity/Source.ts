import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MainBanner } from "./MainBanner";
import { EventBanner } from "./EventBanner";
import { ArtLabBanner } from "./ArtLabBanner";
import { Collaboration } from "./Collaboration";

@Entity()
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => MainBanner, (mainBanner) => mainBanner.source)
  mainBanners: MainBanner[];

  @OneToMany(() => EventBanner, (eventBanner) => eventBanner.source)
  eventBanners: EventBanner[];

  @OneToMany(() => ArtLabBanner, (artLabBanner) => artLabBanner.source)
  artLabBanners: ArtLabBanner[];

  @OneToMany(() => Collaboration, (collaboration) => collaboration.source)
  collaborations: Collaboration[];
}
