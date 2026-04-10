import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVideo } from '../entities/product-video.entity';
import { ProductVideoTranslation } from '../entities/product-video-translation.entity';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVideo, ProductVideoTranslation]), AuthModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
