import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { SessionRepository } from '../../session.repository';
import { Session } from '../../../../domain/session';
import { User } from '../../../../../users/domain/user';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { AllConfigType } from '../../../../../config/config.type';

@Injectable()
export class SessionRedisRepository implements SessionRepository {
  private readonly redisClient: RedisClientType;
  private readonly keyPrefix: string;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const redisConfig = this.configService.getOrThrow('redis', { infer: true });

    this.redisClient = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      password: redisConfig.password,
      database: redisConfig.db,
    }) as RedisClientType;

    this.keyPrefix = redisConfig.keyPrefix || 'session:';
    this.redisClient.connect().catch(console.error);
  }

  private getSessionKey(id: Session['id']): string {
    return `${this.keyPrefix}${id}`;
  }

  private getUserSessionsKey(userId: User['id']): string {
    return `${this.keyPrefix}user:${userId}`;
  }

  async findById(id: Session['id']): Promise<NullableType<Session>> {
    try {
      const data = await this.redisClient.get(this.getSessionKey(id));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis findById error:', error);
      return null;
    }
  }

  async create(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Session> {
    const session: Session = {
      id: this.generateSessionId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    try {
      // Store session
      await this.redisClient.set(
        this.getSessionKey(session.id),
        JSON.stringify(session),
        { EX: 60 * 60 * 24 * 365 }, // 1 year expiration
      );

      // Add session ID to user's session set
      await this.redisClient.sAdd(
        this.getUserSessionsKey(session.user.id),
        session.id as string,
      );

      return session;
    } catch (error) {
      console.error('Redis create error:', error);
      throw error;
    }
  }

  async update(
    id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session | null> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      const updated: Session = {
        ...existing,
        ...payload,
        updatedAt: new Date(),
      };

      await this.redisClient.set(
        this.getSessionKey(id),
        JSON.stringify(updated),
        { EX: 60 * 60 * 24 * 365 }, // 1 year expiration
      );

      return updated;
    } catch (error) {
      console.error('Redis update error:', error);
      throw error;
    }
  }

  async deleteById(id: Session['id']): Promise<void> {
    try {
      // Get session to find user ID
      const session = await this.findById(id);
      if (session) {
        // Remove from user's session set
        await this.redisClient.sRem(
          this.getUserSessionsKey(session.user.id),
          id as string,
        );
      }

      // Delete the session
      await this.redisClient.del(this.getSessionKey(id));
    } catch (error) {
      console.error('Redis deleteById error:', error);
      throw error;
    }
  }

  async deleteByUserId(conditions: { userId: User['id'] }): Promise<void> {
    try {
      const userSessionsKey = this.getUserSessionsKey(conditions.userId);
      const sessionIds = await this.redisClient.sMembers(userSessionsKey);

      if (sessionIds.length > 0) {
        // Delete all sessions
        const sessionKeys = sessionIds.map((id) => this.getSessionKey(id));
        await this.redisClient.del(sessionKeys);

        // Clear user's session set
        await this.redisClient.del(userSessionsKey);
      }
    } catch (error) {
      console.error('Redis deleteByUserId error:', error);
      throw error;
    }
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: User['id'];
    excludeSessionId: Session['id'];
  }): Promise<void> {
    try {
      const userSessionsKey = this.getUserSessionsKey(conditions.userId);
      const sessionIds = await this.redisClient.sMembers(userSessionsKey);

      const sessionIdsToDelete = sessionIds.filter(
        (id) => id !== conditions.excludeSessionId,
      );

      if (sessionIdsToDelete.length > 0) {
        // Delete sessions except the excluded one
        const sessionKeys = sessionIdsToDelete.map((id) =>
          this.getSessionKey(id),
        );
        await this.redisClient.del(sessionKeys);

        // Remove deleted session IDs from user's session set
        await this.redisClient.sRem(userSessionsKey, sessionIdsToDelete);
      }
    } catch (error) {
      console.error('Redis deleteByUserIdWithExclude error:', error);
      throw error;
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
