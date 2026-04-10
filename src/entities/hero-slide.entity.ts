import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { HeroSlideTranslation } from './hero-slide-translation.entity';

@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'image_path', nullable: true })
  imagePath: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => HeroSlideTranslation, (t) => t.slide, { cascade: true })
  translations: HeroSlideTranslation[];
}
