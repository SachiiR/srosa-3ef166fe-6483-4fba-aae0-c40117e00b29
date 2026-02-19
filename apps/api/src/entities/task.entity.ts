import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description?: string;

  @Column()
  category?: string;

  @Column({ default: 'Pending' })
  status!: string;

  @Column()
  order?: number;

  @ManyToOne(() => User)
  owner!: User;

  @ManyToOne(() => User, { nullable: true })
  assignedTo!: User;
}