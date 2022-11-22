import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Card extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column()
  cardNumber: number;

  @Column()
  cardExpiring: string;

  @Column()
  cardCVV: number;

  @Column()
  cardOwner: string;
}
