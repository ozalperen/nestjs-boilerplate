import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsIP, IsOptional, IsString } from 'class-validator';
import { AuditAction } from '../domain/audit-log';

export class QueryAuditLogDto {
  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    enum: AuditAction,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    type: String,
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  endDate?: Date;
}

export class CreateAuditLogDto {
  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    enum: AuditAction,
  })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({
    type: String,
    example: 'User logged in successfully',
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: String,
    example: '192.168.1.1',
  })
  @IsIP()
  ipAddress: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'POST /auth/email/login',
  })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'POST',
  })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { sessionId: 'abc123', provider: 'email' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
