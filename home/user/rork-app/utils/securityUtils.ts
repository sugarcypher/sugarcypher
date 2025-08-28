import { Platform } from 'react-native';
import { securityManager, privacyManager, DataClassification } from '@/lib/security';
import { useSecurityStore } from '@/store/securityStore';

// Utility functions for secure data handling throughout the app

export class SecureDataHandler {
  // Encrypt food log data before storage
  static async encryptFoodData(foodData: any): Promise<string> {
    try {
      const { encryptSensitiveData } = useSecurityStore.getState();
      return await encryptSensitiveData(foodData, DataClassification.CONFIDENTIAL);
    } catch (error) {
      console.error('Failed to encrypt food data:', error);
      // Fallback to storing unencrypted if encryption fails
      return JSON.stringify(foodData);
    }
  }

  // Decrypt food log data after retrieval
  static async decryptFoodData(encryptedData: string): Promise<any> {
    try {
      const { decryptSensitiveData } = useSecurityStore.getState();
      return await decryptSensitiveData(encryptedData);
    } catch (error) {
      console.error('Failed to decrypt food data:', error);
      // Fallback to parsing as regular JSON
      try {
        return JSON.parse(encryptedData);
      } catch (parseError) {
        console.error('Failed to parse fallback data:', parseError);
        return null;
      }
    }
  }

  // Sanitize user input to prevent injection attacks
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>\"'%;()&+]/g, '') // Remove potentially dangerous characters
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Validate image data before processing
  static validateImageData(imageData: string): boolean {
    if (!imageData || typeof imageData !== 'string') return false;
    
    // Check if it's a valid base64 image
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    if (!base64Regex.test(imageData)) return false;
    
    // Check size (limit to 10MB)
    const sizeInBytes = (imageData.length * 3) / 4;
    if (sizeInBytes > 10 * 1024 * 1024) return false;
    
    return true;
  }

  // Anonymize scan history for analytics
  static anonymizeScanData(scanData: any): any {
    const anonymized = { ...scanData };
    
    // Remove or hash identifying information
    delete anonymized.userId;
    delete anonymized.deviceId;
    delete anonymized.location;
    
    // Generalize timestamps
    if (anonymized.timestamp) {
      anonymized.timestamp = Math.floor(anonymized.timestamp / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
    }
    
    // Keep only essential nutritional data
    return {
      sugarContent: anonymized.sugarContent,
      productCategory: anonymized.productCategory,
      hiddenSugarsFound: anonymized.hiddenSugars?.length || 0,
      timestamp: anonymized.timestamp
    };
  }

  // Generate secure session token
  static async generateSecureToken(): Promise<string> {
    try {
      return await securityManager.generateToken(32);
    } catch (error) {
      console.error('Failed to generate secure token:', error);
      // Fallback to less secure but functional token
      return Date.now().toString() + Math.random().toString(36).substring(2);
    }
  }

  // Validate API response integrity
  static async validateApiResponse(response: any, expectedFields: string[]): Promise<boolean> {
    if (!response || typeof response !== 'object') return false;
    
    // Check required fields
    for (const field of expectedFields) {
      if (!(field in response)) return false;
    }
    
    // Additional validation for specific response types
    if (response.sugarContent !== undefined) {
      if (typeof response.sugarContent !== 'number' || response.sugarContent < 0) return false;
    }
    
    if (response.productName !== undefined) {
      if (typeof response.productName !== 'string' || response.productName.length > 200) return false;
    }
    
    return true;
  }

  // Rate limiting for API calls
  private static apiCallTimestamps: Map<string, number[]> = new Map();
  
  static checkRateLimit(endpoint: string, maxCalls: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const calls = this.apiCallTimestamps.get(endpoint) || [];
    
    // Remove old calls outside the window
    const recentCalls = calls.filter(timestamp => now - timestamp < windowMs);
    
    if (recentCalls.length >= maxCalls) {
      return false; // Rate limit exceeded
    }
    
    // Add current call
    recentCalls.push(now);
    this.apiCallTimestamps.set(endpoint, recentCalls);
    
    return true;
  }

  // Secure storage key generation
  static generateStorageKey(prefix: string, userId?: string): string {
    const sanitizedPrefix = this.sanitizeInput(prefix);
    const userPart = userId ? `_${userId.substring(0, 8)}` : '';
    return `cypher_${sanitizedPrefix}${userPart}`;
  }

  // Check if data should be anonymized based on age
  static shouldAnonymizeData(timestamp: number): boolean {
    const settings = privacyManager.getSettings();
    const dataAge = Date.now() - timestamp;
    return privacyManager.shouldAnonymizeData(dataAge);
  }

  // Check if data should be deleted based on retention policy
  static shouldDeleteData(timestamp: number): boolean {
    const settings = privacyManager.getSettings();
    const dataAge = Date.now() - timestamp;
    return privacyManager.shouldDeleteData(dataAge);
  }

  // Secure comparison to prevent timing attacks
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  // Generate content security policy for web views
  static generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://toolkit.rork.com",
      "font-src 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'"
    ].join('; ');
  }

  // Validate and sanitize barcode data
  static validateBarcode(barcode: string): string | null {
    if (!barcode || typeof barcode !== 'string') return null;
    
    // Remove non-numeric characters
    const cleaned = barcode.replace(/\D/g, '');
    
    // Check common barcode formats
    if (cleaned.length === 12 || cleaned.length === 13 || cleaned.length === 8) {
      return cleaned;
    }
    
    return null;
  }

  // Secure random number generation
  static async generateSecureRandom(min: number, max: number): Promise<number> {
    try {
      const token = await securityManager.generateToken(4);
      const randomValue = parseInt(token.substring(0, 8), 16);
      return min + (randomValue % (max - min + 1));
    } catch (error) {
      console.error('Failed to generate secure random:', error);
      return min + Math.floor(Math.random() * (max - min + 1));
    }
  }

  // Detect suspicious activity patterns
  static detectSuspiciousActivity(activities: any[]): {
    suspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    // Check for too many rapid requests
    const recentActivities = activities.filter(a => 
      Date.now() - a.timestamp < 60000 // Last minute
    );
    
    if (recentActivities.length > 20) {
      reasons.push('Too many rapid requests');
    }
    
    // Check for unusual patterns
    const uniqueIPs = new Set(activities.map(a => a.ip)).size;
    if (uniqueIPs > 5 && activities.length < 50) {
      reasons.push('Multiple IP addresses');
    }
    
    // Check for repeated failed attempts
    const failedAttempts = activities.filter(a => a.status === 'failed').length;
    if (failedAttempts > 10) {
      reasons.push('Multiple failed attempts');
    }
    
    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  // Clean up expired data
  static async cleanupExpiredData(): Promise<void> {
    try {
      const { anonymizeOldData } = useSecurityStore.getState();
      await anonymizeOldData();
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
    }
  }

  // Generate integrity hash for data verification
  static generateIntegrityHash(data: any): string {
    try {
      const jsonString = JSON.stringify(data, Object.keys(data).sort());
      return require('crypto-js').SHA256(jsonString).toString();
    } catch (error) {
      console.error('Failed to generate integrity hash:', error);
      return '';
    }
  }

  // Verify data integrity
  static verifyIntegrity(data: any, expectedHash: string): boolean {
    const currentHash = this.generateIntegrityHash(data);
    return this.secureCompare(currentHash, expectedHash);
  }
}

// Export utility functions for easy access
export const {
  encryptFoodData,
  decryptFoodData,
  sanitizeInput,
  validateImageData,
  anonymizeScanData,
  generateSecureToken,
  validateApiResponse,
  checkRateLimit,
  generateStorageKey,
  shouldAnonymizeData,
  shouldDeleteData,
  secureCompare,
  generateCSP,
  validateBarcode,
  generateSecureRandom,
  detectSuspiciousActivity,
  cleanupExpiredData,
  generateIntegrityHash,
  verifyIntegrity
} = SecureDataHandler;

// Security middleware for API calls
export const securityMiddleware = {
  // Pre-request security checks
  beforeRequest: async (endpoint: string, data: any) => {
    // Check rate limiting
    if (!checkRateLimit(endpoint)) {
      throw new Error('Rate limit exceeded');
    }
    
    // Sanitize input data
    if (data && typeof data === 'object') {
      for (const key in data) {
        if (typeof data[key] === 'string') {
          data[key] = sanitizeInput(data[key]);
        }
      }
    }
    
    return data;
  },
  
  // Post-response security checks
  afterResponse: async (response: any, expectedFields: string[]) => {
    // Validate response structure
    if (!await validateApiResponse(response, expectedFields)) {
      throw new Error('Invalid response structure');
    }
    
    return response;
  }
};

// Security event logger
export const securityLogger = {
  logSecurityEvent: (event: string, details: any) => {
    const logEntry = {
      timestamp: Date.now(),
      event,
      details: anonymizeScanData(details),
      platform: Platform.OS,
      version: '1.0.0'
    };
    
    // In production, send to secure logging service
    console.log('Security Event:', logEntry);
  },
  
  logSuspiciousActivity: (activity: any) => {
    securityLogger.logSecurityEvent('suspicious_activity', activity);
  },
  
  logDataAccess: (dataType: string, operation: string) => {
    securityLogger.logSecurityEvent('data_access', { dataType, operation });
  }
};