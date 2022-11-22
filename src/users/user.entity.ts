import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  name: string;

  @Column({ default: true })
  gender: boolean;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: 'png' })
  avatarExtension: string;

  @Column({ default: false })
  isAvatarSet: boolean;

  @Column({ length: 20, nullable: true })
  verificationCode: string;

  @Column({ default: false })
  isVerificated: boolean;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 0 })
  donated: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  // @Column({ default: 'NONE' })
  // subscriptionStatus: string;

  @Column({ default: false })
  contributed: boolean;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 8);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
