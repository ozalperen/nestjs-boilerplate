import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuditLogsService } from './audit-logs.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { AuditLog } from './domain/audit-log';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { NullableType } from '../utils/types/nullable.type';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'audit-logs',
  version: '1',
})
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit logs with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @SerializeOptions({
    groups: ['admin'],
  })
  async findAll(
    @Query() query: QueryAuditLogDto,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<InfinityPaginationResponseDto<AuditLog>> {
    const auditLogs = await this.auditLogsService.findAllWithPagination({
      paginationOptions: {
        page,
        limit: limit > 50 ? 50 : limit,
      },
      ...query,
    });

    return infinityPagination(auditLogs, { page, limit });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user audit logs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @SerializeOptions({
    groups: ['me'],
  })
  async findMyLogs(
    @Request() request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<InfinityPaginationResponseDto<AuditLog>> {
    const auditLogs = await this.auditLogsService.findByUserId(
      request.user.id,
      {
        page,
        limit: limit > 50 ? 50 : limit,
      },
    );

    return infinityPagination(auditLogs, { page, limit });
  }

  @Get('stats/user/:userId')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit statistics for a specific user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User audit statistics retrieved successfully',
  })
  async getUserStats(@Param('userId') userId: string) {
    return this.auditLogsService.getStatsByUser(userId);
  }

  @Get('stats/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit statistics for current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user audit statistics retrieved successfully',
  })
  async getMyStats(@Request() request) {
    return this.auditLogsService.getStatsByUser(request.user.id);
  }

  @Get('stats/ip/:ipAddress')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit statistics for a specific IP address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'IP address audit statistics retrieved successfully',
  })
  async getIpStats(@Param('ipAddress') ipAddress: string) {
    return this.auditLogsService.getStatsByIpAddress(ipAddress);
  }

  @Get('user/:userId')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @SerializeOptions({
    groups: ['admin'],
  })
  async findByUserId(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<InfinityPaginationResponseDto<AuditLog>> {
    const auditLogs = await this.auditLogsService.findByUserId(userId, {
      page,
      limit: limit > 50 ? 50 : limit,
    });

    return infinityPagination(auditLogs, { page, limit });
  }

  @Get('ip/:ipAddress')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit logs for a specific IP address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'IP address audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @SerializeOptions({
    groups: ['admin'],
  })
  async findByIpAddress(
    @Param('ipAddress') ipAddress: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<InfinityPaginationResponseDto<AuditLog>> {
    const auditLogs = await this.auditLogsService.findByIpAddress(ipAddress, {
      page,
      limit: limit > 50 ? 50 : limit,
    });

    return infinityPagination(auditLogs, { page, limit });
  }

  @Get(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit log retrieved successfully',
    type: AuditLog,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  async findOne(@Param('id') id: string): Promise<NullableType<AuditLog>> {
    return this.auditLogsService.findById(id);
  }
}
