import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('career_applications')
export class CareerApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'post_title', nullable: true })
  postTitle: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string;

  @Column({ name: 'cv_file_path', nullable: true })
  cvFilePath: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
