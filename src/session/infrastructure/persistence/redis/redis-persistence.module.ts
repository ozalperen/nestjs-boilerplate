import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionRepository } from '../session.repository';
import { SessionRedisRepository } from './repositories/session.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SessionRepository,
      useClass: SessionRedisRepository,
    },
  ],
  exports: [SessionRepository],
})
export class RedisSessionPersistenceModule {}
