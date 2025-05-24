import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../audit-logs.service';
import { Request } from 'express';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    const user = (request as any).user;
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];
    const method = request.method;
    const endpoint = request.url;

    return next.handle().pipe(
      tap(async () => {
        const statusCode = response.statusCode;

        // Only log certain types of requests
        if (this.shouldLogRequest(method, endpoint, statusCode)) {
          try {
            await this.auditLogsService.logApiAccess(
              user || null,
              ipAddress,
              endpoint,
              method,
              userAgent,
            );
          } catch (error) {
            // Don't throw errors from audit logging
            console.error('Error logging audit:', error);
          }
        }
      }),
    );
  }

  private getClientIp(request: Request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];
    const cfConnectingIp = request.headers['cf-connecting-ip'];

    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(',')[0];
      return ips.trim();
    }

    if (xRealIp) {
      return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
    }

    if (cfConnectingIp) {
      return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
    }

    return request.socket.remoteAddress || 'unknown';
  }

  private shouldLogRequest(
    method: string,
    endpoint: string,
    statusCode: number,
  ): boolean {
    // Skip health checks and other non-important endpoints
    const skipEndpoints = [
      '/health',
      '/metrics',
      '/favicon.ico',
      '/api/v1/docs',
      '/api/v1/docs-json',
    ];

    if (skipEndpoints.some((skip) => endpoint.includes(skip))) {
      return false;
    }

    // Skip OPTIONS requests
    if (method === 'OPTIONS') {
      return false;
    }

    // Skip static file requests
    if (
      endpoint.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
    ) {
      return false;
    }

    // Only log successful requests and client errors (4xx), skip server errors (5xx)
    if (statusCode >= 500) {
      return false;
    }

    return true;
  }
}
