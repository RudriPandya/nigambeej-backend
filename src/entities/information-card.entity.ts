import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('information_cards')
export class InformationCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'image_data', type: 'longblob', nullable: true, select: false })
  imageData: Buffer;

  @Column({ name: 'image_mimetype', nullable: true })
  imageMimetype: string;

  @Column({ name: 'image_original_name', nullable: true })
  imageOriginalName: string;

  @Column({ name: 'btn_url', default: '/information' })
  btnUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_home_card', default: false })
  isHomeCard: boolean;

  @Column({ name: 'en_title' })
  enTitle: string;

  @Column({ name: 'en_desc', type: 'text', nullable: true })
  enDesc: string | null;

  @Column({ type: 'varchar', name: 'hi_title', nullable: true })
  hiTitle: string | null;

  @Column({ type: 'text', name: 'hi_desc', nullable: true })
  hiDesc: string | null;

  @Column({ type: 'varchar', name: 'gu_title', nullable: true })
  guTitle: string | null;

  @Column({ type: 'text', name: 'gu_desc', nullable: true })
  guDesc: string | null;
}
