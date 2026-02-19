import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  async log(action: string, userId: number): Promise<void> {
    const log = this.repo.create({ action, userId, timestamp: new Date() });
    await this.repo.save(log);
    // Console/file log
    console.log(`[AUDIT] ${new Date().toISOString()} - User ${userId}: ${action}`);
    fs.appendFileSync('audit.log', `[AUDIT] ${new Date().toISOString()} - User ${userId}: ${action}\n`);
  }

  async getLogs(): Promise<AuditLog[]> {
    return this.repo.find();
  }
}