import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nameEnglish: string;

  @Column({ nullable: true })
  nameArabic: string;

  @Column({ nullable: true })
  descriptionEnglish: string;

  @Column({ nullable: true })
  descriptionArabic: string;

  @Column({ nullable: true })
  authorEnglish: string;

  @Column({ nullable: true })
  authorArabic: string;

  @Column({ default: 'png' })
  imageext: string;

  @Column({ default: false })
  isImage: boolean;

  @Column({ default: 100 })
  kickoffPledge: number;

  @Column({ nullable: true })
  goal: number;

  @Column({ default: 0 })
  donated: number;

  @Column({ nullable: true })
  deadline: Date;

  @Column()
  usersuggested: number;

  @Column({ default: 0 })
  audiocount: number;

  @Column({ default: false })
  isPdfAdded: boolean;

  @Column({ nullable: true })
  narrator: string;

  @Column({ default: 1 })
  status: number;

  @Column({ default: false })
  isReadDonated: boolean;

  @Column({ default: 1 })
  license: number;

  @Column({ nullable: true })
  genre: string;

  @Column()
  yearOfPublishing: number;

  @Column()
  ISBN: string;

  @Column({ default: false })
  issample: boolean;

  @Column({ nullable: true })
  imageLink: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  audioBookDuration: number;

  @Column({ nullable: true })
  briefDescription: string;

  @Column({ nullable: true })
  manualyTags: string;

  @Column({ nullable: true })
  narrationCompanyName: string;

  @Column({ nullable: true })
  narratorName: string;

  @Column({ nullable: true })
  secondaryTitle: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
