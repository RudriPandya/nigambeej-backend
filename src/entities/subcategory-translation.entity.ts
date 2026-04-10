import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Subcategory } from './subcategory.entity';

@Entity('subcategory_translations')
export class SubcategoryTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subcategory, (s) => s.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @Column({ length: 5 })
  lang: string;

  @Column()
  name: string;
}
