import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { SubcategoryTranslation } from './subcategory-translation.entity';
import { Product } from './product.entity';

@Entity('subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (c) => c.subcategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  slug: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => SubcategoryTranslation, (t) => t.subcategory, { cascade: true })
  translations: SubcategoryTranslation[];

  @OneToMany(() => Product, (p) => p.subcategory)
  products: Product[];
}
