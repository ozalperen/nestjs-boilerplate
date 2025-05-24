import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  Request,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AuthGoogleService } from './auth-google.service';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { IpAddressHelper } from '../utils/ip-address.helper';

@ApiTags('Auth')
@Controller({
  path: 'auth/google',
  version: '1',
})
export class AuthGoogleController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGoogleService: AuthGoogleService,
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
    @Body() loginDto: AuthGoogleLoginDto,
    @Request() request,
  ): Promise<LoginResponseDto> {
    const socialData = await this.authGoogleService.getProfileByToken(loginDto);
    const result = await this.authService.validateSocialLogin(
      'google',
      socialData,
    );

    // Log Google login
    if (result && result.user) {
      const ipAddress = IpAddressHelper.getClientIp(request);
      const userAgent = IpAddressHelper.getUserAgent(request);

      await this.auditLogsService.logLogin(result.user, ipAddress, userAgent, {
        provider: 'google',
        socialId: socialData.id,
      });
    }

    return result;
  }
}
