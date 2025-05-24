import {
  // common
  Module,
} from '@nestjs/common';
import { RedisSessionPersistenceModule } from './infrastructure/persistence/redis/redis-persistence.module';
import { SessionService } from './session.service';

const infrastructurePersistenceModule = RedisSessionPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule],
  providers: [SessionService],
  exports: [SessionService, infrastructurePersistenceModule],
})
export class SessionModule {}
