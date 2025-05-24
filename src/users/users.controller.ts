import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  Request,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';

import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { QueryUserDto } from './dto/query-user.dto';
import { User } from './domain/user';
import { UsersService } from './users.service';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { IpAddressHelper } from '../utils/ip-address.helper';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @ApiCreatedResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProfileDto: CreateUserDto,
    @Request() request,
  ): Promise<User> {
    const adminUser = request.user;
    const ipAddress = IpAddressHelper.getClientIp(request);
    const userAgent = IpAddressHelper.getUserAgent(request);

    const newUser = await this.usersService.create(createProfileDto);

    // Log user creation
    await this.auditLogsService.logUserCreate(
      adminUser,
      newUser,
      ipAddress,
      userAgent,
    );

    return newUser;
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(User),
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryUserDto,
  ): Promise<InfinityPaginationResponseDto<User>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.usersService.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @ApiOkResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  findOne(@Param('id') id: User['id']): Promise<NullableType<User>> {
    return this.usersService.findById(id);
  }

  @ApiOkResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async update(
    @Param('id') id: User['id'],
    @Body() updateProfileDto: UpdateUserDto,
    @Request() request,
  ): Promise<User | null> {
    const adminUser = request.user;
    const ipAddress = IpAddressHelper.getClientIp(request);
    const userAgent = IpAddressHelper.getUserAgent(request);

    // Get the user before update to log the changes
    const existingUser = await this.usersService.findById(id);
    const updatedUser = await this.usersService.update(id, updateProfileDto);

    if (updatedUser && existingUser) {
      // Log user update
      await this.auditLogsService.logUserUpdate(
        adminUser,
        updatedUser,
        ipAddress,
        userAgent,
        { updatedFields: Object.keys(updateProfileDto) },
      );
    }

    return updatedUser;
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: User['id'], @Request() request): Promise<void> {
    const adminUser = request.user;
    const ipAddress = IpAddressHelper.getClientIp(request);
    const userAgent = IpAddressHelper.getUserAgent(request);

    // Get the user before deletion for logging
    const userToDelete = await this.usersService.findById(id);

    await this.usersService.remove(id);

    if (userToDelete) {
      // Log user deletion
      await this.auditLogsService.logUserDelete(
        adminUser,
        userToDelete,
        ipAddress,
        userAgent,
      );
    }
  }
}
