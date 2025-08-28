import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

// Security configuration constants
const SECURITY_CONFIG = {
  ENCRYPTION_KEY_LENGTH: 32,
  SALT_LENGTH: 16,
  IV_LENGTH: 16,
  PBKDF2_ITERATIONS: 10000,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

// Privacy compliance levels
export enum PrivacyLevel {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  MAXIMUM = 'maximum'
}

// Data classification levels
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  timestamp: number;
  classification: DataClassification;
}

interface SecuritySession {
  sessionId: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  deviceFingerprint: string;
  isActive: boolean;
  expiresAt: number;
}

interface PrivacySettings {
  level: PrivacyLevel;
  dataRetentionDays: number;
  anonymizeAfterDays: number;
  allowAnalytics: boolean;
  allowCrashReporting: boolean;
  shareUsageData: boolean;
  localProcessingOnly: boolean;
}

class SecurityManager {
  private masterKey: string | null = null;
  private currentSession: SecuritySession | null = null;
  private failedAttempts: number = 0;
  private lockoutUntil: number = 0;

  // Initialize security system
  async initialize(): Promise<void> {
    try {
      await this.generateOrRetrieveMasterKey();
      await this.initializeDeviceFingerprint();
      await this.cleanupExpiredSessions();
    } catch (error) {
      console.error('Security initialization failed:', error);
      throw new Error('Security system initialization failed');
    }
  }

  // Generate or retrieve master encryption key
  private async generateOrRetrieveMasterKey(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback - use localStorage with warning
        const stored = localStorage.getItem('cypher_master_key');
        if (stored) {
          this.masterKey = stored;
        } else {
          this.masterKey = await this.generateSecureKey();
          localStorage.setItem('cypher_master_key', this.masterKey);
        }
      } else {
        // Use secure store on mobile
        const stored = await SecureStore.getItemAsync('cypher_master_key');
        if (stored) {
          this.masterKey = stored;
        } else {
          this.masterKey = await this.generateSecureKey();
          await SecureStore.setItemAsync('cypher_master_key', this.masterKey);
        }
      }
    } catch (error) {
      console.error('Master key generation failed:', error);
      throw error;
    }
  }

  // Generate cryptographically secure key
  private async generateSecureKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(SECURITY_CONFIG.ENCRYPTION_KEY_LENGTH);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Create device fingerprint for session validation
  private async initializeDeviceFingerprint(): Promise<string> {
    try {
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        timestamp: Date.now(),
        random: await Crypto.getRandomBytesAsync(8)
      };
      
      const fingerprint = CryptoJS.SHA256(JSON.stringify(deviceInfo)).toString();
      
      if (Platform.OS === 'web') {
        localStorage.setItem('cypher_device_fp', fingerprint);
      } else {
        await SecureStore.setItemAsync('cypher_device_fp', fingerprint);
      }
      
      return fingerprint;
    } catch (error) {
      console.error('Device fingerprint creation failed:', error);
      return 'fallback_fingerprint';
    }
  }

  // Encrypt sensitive data
  async encryptData(
    data: any, 
    classification: DataClassification = DataClassification.CONFIDENTIAL
  ): Promise<EncryptedData> {
    if (!this.masterKey) {
      throw new Error('Security system not initialized');
    }

    try {
      const salt = CryptoJS.lib.WordArray.random(SECURITY_CONFIG.SALT_LENGTH);
      const iv = CryptoJS.lib.WordArray.random(SECURITY_CONFIG.IV_LENGTH);
      
      // Derive key using PBKDF2
      const key = CryptoJS.PBKDF2(this.masterKey, salt, {
        keySize: 256/32,
        iterations: SECURITY_CONFIG.PBKDF2_ITERATIONS
      });

      // Encrypt data
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        data: encrypted.toString(),
        iv: iv.toString(),
        salt: salt.toString(),
        timestamp: Date.now(),
        classification
      };
    } catch (error) {
      console.error('Data encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  async decryptData(encryptedData: EncryptedData): Promise<any> {
    if (!this.masterKey) {
      throw new Error('Security system not initialized');
    }

    try {
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
      
      // Derive key using same parameters
      const key = CryptoJS.PBKDF2(this.masterKey, salt, {
        keySize: 256/32,
        iterations: SECURITY_CONFIG.PBKDF2_ITERATIONS
      });

      // Decrypt data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Data decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Create secure session
  async createSession(userId: string): Promise<SecuritySession> {
    if (this.isLockedOut()) {
      throw new Error('Account temporarily locked due to failed attempts');
    }

    try {
      const deviceFingerprint = Platform.OS === 'web' 
        ? localStorage.getItem('cypher_device_fp') || 'unknown'
        : await SecureStore.getItemAsync('cypher_device_fp') || 'unknown';

      const session: SecuritySession = {
        sessionId: await this.generateSecureKey(),
        userId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint,
        isActive: true,
        expiresAt: Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT
      };

      this.currentSession = session;
      this.failedAttempts = 0; // Reset on successful session creation
      
      // Store session securely
      await this.storeSession(session);
      
      return session;
    } catch (error) {
      this.failedAttempts++;
      if (this.failedAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
        this.lockoutUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
      }
      throw error;
    }
  }

  // Validate and refresh session
  async validateSession(): Promise<boolean> {
    if (!this.currentSession) {
      return false;
    }

    const now = Date.now();
    const sessionAge = now - this.currentSession.lastActivity;

    if (sessionAge > SECURITY_CONFIG.SESSION_TIMEOUT) {
      await this.invalidateSession();
      return false;
    }

    // Update last activity
    this.currentSession.lastActivity = now;
    await this.storeSession(this.currentSession);
    
    return true;
  }

  // Invalidate current session
  async invalidateSession(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      await this.storeSession(this.currentSession);
      this.currentSession = null;
    }
  }

  // Store session securely
  private async storeSession(session: SecuritySession): Promise<void> {
    const encryptedSession = await this.encryptData(session, DataClassification.RESTRICTED);
    
    if (Platform.OS === 'web') {
      sessionStorage.setItem('cypher_session', JSON.stringify(encryptedSession));
    } else {
      await SecureStore.setItemAsync('cypher_session', JSON.stringify(encryptedSession));
    }
  }

  // Check if account is locked out
  private isLockedOut(): boolean {
    return Date.now() < this.lockoutUntil;
  }

  // Clean up expired sessions
  private async cleanupExpiredSessions(): Promise<void> {
    try {
      const storedSession = Platform.OS === 'web'
        ? sessionStorage.getItem('cypher_session')
        : await SecureStore.getItemAsync('cypher_session');

      if (storedSession) {
        const encryptedSession = JSON.parse(storedSession);
        const session = await this.decryptData(encryptedSession);
        
        const now = Date.now();
        const sessionAge = now - session.lastActivity;
        
        if (sessionAge > SECURITY_CONFIG.SESSION_TIMEOUT) {
          if (Platform.OS === 'web') {
            sessionStorage.removeItem('cypher_session');
          } else {
            await SecureStore.deleteItemAsync('cypher_session');
          }
        } else {
          this.currentSession = session;
        }
      }
    } catch (error) {
      console.error('Session cleanup failed:', error);
    }
  }

  // Hash sensitive data for comparison
  async hashData(data: string): Promise<string> {
    return CryptoJS.SHA256(data).toString();
  }

  // Generate secure random token
  async generateToken(length: number = 32): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(length);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Anonymize user data
  anonymizeData(data: any): any {
    const anonymized = { ...data };
    
    // Remove or hash personally identifiable information
    if (anonymized.userId) {
      anonymized.userId = CryptoJS.SHA256(anonymized.userId).toString().substring(0, 8);
    }
    
    if (anonymized.deviceId) {
      anonymized.deviceId = CryptoJS.SHA256(anonymized.deviceId).toString().substring(0, 8);
    }
    
    // Remove timestamps that could be used for identification
    if (anonymized.createdAt) {
      anonymized.createdAt = Math.floor(anonymized.createdAt / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
    }
    
    return anonymized;
  }

  // Get current session info
  getCurrentSession(): SecuritySession | null {
    return this.currentSession;
  }

  // Security health check
  async performSecurityHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if master key exists
    if (!this.masterKey) {
      issues.push('Master encryption key not initialized');
      recommendations.push('Restart the application to initialize security');
    }

    // Check session validity
    if (this.currentSession && !(await this.validateSession())) {
      issues.push('Invalid or expired session detected');
      recommendations.push('Re-authenticate to create a new secure session');
    }

    // Check for lockout status
    if (this.isLockedOut()) {
      issues.push('Account is currently locked due to failed attempts');
      recommendations.push(`Wait ${Math.ceil((this.lockoutUntil - Date.now()) / 60000)} minutes before retrying`);
    }

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = issues.some(issue => 
        issue.includes('Master encryption key') || 
        issue.includes('locked')
      ) ? 'critical' : 'warning';
    }

    return { status, issues, recommendations };
  }
}

// Privacy compliance manager
class PrivacyManager {
  private settings: PrivacySettings;

  constructor() {
    this.settings = {
      level: PrivacyLevel.STANDARD,
      dataRetentionDays: 365,
      anonymizeAfterDays: 90,
      allowAnalytics: false,
      allowCrashReporting: true,
      shareUsageData: false,
      localProcessingOnly: true
    };
  }

  // Update privacy settings
  updateSettings(newSettings: Partial<PrivacySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Get current privacy settings
  getSettings(): PrivacySettings {
    return { ...this.settings };
  }

  // Check if data collection is allowed
  isDataCollectionAllowed(dataType: 'analytics' | 'crash' | 'usage'): boolean {
    switch (dataType) {
      case 'analytics':
        return this.settings.allowAnalytics;
      case 'crash':
        return this.settings.allowCrashReporting;
      case 'usage':
        return this.settings.shareUsageData;
      default:
        return false;
    }
  }

  // Check if data should be anonymized
  shouldAnonymizeData(dataAge: number): boolean {
    return dataAge > (this.settings.anonymizeAfterDays * 24 * 60 * 60 * 1000);
  }

  // Check if data should be deleted
  shouldDeleteData(dataAge: number): boolean {
    return dataAge > (this.settings.dataRetentionDays * 24 * 60 * 60 * 1000);
  }

  // Generate privacy report
  generatePrivacyReport(): {
    level: PrivacyLevel;
    dataRetentionPolicy: string;
    anonymizationPolicy: string;
    sharingPolicy: string;
    processingLocation: string;
  } {
    return {
      level: this.settings.level,
      dataRetentionPolicy: `Data retained for ${this.settings.dataRetentionDays} days`,
      anonymizationPolicy: `Data anonymized after ${this.settings.anonymizeAfterDays} days`,
      sharingPolicy: this.settings.shareUsageData ? 'Usage data shared for improvement' : 'No data sharing',
      processingLocation: this.settings.localProcessingOnly ? 'Local device only' : 'Cloud and local'
    };
  }
}

// Export singleton instances
export const securityManager = new SecurityManager();
export const privacyManager = new PrivacyManager();

// Export utility functions
export const SecurityUtils = {
  // Sanitize input data
  sanitizeInput: (input: string): string => {
    return input.replace(/[<>\\\"'%;()&+]/g, '');
  },

  // Validate data integrity
  validateDataIntegrity: async (data: any, expectedHash: string): Promise<boolean> => {
    const currentHash = CryptoJS.SHA256(JSON.stringify(data)).toString();
    return currentHash === expectedHash;
  },

  // Generate data integrity hash
  generateDataHash: (data: any): string => {
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
  },

  // Check for suspicious activity patterns
  detectSuspiciousActivity: (activities: any[]): boolean => {
    // Implement basic anomaly detection
    if (activities.length > 100) { // Too many activities in short time
      return true;
    }
    
    // Check for rapid successive actions
    const recentActivities = activities.filter(a => 
      Date.now() - a.timestamp < 60000 // Last minute
    );
    
    return recentActivities.length > 20;
  }
};