import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity()
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  token: string;

  @Column({ nullable: false, unique: true })
  userId: number;

  @BeforeInsert()
  async hashToken() {
    this.token = await bcrypt.hash(this.token, 8);
  }
}
