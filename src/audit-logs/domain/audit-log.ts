import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DELETE = 'FILE_DELETE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  SESSION_CREATE = 'SESSION_CREATE',
  SESSION_DELETE = 'SESSION_DELETE',
  ACCESS_DENIED = 'ACCESS_DENIED',
  API_ACCESS = 'API_ACCESS',
}

export class AuditLog {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: () => User,
  })
  user?: User | null;

  @ApiProperty({
    enum: AuditAction,
  })
  action: AuditAction;

  @ApiProperty({
    type: String,
    example: 'User logged in successfully',
  })
  description: string;

  @ApiProperty({
    type: String,
    example: '192.168.1.1',
  })
  ipAddress: string;

  @ApiProperty({
    type: String,
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent?: string | null;

  @ApiProperty({
    type: String,
    example: 'POST /auth/email/login',
  })
  endpoint?: string | null;

  @ApiProperty({
    type: String,
    example: 'email',
  })
  method?: string | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { userId: 'uuid', email: 'user@example.com' },
  })
  metadata?: Record<string, any> | null;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;
}
