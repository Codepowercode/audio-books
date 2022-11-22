import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from_user: number;

  @Column({ nullable: true })
  bookId: number;

  @Column()
  token: string;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ default: 'query' })
  status: string;

  @Column({ nullable: true })
  payer_email: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  /* donation_to_project, subscription_year, subscription_month, donation_to_book */
  @Column({ default: 'donation_to_project' })
  payment_type: string;
}
