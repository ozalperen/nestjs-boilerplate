import { AuditLog } from '../../../../domain/audit-log';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';

export class AuditLogMapper {
  static toDomain(raw: AuditLogEntity): AuditLog {
    const domainEntity = new AuditLog();
    domainEntity.id = raw.id;
    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }
    domainEntity.action = raw.action;
    domainEntity.description = raw.description;
    domainEntity.ipAddress = raw.ipAddress;
    domainEntity.userAgent = raw.userAgent;
    domainEntity.endpoint = raw.endpoint;
    domainEntity.method = raw.method;
    domainEntity.metadata = raw.metadata;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: AuditLog): AuditLogEntity {
    const persistenceEntity = new AuditLogEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.user) {
      persistenceEntity.user = UserMapper.toPersistence(domainEntity.user);
    }

    persistenceEntity.action = domainEntity.action;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.ipAddress = domainEntity.ipAddress;
    persistenceEntity.userAgent = domainEntity.userAgent;
    persistenceEntity.endpoint = domainEntity.endpoint;
    persistenceEntity.method = domainEntity.method;
    persistenceEntity.metadata = domainEntity.metadata;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }
}
