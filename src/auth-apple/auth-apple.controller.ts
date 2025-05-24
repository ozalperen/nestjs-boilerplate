import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  SerializeOptions,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AuthAppleService } from './auth-apple.service';
import { AuthAppleLoginDto } from './dto/auth-apple-login.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { IpAddressHelper } from '../utils/ip-address.helper';

@ApiTags('Auth')
@Controller({
  path: 'auth/apple',
  version: '1',
})
export class AuthAppleController {
  constructor(
    private readonly authService: AuthService,
    private readonly authAppleService: AuthAppleService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: AuthAppleLoginDto,
    @Request() request,
  ): Promise<LoginResponseDto> {
    const socialData = await this.authAppleService.getProfileByToken(loginDto);

    const result = await this.authService.validateSocialLogin(
      'apple',
      socialData,
    );

    // Log Apple login
    if (result && result.user) {
      const ipAddress = IpAddressHelper.getClientIp(request);
      const userAgent = IpAddressHelper.getUserAgent(request);

      await this.auditLogsService.logLogin(result.user, ipAddress, userAgent, {
        provider: 'apple',
        socialId: socialData.id,
      });
    }

    return result;
  }
}
