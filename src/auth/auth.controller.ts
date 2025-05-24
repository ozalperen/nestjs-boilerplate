import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  Delete,
  SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { IpAddressHelper } from '../utils/ip-address.helper';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginDto: AuthEmailLoginDto,
    @Request() request,
  ): Promise<LoginResponseDto> {
    const result = await this.service.validateLogin(loginDto);

    // Log successful login
    if (result && result.user) {
      const ipAddress = IpAddressHelper.getClientIp(request);
      const userAgent = IpAddressHelper.getUserAgent(request);

      await this.auditLogsService.logLogin(result.user, ipAddress, userAgent, {
        provider: 'email',
      });
    }

    return result;
  }

  @Post('email/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(
    @Body() createUserDto: AuthRegisterLoginDto,
    @Request() request,
  ): Promise<void> {
    const result = await this.service.register(createUserDto);

    // Log registration attempt
    const ipAddress = IpAddressHelper.getClientIp(request);
    const userAgent = IpAddressHelper.getUserAgent(request);

    // Note: We might not have the user object immediately after registration
    // depending on email confirmation flow
    await this.auditLogsService.create({
      user: null,
      action: 'REGISTER' as any,
      description: `Registration attempt for email: ${createUserDto.email}`,
      ipAddress,
      userAgent,
      endpoint: 'POST /auth/email/register',
      method: 'POST',
      metadata: { email: createUserDto.email, provider: 'email' },
    });

    return result;
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Post('email/confirm/new')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmNewEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(
    @Body() resetPasswordDto: AuthResetPasswordDto,
    @Request() request,
  ): Promise<void> {
    const result = await this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );

    // Log password reset
    const ipAddress = IpAddressHelper.getClientIp(request);
    const userAgent = IpAddressHelper.getUserAgent(request);

    // Note: We might not have the user object from the hash lookup
    await this.auditLogsService.create({
      user: null,
      action: 'PASSWORD_RESET' as any,
      description: 'Password reset completed',
      ipAddress,
      userAgent,
      endpoint: 'POST /auth/reset/password',
      method: 'POST',
      metadata: { hash: resetPasswordDto.hash },
    });

    return result;
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.service.me(request.user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<RefreshResponseDto> {
    return this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    const user = request.user;
    const ipAddress = IpAddressHelper.getClientIp(request);
    const userAgent = IpAddressHelper.getUserAgent(request);

    await this.service.logout({
      sessionId: request.user.sessionId,
    });

    // Log logout
    await this.auditLogsService.logLogout(user, ipAddress, userAgent);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public async update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    const user = request.user;
    const ipAddress = IpAddressHelper.getClientIp(request);
    const userAgent = IpAddressHelper.getUserAgent(request);

    const updatedUser = await this.service.update(user, userDto);

    // Log profile update
    await this.auditLogsService.logProfileUpdate(user, ipAddress, userAgent, {
      updatedFields: Object.keys(userDto),
    });

    return updatedUser;
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    const user = request.user;
    const ipAddress = IpAddressHelper.getClientIp(request);
    const userAgent = IpAddressHelper.getUserAgent(request);

    await this.service.softDelete(user);

    // Log account deletion
    await this.auditLogsService.create({
      user,
      action: 'USER_DELETE' as any,
      description: `User ${user.email} deleted their account`,
      ipAddress,
      userAgent,
      endpoint: 'DELETE /auth/me',
      method: 'DELETE',
      metadata: { selfDelete: true },
    });
  }
}
