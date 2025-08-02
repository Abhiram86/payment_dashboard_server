import { User } from 'src/auth/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  receiver: string;

  @Column({ type: 'enum', enum: ['pending', 'success', 'failed'] })
  status: 'pending' | 'success' | 'failed';

  @Column({ type: 'enum', enum: ['card', 'upi', 'bank_transfer'] })
  method: 'card' | 'upi' | 'bank_transfer';

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
