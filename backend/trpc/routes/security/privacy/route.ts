import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { TRPCError } from '@trpc/server';

// Privacy level enum
const PrivacyLevel = z.enum(['minimal', 'standard', 'enhanced', 'maximum', 'community_restricted']);

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
  localProcessingOnly: z.boolean(),
  allowCommunitySharing: z.boolean().default(false), // Control community data sharing
  communityDataAnonymization: z.boolean().default(true) // Anonymize community data by default
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
  consentType: z.enum(['analytics', 'marketing', 'functional', 'necessary', 'community_sharing']),
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
    anonymized.userId = Buffer.from(anonymized.userId).toString('base64').substring(0, 8);
  }
  
  if (anonymized.email) {
    const [local, domain] = anonymized.email.split('@');
    anonymized.email = `${Buffer.from(local).toString('base64').substring(0, 4)}@${domain}`;
  }
  
  if (anonymized.deviceId) {
    anonymized.deviceId = Buffer.from(anonymized.deviceId).toString('base64').substring(0, 8);
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
    id: Math.random().toString(36).substring(2)
  });
  dataProcessingLogs.set(userId, logs);
}

// Update privacy settings
export const updatePrivacySettingsProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    settings: privacySettingsSchema
  }))
  .mutation(async ({ input }: { input: { userId: string, settings: z.infer<typeof privacySettingsSchema> } }) => {
    try {
      const currentSettings = privacySettings.get(input.userId) || {};
      const updatedSettings = {
        ...currentSettings,
        ...input.settings,
        updatedAt: Date.now()
      };
      
      privacySettings.set(input.userId, updatedSettings);
      
      // Log the privacy settings change
      logDataProcessing(input.userId, {
        action: 'privacy_settings_updated',
        previousLevel: currentSettings.level,
        newLevel: input.settings.level,
        changes: Object.keys(input.settings)
      });
      
      return {
        success: true,
        settings: updatedSettings
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
  .query(async ({ input }: { input: { userId: string } }) => {
    try {
      const settings = privacySettings.get(input.userId) || {
        level: 'standard',
        dataRetentionDays: PRIVACY_CONFIG.DEFAULT_RETENTION_DAYS,
        anonymizeAfterDays: PRIVACY_CONFIG.DEFAULT_ANONYMIZATION_DAYS,
        allowAnalytics: false,
        allowCrashReporting: true,
        shareUsageData: false,
        localProcessingOnly: false,
        allowCommunitySharing: false,
        communityDataAnonymization: true,
        createdAt: Date.now()
      };
      
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
      
      // Remove any existing consent for this type
      const filteredConsents = consents.filter(c => c.consentType !== input.consentType);
      
      // Add new consent record
      const consentRecord = {
        ...input,
        id: Math.random().toString(36).substring(2),
        recordedAt: Date.now(),
        expiresAt: Date.now() + PRIVACY_CONFIG.CONSENT_EXPIRY
      };
      
      filteredConsents.push(consentRecord);
      consentRecords.set(input.userId, filteredConsents);
      
      // Log consent activity
      logDataProcessing(input.userId, {
        action: 'consent_recorded',
        consentType: input.consentType,
        granted: input.granted,
        version: input.version
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
  .query(async ({ input }: { input: { userId: string, consentType?: 'analytics' | 'marketing' | 'functional' | 'necessary' } }) => {
    try {
      const consents = consentRecords.get(input.userId) || [];
      const now = Date.now();
      
      // Filter active consents (not expired)
      const activeConsents = consents.filter(c => c.expiresAt > now);
      
      if (input.consentType) {
        const consent = activeConsents.find(c => c.consentType === input.consentType);
        return {
          consentType: input.consentType,
          granted: consent?.granted || false,
          recordedAt: consent?.recordedAt,
          expiresAt: consent?.expiresAt
        };
      }
      
      // Return all active consents
      const consentStatus = {
        analytics: false,
        marketing: false,
        functional: false,
        necessary: true, // Always true for necessary cookies
        community_sharing: false
      };
      
      activeConsents.forEach(consent => {
        consentStatus[consent.consentType as keyof typeof consentStatus] = consent.granted;
      });
      
      return {
        consents: consentStatus,
        lastUpdated: Math.max(...activeConsents.map(c => c.recordedAt), 0)
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
      const requestId = Math.random().toString(36).substring(2);
      const deletionRequest = {
        id: requestId,
        userId: input.userId,
        dataTypes: input.dataTypes || ['all'],
        reason: input.reason || 'User requested deletion',
        requestedAt: Date.now(),
        status: 'pending',
        completionDeadline: Date.now() + PRIVACY_CONFIG.GDPR_DELETION_DEADLINE
      };
      
      deletionRequests.set(requestId, deletionRequest);
      
      // Log deletion request
      logDataProcessing(input.userId, {
        action: 'data_deletion_requested',
        requestId,
        dataTypes: deletionRequest.dataTypes,
        reason: input.reason
      });
      
      return {
        success: true,
        requestId,
        completionDeadline: deletionRequest.completionDeadline,
        estimatedCompletionDays: 30
      };
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process data deletion request'
      });
    }
  });

// Get data processing log
export const getDataProcessingLogProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    startDate: z.number().optional(),
    endDate: z.number().optional(),
    limit: z.number().min(1).max(1000).default(100)
  }))
  .query(async ({ input }: { input: { userId: string, startDate?: number, endDate?: number, limit: number } }) => {
    try {
      let logs = dataProcessingLogs.get(input.userId) || [];
      
      // Apply date filters
      if (input.startDate) {
        logs = logs.filter(log => log.timestamp >= input.startDate!);
      }
      
      if (input.endDate) {
        logs = logs.filter(log => log.timestamp <= input.endDate!);
      }
      
      // Sort by timestamp (newest first) and limit
      logs = logs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, input.limit);
      
      return {
        logs,
        totalCount: logs.length,
        userId: input.userId
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
  .input(z.object({
    userId: z.string(),
    reportType: z.enum(['gdpr_export', 'privacy_summary', 'consent_history']),
    includeAnonymized: z.boolean().default(false)
  }))
  .mutation(async ({ input }: { input: { userId: string, reportType: 'gdpr_export' | 'privacy_summary' | 'consent_history', includeAnonymized: boolean } }) => {
    try {
      const reportId = Math.random().toString(36).substring(2);
      const now = Date.now();
      
      // Gather user data
      const settings = privacySettings.get(input.userId);
      const consents = consentRecords.get(input.userId) || [];
      const logs = dataProcessingLogs.get(input.userId) || [];
      
      let report: any = {
        id: reportId,
        userId: input.userId,
        reportType: input.reportType,
        generatedAt: now,
        dataIncluded: []
      };
      
      switch (input.reportType) {
        case 'gdpr_export':
          report.data = {
            privacySettings: settings,
            consentRecords: consents,
            dataProcessingLog: input.includeAnonymized ? logs : logs.filter(log => !log.anonymized),
            accountInfo: {
              userId: input.userId,
              dataRetentionPolicy: settings?.dataRetentionDays || PRIVACY_CONFIG.DEFAULT_RETENTION_DAYS,
              lastActivity: Math.max(...logs.map(l => l.timestamp), 0)
            }
          };
          report.dataIncluded = ['privacy_settings', 'consent_records', 'processing_log', 'account_info'];
          break;
          
        case 'privacy_summary':
          const activeConsents = consents.filter(c => c.expiresAt > now);
          report.data = {
            privacyLevel: settings?.level || 'standard',
            activeConsents: activeConsents.length,
            dataRetentionDays: settings?.dataRetentionDays || PRIVACY_CONFIG.DEFAULT_RETENTION_DAYS,
            localProcessingOnly: settings?.localProcessingOnly || false,
            lastConsentUpdate: Math.max(...activeConsents.map(c => c.recordedAt), 0),
            dataProcessingActivities: logs.length
          };
          report.dataIncluded = ['privacy_summary'];
          break;
          
        case 'consent_history':
          report.data = {
            consentHistory: consents.map(c => ({
              consentType: c.consentType,
              granted: c.granted,
              recordedAt: c.recordedAt,
              expiresAt: c.expiresAt,
              version: c.version
            }))
          };
          report.dataIncluded = ['consent_history'];
          break;
      }
      
      // Log report generation
      logDataProcessing(input.userId, {
        action: 'privacy_report_generated',
        reportType: input.reportType,
        reportId,
        includeAnonymized: input.includeAnonymized
      });
      
      return {
        success: true,
        reportId,
        downloadUrl: `/api/privacy/reports/${reportId}`,
        expiresAt: now + (7 * 24 * 60 * 60 * 1000) // 7 days
      };
    } catch (error) {
      console.error('Failed to generate privacy report:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate privacy report'
      });
    }
  });

// Anonymize user data
export const anonymizeUserDataProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    dataTypes: z.array(z.string()).optional()
  }))
  .mutation(async ({ input }: { input: { userId: string, dataTypes?: string[] } }) => {
    try {
      const logs = dataProcessingLogs.get(input.userId) || [];
      const settings = privacySettings.get(input.userId);
      
      // Determine what data to anonymize
      const dataTypes = input.dataTypes || ['all'];
      let anonymizedCount = 0;
      
      // Anonymize processing logs
      if (dataTypes.includes('all') || dataTypes.includes('logs')) {
        const anonymizedLogs = logs.map(log => {
          if (!log.anonymized) {
            anonymizedCount++;
            return {
              ...anonymizeUserData(log),
              anonymized: true,
              anonymizedAt: Date.now()
            };
          }
          return log;
        });
        dataProcessingLogs.set(input.userId, anonymizedLogs);
      }
      
      // Anonymize settings (keep functional data)
      if (dataTypes.includes('all') || dataTypes.includes('settings')) {
        if (settings && !settings.anonymized) {
          const anonymizedSettings = {
            ...settings,
            userId: anonymizeUserData({ userId: input.userId }).userId,
            anonymized: true,
            anonymizedAt: Date.now()
          };
          privacySettings.set(input.userId, anonymizedSettings);
          anonymizedCount++;
        }
      }
      
      // Log anonymization
      logDataProcessing(input.userId, {
        action: 'data_anonymized',
        dataTypes,
        recordsAnonymized: anonymizedCount,
        anonymizedAt: Date.now()
      });
      
      return {
        success: true,
        anonymizedRecords: anonymizedCount,
        dataTypes: dataTypes,
        completedAt: Date.now()
      };
    } catch (error) {
      console.error('Failed to anonymize user data:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to anonymize user data'
      });
    }
  });