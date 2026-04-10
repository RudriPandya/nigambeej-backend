import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { HeroSlide } from './hero-slide.entity';

@Entity('hero_slide_translations')
export class HeroSlideTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HeroSlide, (s) => s.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slide_id' })
  slide: HeroSlide;

  @Column({ length: 5 })
  lang: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ name: 'cta_label', nullable: true })
  ctaLabel: string;

  @Column({ name: 'cta_url', nullable: true })
  ctaUrl: string;
}
