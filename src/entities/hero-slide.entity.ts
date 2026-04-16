import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { HeroSlideTranslation } from './hero-slide-translation.entity';

@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'image_data', type: 'longblob', nullable: true, select: false })
  imageData: Buffer;

  @Column({ name: 'image_mimetype', nullable: true })
  imageMimetype: string;

  @Column({ name: 'image_original_name', nullable: true })
  imageOriginalName: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => HeroSlideTranslation, (t) => t.slide, { cascade: true })
  translations: HeroSlideTranslation[];
}
