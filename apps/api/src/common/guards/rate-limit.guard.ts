/**
 * Rate Limiting Guard
 * Protects against API abuse and DDoS attacks
 * Uses in-memory store (for production, use Redis)
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();

  // ✅ Limites adaptées par type d'endpoint
  private readonly limits = {
    // Endpoints lourds (write operations)
    strict: { maxRequests: 50, windowMs: 15 * 60 * 1000 }, // 50 req/15min

    // Endpoints légers (read operations)
    moderate: { maxRequests: 300, windowMs: 15 * 60 * 1000 }, // 300 req/15min

    // Endpoints très légers (map markers, etc.)
    lenient: { maxRequests: 600, windowMs: 15 * 60 * 1000 }, // 600 req/15min
  };

  // Par défaut : moderate
  private readonly maxRequests = this.limits.moderate.maxRequests;
  private readonly windowMs = this.limits.moderate.windowMs;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const path: string = request.url || '';

    // Déterminer la limite selon l'endpoint
    const limit = this.getLimitForPath(path);
    const key = `${ip}:${limit.type}`; // Clé unique par IP et type

    const now = Date.now();
    const entry = this.store.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      this.cleanup(now);
    }

    if (!entry || now > entry.resetTime) {
      // New window
      this.store.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
      });
      return true;
    }

    if (entry.count >= limit.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many requests for ${limit.type} endpoints. Limit: ${limit.maxRequests}/${limit.windowMs / 60000}min`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count++;
    this.store.set(key, entry);
    return true;
  }

  /**
   * Détermine la limite selon le type d'endpoint
   */
  private getLimitForPath(path: string): {
    maxRequests: number;
    windowMs: number;
    type: string;
  } {
    // Endpoints très légers (GET rapides)
    if (
      path.includes('/map-markers') ||
      path.includes('/validate') ||
      path.includes('/user/me')
    ) {
      return { ...this.limits.lenient, type: 'lenient' };
    }

    // Endpoints stricts (POST/PATCH/DELETE)
    if (
      path.includes('POST') ||
      path.includes('PATCH') ||
      path.includes('DELETE') ||
      path.includes('/publish')
    ) {
      return { ...this.limits.strict, type: 'strict' };
    }

    // Par défaut : moderate (GET avec filtres)
    return { ...this.limits.moderate, type: 'moderate' };
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  private cleanup(now: number): void {
    for (const [ip, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(ip);
      }
    }
  }
}
