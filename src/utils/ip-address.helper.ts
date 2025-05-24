import { Request } from 'express';

export class IpAddressHelper {
  static getClientIp(request: Request): string {
    // Check for various proxy headers
    const xForwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];
    const cfConnectingIp = request.headers['cf-connecting-ip'];
    const xClientIp = request.headers['x-client-ip'];
    const xClusterClientIp = request.headers['x-cluster-client-ip'];

    // X-Forwarded-For can contain multiple IPs, take the first one (original client)
    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(',')[0];
      return ips.trim();
    }

    // Check other headers
    if (xRealIp) {
      return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
    }

    if (cfConnectingIp) {
      return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
    }

    if (xClientIp) {
      return Array.isArray(xClientIp) ? xClientIp[0] : xClientIp;
    }

    if (xClusterClientIp) {
      return Array.isArray(xClusterClientIp)
        ? xClusterClientIp[0]
        : xClusterClientIp;
    }

    // Fallback to connection remote address
    const remoteAddress = request.socket.remoteAddress;

    // Handle IPv6 mapped IPv4 addresses
    if (remoteAddress && remoteAddress.startsWith('::ffff:')) {
      return remoteAddress.substring(7);
    }

    return remoteAddress || 'unknown';
  }

  static getUserAgent(request: Request): string | undefined {
    return request.headers['user-agent'];
  }

  static getEndpoint(request: Request): string {
    return `${request.method} ${request.originalUrl || request.url}`;
  }

  static isValidIp(ip: string): boolean {
    if (ip === 'unknown') return false;

    // IPv4 regex
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 regex (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  static sanitizeIp(ip: string): string {
    if (!ip || ip === 'unknown') {
      return 'unknown';
    }

    // Remove any potential malicious content
    const sanitized = ip.replace(/[^a-fA-F0-9:.]/g, '');

    return this.isValidIp(sanitized) ? sanitized : 'unknown';
  }
}
