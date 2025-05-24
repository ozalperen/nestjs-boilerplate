import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { AuditAction } from '../../../../domain/audit-log';

@Entity({
  name: 'audit_log',
})
@Index(['createdAt'])
@Index(['action'])
@Index(['ipAddress'])
export class AuditLogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: true,
  })
  user?: UserEntity | null;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column()
  description: string;

  @Index()
  @Column({ type: String })
  ipAddress: string;

  @Column({ type: String, nullable: true })
  userAgent?: string | null;

  @Column({ type: String, nullable: true })
  endpoint?: string | null;

  @Column({ type: String, nullable: true })
  method?: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
