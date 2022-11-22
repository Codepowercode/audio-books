import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ unique: true })
  // userId: number;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: false })
  subscriptionStatus: string;

  @CreateDateColumn()
  start_date: Date;

  @Column()
  end_date: Date;
}
