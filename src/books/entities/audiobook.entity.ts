import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AudioBook extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  forBook: number;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
