import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Narrator extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameEnglish: string;

  @Column()
  nameArabic: string;
}
