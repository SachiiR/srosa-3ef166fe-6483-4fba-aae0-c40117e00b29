import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Role } from '@org/data';
import { Organization } from './organization.entity';
import { JoinColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string; // Hashed
  
  @Column({ unique: true })
  email!: string

  @Column({ type: 'simple-enum', enum: Role })
  role!: Role;

  // @ManyToOne(() => Organization)
  @ManyToOne(() => Organization, (org) => org.users, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @Column({ name: 'organizationId' })
  organizationId!: number;
}