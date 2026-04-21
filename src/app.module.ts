import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { AdminUser } from './entities/admin-user.entity';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { Subcategory } from './entities/subcategory.entity';
import { SubcategoryTranslation } from './entities/subcategory-translation.entity';
import { Product } from './entities/product.entity';
import { ProductTranslation } from './entities/product-translation.entity';
import { ProductVideo } from './entities/product-video.entity';
import { ProductVideoTranslation } from './entities/product-video-translation.entity';
import { BlogPost } from './entities/blog-post.entity';
import { BlogPostTranslation } from './entities/blog-post-translation.entity';
import { GalleryImage } from './entities/gallery-image.entity';
import { MediaImage } from './entities/media-image.entity';
import { HeroSlide } from './entities/hero-slide.entity';
import { HeroSlideTranslation } from './entities/hero-slide-translation.entity';
import { HomepageStat } from './entities/homepage-stat.entity';
import { ContactInquiry } from './entities/contact-inquiry.entity';
import { CareerApplication } from './entities/career-application.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { TranslationOverride } from './entities/translation-override.entity';
import { InformationCard } from './entities/information-card.entity';

// Modules
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { BlogModule } from './blog/blog.module';
import { GalleryModule } from './gallery/gallery.module';
import { MediaModule } from './media/media.module';
import { HeroModule } from './hero/hero.module';
import { VideosModule } from './videos/videos.module';
import { StatsModule } from './stats/stats.module';
import { ContactModule } from './contact/contact.module';
import { CareersModule } from './careers/careers.module';
import { SettingsModule } from './settings/settings.module';
import { TranslationsModule } from './translations/translations.module';
import { InformationModule } from './information/information.module';

const ALL_ENTITIES = [
  AdminUser, Category, CategoryTranslation, Subcategory, SubcategoryTranslation,
  Product, ProductTranslation, ProductVideo, ProductVideoTranslation,
  BlogPost, BlogPostTranslation, GalleryImage, MediaImage,
  HeroSlide, HeroSlideTranslation, HomepageStat,
  ContactInquiry, CareerApplication, SiteSetting, TranslationOverride,
  InformationCard,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        // DATABASE_SYNC explicitly controls TypeORM schema sync.
        // Set DATABASE_SYNC=false in .env to prevent any automatic
        // schema changes (add/alter/drop columns) while running
        // `npm run start:dev`. If unset, defaults to true in
        // non-production environments for backward compatibility.
        const syncEnv = config.get<string>('DATABASE_SYNC');
        const synchronize =
          syncEnv !== undefined
            ? String(syncEnv).toLowerCase() === 'true'
            : config.get('NODE_ENV') !== 'production';

        return {
          type: 'mysql',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get('DB_USER', 'root'),
          password: config.get('DB_PASS', ''),
          database: config.get('DB_NAME', 'nigam_beej_db'),
          entities: ALL_ENTITIES,
          synchronize,
          charset: 'utf8mb4',
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ProductsModule,
    BlogModule,
    GalleryModule,
    MediaModule,
    HeroModule,
    VideosModule,
    StatsModule,
    ContactModule,
    CareersModule,
    SettingsModule,
    TranslationsModule,
    InformationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
