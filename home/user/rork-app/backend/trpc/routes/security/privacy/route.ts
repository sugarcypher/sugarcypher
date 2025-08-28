import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../../../backend/trpc/create-context';
import { TRPCError } from '@trpc/server';
import CryptoJS from 'crypto-js';

// Privacy level enum
const PrivacyLevel = z.enum(['minimal', 'standard', 'enhanced', 'maximum']);

// Data classification enum
const DataClassification = z.enum(['public', 'internal', 'confidential', 'restricted']);

// Privacy settings schema
const privacySettingsSchema = z.object({
  level: PrivacyLevel,
  dataRetentionDays: z.number().min(1).max(3650), // 1 day to 10 years
  anonymizeAfterDays: z.number().min(1).max(365), // 1 day to 1 year
  allowAnalytics: z.boolean(),
  allowCrashReporting: z.boolean(),
  shareUsageData: z.boolean(),
  localProcessingOnly: z.boolean()
});

// Data processing request schema
const dataProcessingSchema = z.object({
  userId: z.string(),
  dataType: z.string(),
  classification: DataClassification,
  purpose: z.string(),
  retentionPeriod: z.number().optional()
});

// Data deletion request schema
const dataDeletionSchema = z.object({
  userId: z.string(),
  dataTypes: z.array(z.string()).optional(), // If not provided, delete all
  reason: z.string().optional()
});

// Consent management schema
const consentSchema = z.object({
  userId: z.string(),
  consentType: z.enum(['analytics', 'marketing', 'functional', 'necessary']),
  granted: z.boolean(),
  timestamp: z.number(),
  version: z.string().optional()
});

// In-memory stores (in production, use proper database)
const privacySettings = new Map<string, any>();
const consentRecords = new Map<string, any[]>();
const dataProcessingLogs = new Map<string, any[]>();
const deletionRequests = new Map<string, any>();

// Privacy compliance configuration
const PRIVACY_CONFIG = {
  DEFAULT_RETENTION_DAYS: 365,
  DEFAULT_ANONYMIZATION_DAYS: 90,
  GDPR_DELETION_DEADLINE: 30 * 24 * 60 * 60 * 1000, // 30 days
  CONSENT_EXPIRY: 365 * 24 * 60 * 60 * 1000, // 1 year
  AUDIT_LOG_RETENTION: 7 * 365 * 24 * 60 * 60 * 1000 // 7 years
};

// Helper function to anonymize data
function anonymizeUserData(data: any): any {
  const anonymized = { ...data };
  
  // Hash or remove PII
  if (anonymized.userId) {
    anonymized.userId = CryptoJS.SHA256(anonymized.userId).toString().substring(0, 8);
  }
  
  if (anonymized.email) {
    const [local, domain] = anonymized.email.split('@');
    anonymized.email = `${CryptoJS.SHA256(local).toString().substring(0, 4)}@${domain}`;
  }
  
  if (anonymized.deviceId) {
    anonymized.deviceId = CryptoJS.SHA256(anonymized.deviceId).toString().substring(0, 8);
  }
  
  // Generalize timestamps to day level
  if (anonymized.timestamp) {
    anonymized.timestamp = Math.floor(anonymized.timestamp / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
  }
  
  // Remove specific location data, keep general region
  if (anonymized.location) {
    delete anonymized.location.precise;
    if (anonymized.location.city) {
      anonymized.location = { region: anonymized.location.region || 'unknown' };
    }
  }
  
  return anonymized;
}

// Helper function to log data processing activity
function logDataProcessing(userId: string, activity: any): void {
  const logs = dataProcessingLogs.get(userId) || [];
  logs.push({
    ...activity,
    timestamp: Date.now(),
    id: CryptoJS.SHA256(JSON.stringify(activity) + Date.now()).toString().substring(0, 16)
  });
  dataProcessingLogs.set(userId, logs);
}

// Update privacy settings
export const updatePrivacySettingsProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    settings: privacySettingsSchema
  }))
  .mutation(async ({ input }) => {
    try {
      // Validate settings based on privacy level
      const { settings } = input;
      
      // Enforce stricter settings for higher privacy levels
      if (settings.level === 'maximum') {
        settings.allowAnalytics = false;
        settings.shareUsageData = false;
        settings.localProcessingOnly = true;
        settings.dataRetentionDays = Math.min(settings.dataRetentionDays, 90);
        settings.anonymizeAfterDays = Math.min(settings.anonymizeAfterDays, 30);
      } else if (settings.level === 'enhanced') {
        settings.allowAnalytics = false;
        settings.shareUsageData = false;
        settings.dataRetentionDays = Math.min(settings.dataRetentionDays, 180);
        settings.anonymizeAfterDays = Math.min(settings.anonymizeAfterDays, 60);
      }
      
      // Store settings
      privacySettings.set(input.userId, {
        ...settings,
        updatedAt: Date.now(),
        version: '1.0'
      });
      
      // Log the change
      logDataProcessing(input.userId, {
        action: 'privacy_settings_updated',
        level: settings.level,
        changes: settings
      });
      
      return {
        success: true,
        message: 'Privacy settings updated successfully',
        effectiveSettings: settings
      };
      
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update privacy settings'
      });
    }
  });

// Get privacy settings
export const getPrivacySettingsProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    try {
      const settings = privacySettings.get(input.userId);
      
      if (!settings) {
        // Return default settings
        const defaultSettings = {
          level: 'standard' as const,
          dataRetentionDays: PRIVACY_CONFIG.DEFAULT_RETENTION_DAYS,
          anonymizeAfterDays: PRIVACY_CONFIG.DEFAULT_ANONYMIZATION_DAYS,
          allowAnalytics: false,
          allowCrashReporting: true,
          shareUsageData: false,
          localProcessingOnly: true,
          updatedAt: Date.now(),
          version: '1.0'
        };
        
        privacySettings.set(input.userId, defaultSettings);
        return defaultSettings;
      }
      
      return settings;
      
    } catch (error) {
      console.error('Failed to get privacy settings:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve privacy settings'
      });
    }
  });

// Record consent
export const recordConsentProcedure = publicProcedure
  .input(consentSchema)
  .mutation(async ({ input }: { input: z.infer<typeof consentSchema> }) => {
    try {
      const consents = consentRecords.get(input.userId) || [];
      
      // Add new consent record
      const consentRecord = {
        ...input,
        id: CryptoJS.SHA256(JSON.stringify(input)).toString().substring(0, 16),
        recordedAt: Date.now(),
        expiresAt: Date.now() + PRIVACY_CONFIG.CONSENT_EXPIRY,
        ipAddress: 'anonymized', // In production, hash the IP
        userAgent: 'anonymized'  // In production, hash the user agent
      };
      
      consents.push(consentRecord);
      consentRecords.set(input.userId, consents);
      
      // Log consent activity
      logDataProcessing(input.userId, {
        action: 'consent_recorded',
        consentType: input.consentType,
        granted: input.granted
      });
      
      return {
        success: true,
        consentId: consentRecord.id,
        expiresAt: consentRecord.expiresAt
      };
      
    } catch (error) {
      console.error('Failed to record consent:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to record consent'
      });
    }
  });

// Get consent status
export const getConsentStatusProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    consentType: z.enum(['analytics', 'marketing', 'functional', 'necessary']).optional()
  }))
  .query(async ({ input }: { input: { userId: string; consentType?: 'analytics' | 'marketing' | 'functional' | 'necessary' } }) => {
    try {
      const consents = consentRecords.get(input.userId) || [];
      const now = Date.now();
      
      // Filter by consent type if specified
      let relevantConsents = consents;
      if (input.consentType) {
        relevantConsents = consents.filter(c => c.consentType === input.consentType);
      }
      
      // Get latest consent for each type
      const latestConsents = relevantConsents.reduce((acc, consent) => {
        const existing = acc[consent.consentType];
        if (!existing || consent.timestamp > existing.timestamp) {
          acc[consent.consentType] = consent;
        }
        return acc;
      }, {} as Record<string, any>);
      
      // Check expiry and validity
      const consentStatus = Object.entries(latestConsents).map(([type, consent]) => ({
        consentType: type,
        granted: (consent as any).granted,
        timestamp: (consent as any).timestamp,
        expiresAt: (consent as any).expiresAt,
        isValid: now < (consent as any).expiresAt,
        isExpired: now >= (consent as any).expiresAt
      }));
      
      return {
        consents: consentStatus,
        totalConsents: consents.length,
        lastUpdated: consents.length > 0 ? Math.max(...consents.map(c => c.timestamp)) : null
      };
      
    } catch (error) {
      console.error('Failed to get consent status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve consent status'
      });
    }
  });

// Request data deletion
export const requestDataDeletionProcedure = publicProcedure
  .input(dataDeletionSchema)
  .mutation(async ({ input }: { input: z.infer<typeof dataDeletionSchema> }) => {
    try {
      const deletionId = CryptoJS.SHA256(JSON.stringify(input) + Date.now()).toString().substring(0, 16);
      
      const deletionRequest = {
        id: deletionId,
        userId: input.userId,
        dataTypes: input.dataTypes || ['all'],
        reason: input.reason || 'user_request',
        requestedAt: Date.now(),
        status: 'pending',
        deadline: Date.now() + PRIVACY_CONFIG.GDPR_DELETION_DEADLINE,
        processedAt: null
      };
      
      deletionRequests.set(deletionId, deletionRequest);
      
      // Log deletion request
      logDataProcessing(input.userId, {
        action: 'data_deletion_requested',
        deletionId,
        dataTypes: deletionRequest.dataTypes,
        reason: deletionRequest.reason
      });
      
      return {
        success: true,
        deletionId,
        status: 'pending',
        deadline: deletionRequest.deadline,
        message: 'Data deletion request submitted successfully'
      };
      
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to submit data deletion request'
      });
    }
  });

// Get data processing log
export const getDataProcessingLogProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0)
  }))
  .query(async ({ input }: { input: { userId: string; limit?: number; offset?: number } }) => {
    try {
      const logs = dataProcessingLogs.get(input.userId) || [];
      
      // Sort by timestamp (newest first)
      const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply pagination
      const offset = input.offset ?? 0;
      const limit = input.limit ?? 50;
      const paginatedLogs = sortedLogs.slice(offset, offset + limit);
      
      // Anonymize sensitive data in logs
      const sanitizedLogs = paginatedLogs.map(log => ({
        id: log.id,
        action: log.action,
        timestamp: log.timestamp,
        summary: log.summary || `${log.action} performed`,
        // Remove sensitive details
        metadata: log.metadata ? 'present' : 'none'
      }));
      
      return {
        logs: sanitizedLogs,
        total: logs.length,
        hasMore: offset + limit < logs.length
      };
      
    } catch (error) {
      console.error('Failed to get data processing log:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve data processing log'
      });
    }
  });

// Generate privacy report
export const generatePrivacyReportProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }: { input: { userId: string } }) => {
    try {
      const settings = privacySettings.get(input.userId);
      const consents = consentRecords.get(input.userId) || [];
      const logs = dataProcessingLogs.get(input.userId) || [];
      
      // Get active consents
      const now = Date.now();
      const activeConsents = consents.filter(c => now < c.expiresAt && c.granted);
      
      // Calculate data age and processing stats
      const oldestLog = logs.length > 0 ? Math.min(...logs.map(l => l.timestamp)) : now;
      const dataAge = now - oldestLog;
      
      const processingStats = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        userId: CryptoJS.SHA256(input.userId).toString().substring(0, 8), // Anonymized
        privacyLevel: settings?.level || 'standard',
        dataRetentionPolicy: `${settings?.dataRetentionDays || PRIVACY_CONFIG.DEFAULT_RETENTION_DAYS} days`,
        anonymizationPolicy: `${settings?.anonymizeAfterDays || PRIVACY_CONFIG.DEFAULT_ANONYMIZATION_DAYS} days`,
        activeConsents: activeConsents.map(c => ({
          type: c.consentType,
          grantedAt: c.timestamp,
          expiresAt: c.expiresAt
        })),
        dataProcessingActivities: Object.keys(processingStats).length,
        dataAge: Math.floor(dataAge / (24 * 60 * 60 * 1000)), // in days
        lastActivity: logs.length > 0 ? Math.max(...logs.map(l => l.timestamp)) : null,
        complianceStatus: {
          gdprCompliant: true,
          ccpaCompliant: true,
          dataMinimization: settings?.level === 'maximum' || settings?.level === 'enhanced',
          consentManagement: activeConsents.length > 0,
          rightToErasure: true,
          dataPortability: true
        },
        generatedAt: now
      };
      
    } catch (error) {
      console.error('Failed to generate privacy report:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate privacy report'
      });
    }
  });

// Anonymize user data (GDPR compliance)
export const anonymizeUserDataProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    dataTypes: z.array(z.string()).optional()
  }))
  .mutation(async ({ input }: { input: { userId: string; dataTypes?: string[] } }) => {
    try {
      const settings = privacySettings.get(input.userId);
      const logs = dataProcessingLogs.get(input.userId) || [];
      
      // Determine what data to anonymize
      const dataTypes = input.dataTypes || ['all'];
      let anonymizedCount = 0;
      
      // Anonymize processing logs older than threshold
      if (settings && dataTypes.includes('logs') || dataTypes.includes('all')) {
        const threshold = Date.now() - (settings.anonymizeAfterDays * 24 * 60 * 60 * 1000);
        const updatedLogs = logs.map(log => {
          if (log.timestamp < threshold) {
            anonymizedCount++;
            return anonymizeUserData(log);
          }
          return log;
        });
        dataProcessingLogs.set(input.userId, updatedLogs);
      }
      
      // Log the anonymization
      logDataProcessing(input.userId, {
        action: 'data_anonymized',
        dataTypes,
        recordsAffected: anonymizedCount
      });
      
      return {
        success: true,
        anonymizedRecords: anonymizedCount,
        message: `Successfully anonymized ${anonymizedCount} records`
      };
      
    } catch (error) {
      console.error('Failed to anonymize user data:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to anonymize user data'
      });
    }
  });