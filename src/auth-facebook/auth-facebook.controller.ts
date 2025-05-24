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
import { AuthFacebookService } from './auth-facebook.service';
import { AuthFacebookLoginDto } from './dto/auth-facebook-login.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { IpAddressHelper } from '../utils/ip-address.helper';

@ApiTags('Auth')
@Controller({
  path: 'auth/facebook',
  version: '1',
})
export class AuthFacebookController {
  constructor(
    private readonly authService: AuthService,
    private readonly authFacebookService: AuthFacebookService,
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
    @Body() loginDto: AuthFacebookLoginDto,
    @Request() request,
  ): Promise<LoginResponseDto> {
    const socialData =
      await this.authFacebookService.getProfileByToken(loginDto);

    const result = await this.authService.validateSocialLogin(
      'facebook',
      socialData,
    );

    // Log Facebook login
    if (result && result.user) {
      const ipAddress = IpAddressHelper.getClientIp(request);
      const userAgent = IpAddressHelper.getUserAgent(request);

      await this.auditLogsService.logLogin(result.user, ipAddress, userAgent, {
        provider: 'facebook',
        socialId: socialData.id,
      });
    }

    return result;
  }
}
