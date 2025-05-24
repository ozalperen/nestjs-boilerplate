import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StatusDto {
  @ApiProperty()
  @IsString()
  id: number | string;
}
