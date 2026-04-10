import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from '../entities/blog-post.entity';
import { BlogPostTranslation } from '../entities/blog-post-translation.entity';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost, BlogPostTranslation]), AuthModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
