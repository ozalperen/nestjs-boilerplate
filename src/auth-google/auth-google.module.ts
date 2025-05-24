import { Module } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { ConfigModule } from '@nestjs/config';
import { AuthGoogleController } from './auth-google.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [ConfigModule, AuthModule, AuditLogsModule],
  providers: [AuthGoogleService],
  exports: [AuthGoogleService],
  controllers: [AuthGoogleController],
})
export class AuthGoogleModule {}
