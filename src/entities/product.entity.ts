import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { Subcategory } from './subcategory.entity';
import { ProductTranslation } from './product-translation.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => Category, (c) => c.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @ManyToOne(() => Subcategory, (s) => s.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory | null;

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

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @OneToMany(() => ProductTranslation, (t) => t.product, { cascade: true })
  translations: ProductTranslation[];
}
