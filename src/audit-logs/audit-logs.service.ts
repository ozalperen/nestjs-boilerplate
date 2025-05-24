import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from './infrastructure/persistence/audit-log.repository';
import { AuditLog, AuditAction } from './domain/audit-log';
import { User } from '../users/domain/user';
import { IPaginationOptions } from '../utils/types/pagination-options';

export interface CreateAuditLogDto {
  user?: User | null;
  userId?: string | null;
  action: AuditAction;
  description: string;
  ipAddress: string;
  userAgent?: string | null;
  endpoint?: string | null;
  method?: string | null;
  metadata?: Record<string, any> | null;
}

export interface AuditLogQuery {
  paginationOptions: IPaginationOptions;
  userId?: string;
  action?: AuditAction;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogRepository.create({
      user: createAuditLogDto.user,
      action: createAuditLogDto.action,
      description: createAuditLogDto.description,
      ipAddress: createAuditLogDto.ipAddress,
      userAgent: createAuditLogDto.userAgent,
      endpoint: createAuditLogDto.endpoint,
      method: createAuditLogDto.method,
      metadata: createAuditLogDto.metadata,
    });
  }

  async findAllWithPagination(query: AuditLogQuery): Promise<AuditLog[]> {
    return this.auditLogRepository.findAllWithPagination({
      paginationOptions: query.paginationOptions,
      userId: query.userId,
      action: query.action,
      ipAddress: query.ipAddress,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findById(id);
  }

  async findByUserId(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByUserId(userId, paginationOptions);
  }

  async findByIpAddress(
    ipAddress: string,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByIpAddress(
      ipAddress,
      paginationOptions,
    );
  }

  async findByAction(
    action: AuditAction,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByAction(action, paginationOptions);
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByDateRange(
      startDate,
      endDate,
      paginationOptions,
    );
  }

  async getStatsByUser(userId: string) {
    return this.auditLogRepository.getStatsByUser(userId);
  }

  async getStatsByIpAddress(ipAddress: string) {
    return this.auditLogRepository.getStatsByIpAddress(ipAddress);
  }

  // Convenience methods for common audit actions
  async logLogin(
    user: User,
    ipAddress: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ) {
    return this.create({
      user,
      action: AuditAction.LOGIN,
      description: `User ${user.email} logged in`,
      ipAddress,
      userAgent,
      endpoint: '/auth/email/login',
      method: 'POST',
      metadata,
    });
  }

  async logLogout(user: User, ipAddress: string, userAgent?: string) {
    return this.create({
      user,
      action: AuditAction.LOGOUT,
      description: `User ${user.email} logged out`,
      ipAddress,
      userAgent,
      endpoint: '/auth/logout',
      method: 'POST',
    });
  }

  async logRegister(
    user: User,
    ipAddress: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ) {
    return this.create({
      user,
      action: AuditAction.REGISTER,
      description: `New user ${user.email} registered`,
      ipAddress,
      userAgent,
      endpoint: '/auth/email/register',
      method: 'POST',
      metadata,
    });
  }

  async logPasswordChange(user: User, ipAddress: string, userAgent?: string) {
    return this.create({
      user,
      action: AuditAction.PASSWORD_CHANGE,
      description: `User ${user.email} changed password`,
      ipAddress,
      userAgent,
      endpoint: '/auth/change-password',
      method: 'POST',
    });
  }

  async logPasswordReset(user: User, ipAddress: string, userAgent?: string) {
    return this.create({
      user,
      action: AuditAction.PASSWORD_RESET,
      description: `User ${user.email} reset password`,
      ipAddress,
      userAgent,
      endpoint: '/auth/reset/password',
      method: 'POST',
    });
  }

  async logProfileUpdate(
    user: User,
    ipAddress: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ) {
    return this.create({
      user,
      action: AuditAction.PROFILE_UPDATE,
      description: `User ${user.email} updated profile`,
      ipAddress,
      userAgent,
      endpoint: '/auth/me',
      method: 'PATCH',
      metadata,
    });
  }

  async logUserCreate(
    adminUser: User,
    createdUser: User,
    ipAddress: string,
    userAgent?: string,
  ) {
    return this.create({
      user: adminUser,
      action: AuditAction.USER_CREATE,
      description: `Admin ${adminUser.email} created user ${createdUser.email}`,
      ipAddress,
      userAgent,
      endpoint: '/users',
      method: 'POST',
      metadata: {
        createdUserId: createdUser.id,
        createdUserEmail: createdUser.email,
      },
    });
  }

  async logUserUpdate(
    adminUser: User,
    updatedUser: User,
    ipAddress: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ) {
    return this.create({
      user: adminUser,
      action: AuditAction.USER_UPDATE,
      description: `Admin ${adminUser.email} updated user ${updatedUser.email}`,
      ipAddress,
      userAgent,
      endpoint: `/users/${updatedUser.id}`,
      method: 'PATCH',
      metadata: {
        ...metadata,
        updatedUserId: updatedUser.id,
        updatedUserEmail: updatedUser.email,
      },
    });
  }

  async logUserDelete(
    adminUser: User,
    deletedUser: User,
    ipAddress: string,
    userAgent?: string,
  ) {
    return this.create({
      user: adminUser,
      action: AuditAction.USER_DELETE,
      description: `Admin ${adminUser.email} deleted user ${deletedUser.email}`,
      ipAddress,
      userAgent,
      endpoint: `/users/${deletedUser.id}`,
      method: 'DELETE',
      metadata: {
        deletedUserId: deletedUser.id,
        deletedUserEmail: deletedUser.email,
      },
    });
  }

  async logAccessDenied(
    user: User | null,
    ipAddress: string,
    endpoint: string,
    userAgent?: string,
  ) {
    return this.create({
      user,
      action: AuditAction.ACCESS_DENIED,
      description: `Access denied to ${endpoint} for ${user?.email || 'anonymous user'}`,
      ipAddress,
      userAgent,
      endpoint,
      method: 'GET',
    });
  }

  async logApiAccess(
    user: User | null,
    ipAddress: string,
    endpoint: string,
    method: string,
    userAgent?: string,
  ) {
    return this.create({
      user,
      action: AuditAction.API_ACCESS,
      description: `API access: ${method} ${endpoint} by ${user?.email || 'anonymous user'}`,
      ipAddress,
      userAgent,
      endpoint,
      method,
    });
  }
}
