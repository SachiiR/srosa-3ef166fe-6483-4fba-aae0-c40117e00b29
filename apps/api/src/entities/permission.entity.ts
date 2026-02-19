import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '@org/data';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'simple-enum', enum: Role })
  role!: Role;
}