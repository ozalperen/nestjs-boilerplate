import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { AuditLog } from '../../domain/audit-log';

export abstract class AuditLogRepository {
  abstract create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;

  abstract findAllWithPagination(params: {
    paginationOptions: IPaginationOptions;
    userId?: string;
    action?: string;
    ipAddress?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]>;

  abstract findById(id: AuditLog['id']): Promise<NullableType<AuditLog>>;

  abstract findByUserId(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]>;

  abstract findByIpAddress(
    ipAddress: string,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]>;

  abstract findByAction(
    action: string,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]>;

  abstract findByDateRange(
    startDate: Date,
    endDate: Date,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]>;

  abstract getStatsByUser(userId: string): Promise<{
    totalLogs: number;
    uniqueIpAddresses: number;
    lastActivity: Date | null;
  }>;

  abstract getStatsByIpAddress(ipAddress: string): Promise<{
    totalLogs: number;
    uniqueUsers: number;
    lastActivity: Date | null;
  }>;
}
