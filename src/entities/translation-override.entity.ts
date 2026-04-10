import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('translation_overrides')
@Unique(['lang', 'namespace', 'keyPath'])
export class TranslationOverride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 5 })
  lang: string;

  @Column()
  namespace: string;

  @Column({ name: 'key_path' })
  keyPath: string;

  @Column({ type: 'text' })
  value: string;
}
