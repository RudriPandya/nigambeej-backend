import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('category_translations')
export class CategoryTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (c) => c.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 5 })
  lang: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
