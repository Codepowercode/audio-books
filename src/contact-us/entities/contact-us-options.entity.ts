import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
@Entity()
export class ContactUsOptions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    nameEnglish: string;

    @Column({nullable: true})
    nameArabic: string;
}
