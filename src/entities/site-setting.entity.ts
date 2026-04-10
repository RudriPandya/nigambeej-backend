import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('site_settings')
export class SiteSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'setting_key', unique: true })
  settingKey: string;

  @Column({ name: 'setting_value', type: 'text', nullable: true })
  settingValue: string;

  @Column({ name: 'setting_type', default: 'string' })
  settingType: string;
}
