import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Role } from '@org/data';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByUsername(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email }, relations: ['organization'] });
  }

  // For seeding or registration (not in API, but for testing)
  async create(username: string, password: string, role: string, orgId: number, email: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.repo.create({ username, password: hashed, role: role as Role, organization: { id: orgId }, email });
    return this.repo.save(user);
  }

  async findByOrg(orgId: number, role: string) {
    if (role === 'Admin') {
      // Admin sees all users
      return this.repo.find({ select: ['id', 'username', 'email', 'role'] });
    }
    // Owner sees users in their org only
    return this.repo.find({ 
      where: { organization: { id: orgId } },
      select: ['id', 'username', 'email', 'role']
    });
  }
}