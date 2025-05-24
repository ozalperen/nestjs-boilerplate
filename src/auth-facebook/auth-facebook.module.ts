import { Module } from '@nestjs/common';
import { AuthFacebookService } from './auth-facebook.service';
import { ConfigModule } from '@nestjs/config';
import { AuthFacebookController } from './auth-facebook.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [ConfigModule, AuthModule, AuditLogsModule],
  providers: [AuthFacebookService],
  exports: [AuthFacebookService],
  controllers: [AuthFacebookController],
})
export class AuthFacebookModule {}
