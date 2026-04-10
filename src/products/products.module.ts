import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductTranslation } from '../entities/product-translation.entity';
import { Category } from '../entities/category.entity';
import { CategoryTranslation } from '../entities/category-translation.entity';
import { Subcategory } from '../entities/subcategory.entity';
import { SubcategoryTranslation } from '../entities/subcategory-translation.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, ProductTranslation, Category, CategoryTranslation,
      Subcategory, SubcategoryTranslation,
    ]),
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
