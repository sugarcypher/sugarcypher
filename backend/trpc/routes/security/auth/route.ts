import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { TRPCError } from '@trpc/server';

// Create protectedProcedure as alias for now
const protectedProcedure = publicProcedure;

// Input validation schemas
const createSessionSchema = z.object({
  userId: z.string().min(1).max(100),
  deviceFingerprint: z.string().min(1),
  clientTimestamp: z.number()
});

const validateSessionSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  deviceFingerprint: z.string().min(1)
});

const securityHealthSchema = z.object({
  sessionId: z.string().optional(),
  clientVersion: z.string().optional()
});

// Temporary in-memory session store (in production, use Redis or database)
const activeSessions = new Map<string, {
  userId: string;
  deviceFingerprint: string;
  createdAt: number;
  lastActivity: number;
  isActive: boolean;
}>();

// Rate limiting store
const rateLimitStore = new Map<string, {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
}>();

// Security configuration
const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 10
};

// Helper function to check rate limiting
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      lastAttempt: now,
      lockedUntil: 0
    });
    return true;
  }
  
  // Check if locked out
  if (now < record.lockedUntil) {
    return false;
  }
  
  // Reset if window expired
  if (now - record.lastAttempt > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
    record.attempts = 1;
    record.lastAttempt = now;
    return true;
  }
  
  // Increment attempts
  record.attempts++;
  record.lastAttempt = now;
  
  // Lock if exceeded
  if (record.attempts > SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    record.lockedUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION;
    return false;
  }
  
  return true;
}

// Helper function to generate secure session ID
function generateSessionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(timestamp + random).toString('base64');
}

// Create secure session
export const createSessionProcedure = publicProcedure
  .input(createSessionSchema)
  .mutation(async ({ input, ctx }: { input: z.infer<typeof createSessionSchema>, ctx: any }) => {
    const clientIp = ctx.req.headers.get('x-forwarded-for') || 
                     ctx.req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please try again later.'
      });
    }
    
    try {
      // Validate timestamp (prevent replay attacks)
      const now = Date.now();
      const timeDiff = Math.abs(now - input.clientTimestamp);
      if (timeDiff > 300000) { // 5 minutes tolerance
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid timestamp. Please sync your device clock.'
        });
      }
      
      // Generate session
      const sessionId = generateSessionId();
      const session = {
        userId: input.userId,
        deviceFingerprint: input.deviceFingerprint,
        createdAt: now,
        lastActivity: now,
        isActive: true
      };
      
      // Store session
      activeSessions.set(sessionId, session);
      
      // Clean up old sessions for this user
      for (const [id, sess] of activeSessions.entries()) {
        if (sess.userId === input.userId && 
            now - sess.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
          activeSessions.delete(id);
        }
      }
      
      return {
        sessionId,
        expiresAt: now + SECURITY_CONFIG.SESSION_TIMEOUT,
        success: true
      };
      
    } catch (error) {
      console.error('Session creation failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create secure session'
      });
    }
  });

// Validate session
export const validateSessionProcedure = publicProcedure
  .input(validateSessionSchema)
  .query(async ({ input, ctx }: { input: z.infer<typeof validateSessionSchema>, ctx: any }) => {
    const clientIp = ctx.req.headers.get('x-forwarded-for') || 
                     ctx.req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please try again later.'
      });
    }
    
    try {
      const session = activeSessions.get(input.sessionId);
      
      if (!session) {
        return {
          valid: false,
          reason: 'Session not found'
        };
      }
      
      // Check if session expired
      const now = Date.now();
      if (now - session.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
        activeSessions.delete(input.sessionId);
        return {
          valid: false,
          reason: 'Session expired'
        };
      }
      
      // Validate user and device
      if (session.userId !== input.userId || 
          session.deviceFingerprint !== input.deviceFingerprint) {
        return {
          valid: false,
          reason: 'Session validation failed'
        };
      }
      
      // Update last activity
      session.lastActivity = now;
      
      return {
        valid: true,
        expiresAt: now + SECURITY_CONFIG.SESSION_TIMEOUT,
        lastActivity: session.lastActivity
      };
      
    } catch (error) {
      console.error('Session validation failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate session'
      });
    }
  });

// Invalidate session
export const invalidateSessionProcedure = publicProcedure
  .input(z.object({ sessionId: z.string() }))
  .mutation(async ({ input }: { input: { sessionId: string } }) => {
    try {
      const deleted = activeSessions.delete(input.sessionId);
      
      return {
        success: deleted,
        message: deleted ? 'Session invalidated' : 'Session not found'
      };
      
    } catch (error) {
      console.error('Session invalidation failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to invalidate session'
      });
    }
  });

// Security health check
export const securityHealthCheckProcedure = publicProcedure
  .input(securityHealthSchema)
  .query(async ({ input, ctx }: { input: z.infer<typeof securityHealthSchema>, ctx: any }) => {
    try {
      const now = Date.now();
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      // Check session if provided
      if (input.sessionId) {
        const session = activeSessions.get(input.sessionId);
        if (!session) {
          issues.push('Session not found or expired');
          recommendations.push('Please re-authenticate');
        } else if (now - session.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT / 2) {
          issues.push('Session will expire soon');
          recommendations.push('Consider refreshing your session');
        }
      }
      
      // Check rate limiting status
      const clientIp = ctx.req.headers.get('x-forwarded-for') || 
                       ctx.req.headers.get('x-real-ip') || 
                       'unknown';
      const rateLimit = rateLimitStore.get(clientIp);
      if (rateLimit && now < rateLimit.lockedUntil) {
        issues.push('IP address is rate limited');
        recommendations.push(`Wait ${Math.ceil((rateLimit.lockedUntil - now) / 60000)} minutes`);
      }
      
      // Clean up expired sessions
      let expiredCount = 0;
      for (const [id, session] of activeSessions.entries()) {
        if (now - session.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
          activeSessions.delete(id);
          expiredCount++;
        }
      }
      
      // Determine status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (issues.length > 0) {
        status = issues.some(issue => 
          issue.includes('rate limited') || 
          issue.includes('not found')
        ) ? 'critical' : 'warning';
      }
      
      return {
        status,
        issues,
        recommendations,
        stats: {
          activeSessions: activeSessions.size,
          expiredSessionsCleanedUp: expiredCount,
          serverTime: now
        }
      };
      
    } catch (error) {
      console.error('Security health check failed:', error);
      return {
        status: 'critical' as const,
        issues: ['Security health check failed'],
        recommendations: ['Contact support if this persists'],
        stats: {
          activeSessions: 0,
          expiredSessionsCleanedUp: 0,
          serverTime: Date.now()
        }
      };
    }
  });

// Get security metrics (admin only - would need auth in production)
export const getSecurityMetricsProcedure = publicProcedure
  .query(async () => {
    try {
      const now = Date.now();
      const activeSessionCount = activeSessions.size;
      const rateLimitedIPs = Array.from(rateLimitStore.entries())
        .filter(([_, record]) => now < record.lockedUntil)
        .length;
      
      // Calculate session age distribution
      const sessionAges = Array.from(activeSessions.values())
        .map(session => now - session.createdAt);
      
      const avgSessionAge = sessionAges.length > 0 
        ? sessionAges.reduce((a, b) => a + b, 0) / sessionAges.length 
        : 0;
      
      return {
        activeSessions: activeSessionCount,
        rateLimitedIPs,
        averageSessionAge: Math.round(avgSessionAge / 1000), // in seconds
        oldestSession: sessionAges.length > 0 ? Math.max(...sessionAges) : 0,
        newestSession: sessionAges.length > 0 ? Math.min(...sessionAges) : 0,
        serverUptime: process.uptime() * 1000, // in milliseconds
        timestamp: now
      };
      
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve security metrics'
      });
    }
  });