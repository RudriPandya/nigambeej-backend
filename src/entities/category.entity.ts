import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CategoryTranslation } from './category-translation.entity';
import { Subcategory } from './subcategory.entity';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => CategoryTranslation, (t) => t.category, { cascade: true })
  translations: CategoryTranslation[];

  @OneToMany(() => Subcategory, (s) => s.category)
  subcategories: Subcategory[];

  @OneToMany(() => Product, (p) => p.category)
  products: Product[];
}
