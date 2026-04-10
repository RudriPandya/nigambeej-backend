import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { runSeed } from './seed/seed';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      await runSeed(this.dataSource);
    } catch (err) {
      console.error('Seed error:', err?.message ?? err);
    }
  }
}
