import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { AuditLog } from '../../../../domain/audit-log';
import { AuditLogRepository } from '../../audit-log.repository';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class AuditLogRelationalRepository implements AuditLogRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const persistenceModel = AuditLogMapper.toPersistence({
      ...data,
      id: '',
      createdAt: new Date(),
    } as AuditLog);

    const newEntity = await this.auditLogRepository.save(
      this.auditLogRepository.create(persistenceModel),
    );

    return AuditLogMapper.toDomain(newEntity);
  }

  async findAllWithPagination(params: {
    paginationOptions: IPaginationOptions;
    userId?: string;
    action?: string;
    ipAddress?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    const { paginationOptions, userId, action, ipAddress, startDate, endDate } =
      params;

    const where: FindOptionsWhere<AuditLogEntity> = {};

    if (userId) {
      where.user = { id: userId };
    }

    if (action) {
      where.action = action as any;
    }

    if (ipAddress) {
      where.ipAddress = ipAddress;
    }

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const entities = await this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: ['user'],
    });

    return entities.map((entity) => AuditLogMapper.toDomain(entity));
  }

  async findById(id: AuditLog['id']): Promise<NullableType<AuditLog>> {
    const entity = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    return entity ? AuditLogMapper.toDomain(entity) : null;
  }

  async findByUserId(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]> {
    const entities = await this.auditLogRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: ['user'],
    });

    return entities.map((entity) => AuditLogMapper.toDomain(entity));
  }

  async findByIpAddress(
    ipAddress: string,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]> {
    const entities = await this.auditLogRepository.find({
      where: { ipAddress },
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: ['user'],
    });

    return entities.map((entity) => AuditLogMapper.toDomain(entity));
  }

  async findByAction(
    action: string,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]> {
    const entities = await this.auditLogRepository.find({
      where: { action: action as any },
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: ['user'],
    });

    return entities.map((entity) => AuditLogMapper.toDomain(entity));
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    paginationOptions: IPaginationOptions,
  ): Promise<AuditLog[]> {
    const entities = await this.auditLogRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations: ['user'],
    });

    return entities.map((entity) => AuditLogMapper.toDomain(entity));
  }

  async getStatsByUser(userId: string): Promise<{
    totalLogs: number;
    uniqueIpAddresses: number;
    lastActivity: Date | null;
  }> {
    const totalLogs = await this.auditLogRepository.count({
      where: { user: { id: userId } },
    });

    const uniqueIpsQuery = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('COUNT(DISTINCT audit.ipAddress)', 'count')
      .where('audit.userId = :userId', { userId })
      .getRawOne();

    const lastActivityQuery = await this.auditLogRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return {
      totalLogs,
      uniqueIpAddresses: parseInt(uniqueIpsQuery?.count || '0'),
      lastActivity: lastActivityQuery?.createdAt || null,
    };
  }

  async getStatsByIpAddress(ipAddress: string): Promise<{
    totalLogs: number;
    uniqueUsers: number;
    lastActivity: Date | null;
  }> {
    const totalLogs = await this.auditLogRepository.count({
      where: { ipAddress },
    });

    const uniqueUsersQuery = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('COUNT(DISTINCT audit.userId)', 'count')
      .where('audit.ipAddress = :ipAddress', { ipAddress })
      .getRawOne();

    const lastActivityQuery = await this.auditLogRepository.findOne({
      where: { ipAddress },
      order: { createdAt: 'DESC' },
    });

    return {
      totalLogs,
      uniqueUsers: parseInt(uniqueUsersQuery?.count || '0'),
      lastActivity: lastActivityQuery?.createdAt || null,
    };
  }
}
