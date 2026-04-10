import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('homepage_stats')
export class HomepageStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stat_key', unique: true })
  statKey: string;

  @Column()
  value: string;

  @Column({ name: 'icon_name', nullable: true })
  iconName: string;

  @Column({
    type: 'longtext',
    nullable: true,
    transformer: {
      to: (v: Record<string, string> | null) => (v ? JSON.stringify(v) : null),
      from: (v: string | null) => {
        try { return v ? JSON.parse(v) : null; } catch { return null; }
      },
    },
  })
  labels: Record<string, string>;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
