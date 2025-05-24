import { registerAs } from '@nestjs/config';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { RedisConfig } from './redis-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  REDIS_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  REDIS_DB: number;

  @IsString()
  @IsOptional()
  REDIS_KEY_PREFIX: string;
}

export default registerAs<RedisConfig>('redis', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.REDIS_HOST ?? 'redis',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'session:',
  };
});
