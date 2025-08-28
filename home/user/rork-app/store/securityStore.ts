import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { securityManager, privacyManager, PrivacyLevel, DataClassification } from '../lib/security';
import { trpcClient } from '../lib/trpc';

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

interface ConsentRecord {
  consentType: 'analytics' | 'marketing' | 'functional' | 'necessary';
  granted: boolean;
  timestamp: number;
  expiresAt: number;
  isValid: boolean;
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  dismissed: boolean;
  actionRequired: boolean;
}

interface SecurityState {
  // Session management
  currentSession: SecuritySession | null;
  isAuthenticated: boolean;
  sessionValid: boolean;
  
  // Privacy settings
  privacySettings: PrivacySettings;
  consentRecords: ConsentRecord[];
  
  // Security status
  securityHealth: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    lastCheck: number;
  };
  
  // Alerts and notifications
  securityAlerts: SecurityAlert[];
  
  // Encryption status
  encryptionEnabled: boolean;
  dataClassificationEnabled: boolean;
  
  // Actions
  initializeSecurity: () => Promise<void>;
  createSession: (userId: string) => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  invalidateSession: () => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  recordConsent: (consentType: ConsentRecord['consentType'], granted: boolean) => Promise<void>;
  checkSecurityHealth: () => Promise<void>;
  encryptSensitiveData: (data: any, classification?: DataClassification) => Promise<string>;
  decryptSensitiveData: (encryptedData: string) => Promise<any>;
  addSecurityAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => void;
  dismissAlert: (alertId: string) => void;
  requestDataDeletion: (dataTypes?: string[], reason?: string) => Promise<string>;
  generatePrivacyReport: () => Promise<any>;
  anonymizeOldData: () => Promise<void>;
}

const defaultPrivacySettings: PrivacySettings = {
  level: PrivacyLevel.STANDARD,
  dataRetentionDays: 365,
  anonymizeAfterDays: 90,
  allowAnalytics: false,
  allowCrashReporting: true,
  shareUsageData: false,
  localProcessingOnly: true
};

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      isAuthenticated: false,
      sessionValid: false,
      privacySettings: defaultPrivacySettings,
      consentRecords: [],
      securityHealth: {
        status: 'healthy',
        issues: [],
        recommendations: [],
        lastCheck: 0
      },
      securityAlerts: [],
      encryptionEnabled: false,
      dataClassificationEnabled: false,

      // Initialize security system
      initializeSecurity: async () => {
        try {
          await securityManager.initialize();
          
          set({
            encryptionEnabled: true,
            dataClassificationEnabled: true
          });
          
          // Check for existing session
          const session = securityManager.getCurrentSession();
          if (session) {
            const isValid = await securityManager.validateSession();
            set({
              currentSession: session,
              isAuthenticated: isValid,
              sessionValid: isValid
            });
          }
          
          // Perform initial health check
          await get().checkSecurityHealth();
          
          // Load privacy settings from backend
          try {
            const userId = session?.userId || 'anonymous';
            const settings = await trpcClient.security.privacy.getSettings.query({ userId });
            set({ privacySettings: settings });
          } catch (error) {
            console.warn('Could not load privacy settings from backend:', error);
          }
          
        } catch (error) {
          console.error('Security initialization failed:', error);
          get().addSecurityAlert({
            type: 'error',
            title: 'Security Initialization Failed',
            message: 'Could not initialize security system. Some features may not work properly.',
            dismissed: false,
            actionRequired: true
          });
        }
      },

      // Create new session
      createSession: async (userId: string) => {
        try {
          const session = await securityManager.createSession(userId);
          
          // Also create session on backend
          try {
            const deviceFingerprint = session.deviceFingerprint;
            const backendSession = await trpcClient.security.auth.createSession.mutate({
              userId,
              deviceFingerprint,
              clientTimestamp: Date.now()
            });
            
            set({
              currentSession: {
                ...session,
                expiresAt: backendSession.expiresAt
              },
              isAuthenticated: true,
              sessionValid: true
            });
            
            return true;
          } catch (backendError) {
            console.warn('Backend session creation failed, using local session:', backendError);
            set({
              currentSession: {
                ...session,
                expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
              },
              isAuthenticated: true,
              sessionValid: true
            });
            return true;
          }
          
        } catch (error) {
          console.error('Session creation failed:', error);
          get().addSecurityAlert({
            type: 'error',
            title: 'Authentication Failed',
            message: 'Could not create secure session. Please try again.',
            dismissed: false,
            actionRequired: true
          });
          return false;
        }
      },

      // Validate current session
      validateSession: async () => {
        try {
          const isValid = await securityManager.validateSession();
          const session = securityManager.getCurrentSession();
          
          if (isValid && session) {
            // Also validate with backend
            try {
              const backendValidation = await trpcClient.security.auth.validateSession.query({
                sessionId: session.sessionId,
                userId: session.userId,
                deviceFingerprint: session.deviceFingerprint
              });
              
              const finalValid = backendValidation.valid;
              set({
                sessionValid: finalValid,
                isAuthenticated: finalValid,
                currentSession: finalValid ? {
                  ...session,
                  expiresAt: backendValidation.expiresAt || Date.now() + (30 * 60 * 1000)
                } : null
              });
              
              return finalValid;
            } catch (backendError) {
              console.warn('Backend session validation failed, using local validation:', backendError);
              set({
                sessionValid: isValid,
                isAuthenticated: isValid
              });
              return isValid;
            }
          } else {
            set({
              sessionValid: false,
              isAuthenticated: false,
              currentSession: null
            });
            return false;
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          set({
            sessionValid: false,
            isAuthenticated: false,
            currentSession: null
          });
          return false;
        }
      },

      // Invalidate session
      invalidateSession: async () => {
        try {
          const session = get().currentSession;
          
          await securityManager.invalidateSession();
          
          // Also invalidate on backend
          if (session) {
            try {
              await trpcClient.security.auth.invalidateSession.mutate({
                sessionId: session.sessionId
              });
            } catch (backendError) {
              console.warn('Backend session invalidation failed:', backendError);
            }
          }
          
          set({
            currentSession: null,
            isAuthenticated: false,
            sessionValid: false
          });
          
        } catch (error) {
          console.error('Session invalidation failed:', error);
        }
      },

      // Update privacy settings
      updatePrivacySettings: async (newSettings: Partial<PrivacySettings>) => {
        try {
          const currentSettings = get().privacySettings;
          const updatedSettings = { ...currentSettings, ...newSettings };
          
          // Update local privacy manager
          privacyManager.updateSettings(updatedSettings);
          
          // Update backend
          const session = get().currentSession;
          if (session) {
            try {
              await trpcClient.security.privacy.updateSettings.mutate({
                userId: session.userId,
                settings: updatedSettings
              });
            } catch (backendError) {
              console.warn('Backend privacy settings update failed:', backendError);
            }
          }
          
          set({ privacySettings: updatedSettings });
          
          get().addSecurityAlert({
            type: 'info',
            title: 'Privacy Settings Updated',
            message: 'Your privacy preferences have been saved successfully.',
            dismissed: false,
            actionRequired: false
          });
          
        } catch (error) {
          console.error('Privacy settings update failed:', error);
          get().addSecurityAlert({
            type: 'error',
            title: 'Settings Update Failed',
            message: 'Could not update privacy settings. Please try again.',
            dismissed: false,
            actionRequired: false
          });
        }
      },

      // Record user consent
      recordConsent: async (consentType: ConsentRecord['consentType'], granted: boolean) => {
        try {
          const timestamp = Date.now();
          const expiresAt = timestamp + (365 * 24 * 60 * 60 * 1000); // 1 year
          
          const consentRecord: ConsentRecord = {
            consentType,
            granted,
            timestamp,
            expiresAt,
            isValid: true
          };
          
          // Update local state
          const currentConsents = get().consentRecords;
          const updatedConsents = [
            ...currentConsents.filter(c => c.consentType !== consentType),
            consentRecord
          ];
          
          set({ consentRecords: updatedConsents });
          
          // Record on backend
          const session = get().currentSession;
          if (session) {
            try {
              await trpcClient.security.privacy.recordConsent.mutate({
                userId: session.userId,
                consentType,
                granted,
                timestamp,
                version: '1.0'
              });
            } catch (backendError) {
              console.warn('Backend consent recording failed:', backendError);
            }
          }
          
        } catch (error) {
          console.error('Consent recording failed:', error);
        }
      },

      // Check security health
      checkSecurityHealth: async () => {
        try {
          const healthCheck = await securityManager.performSecurityHealthCheck();
          
          // Also check backend health
          try {
            const session = get().currentSession;
            const backendHealth = await trpcClient.security.auth.healthCheck.query({
              sessionId: session?.sessionId,
              clientVersion: '1.0.0'
            });
            
            // Combine local and backend health status
            const combinedIssues = [...healthCheck.issues, ...backendHealth.issues];
            const combinedRecommendations = [...healthCheck.recommendations, ...backendHealth.recommendations];
            
            const worstStatus = [healthCheck.status, backendHealth.status].includes('critical') 
              ? 'critical' 
              : [healthCheck.status, backendHealth.status].includes('warning')
              ? 'warning'
              : 'healthy';
            
            set({
              securityHealth: {
                status: worstStatus,
                issues: combinedIssues,
                recommendations: combinedRecommendations,
                lastCheck: Date.now()
              }
            });
            
            // Add alerts for critical issues
            if (worstStatus === 'critical') {
              get().addSecurityAlert({
                type: 'error',
                title: 'Critical Security Issues Detected',
                message: combinedIssues.join(', '),
                dismissed: false,
                actionRequired: true
              });
            }
            
          } catch (backendError) {
            console.warn('Backend health check failed, using local only:', backendError);
            set({
              securityHealth: {
                ...healthCheck,
                lastCheck: Date.now()
              }
            });
          }
          
        } catch (error) {
          console.error('Security health check failed:', error);
          set({
            securityHealth: {
              status: 'critical',
              issues: ['Health check system failure'],
              recommendations: ['Restart the application'],
              lastCheck: Date.now()
            }
          });
        }
      },

      // Encrypt sensitive data
      encryptSensitiveData: async (data: any, classification: DataClassification = DataClassification.CONFIDENTIAL) => {
        try {
          const encrypted = await securityManager.encryptData(data, classification);
          return JSON.stringify(encrypted);
        } catch (error) {
          console.error('Data encryption failed:', error);
          throw new Error('Failed to encrypt sensitive data');
        }
      },

      // Decrypt sensitive data
      decryptSensitiveData: async (encryptedData: string) => {
        try {
          const parsed = JSON.parse(encryptedData);
          return await securityManager.decryptData(parsed);
        } catch (error) {
          console.error('Data decryption failed:', error);
          throw new Error('Failed to decrypt sensitive data');
        }
      },

      // Add security alert
      addSecurityAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => {
        const newAlert: SecurityAlert = {
          ...alert,
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          timestamp: Date.now()
        };
        
        set(state => ({
          securityAlerts: [newAlert, ...state.securityAlerts]
        }));
      },

      // Dismiss alert
      dismissAlert: (alertId: string) => {
        set(state => ({
          securityAlerts: state.securityAlerts.map(alert =>
            alert.id === alertId ? { ...alert, dismissed: true } : alert
          )
        }));
      },

      // Request data deletion
      requestDataDeletion: async (dataTypes?: string[], reason?: string) => {
        try {
          const session = get().currentSession;
          if (!session) {
            throw new Error('No active session');
          }
          
          const response = await trpcClient.security.privacy.requestDataDeletion.mutate({
            userId: session.userId,
            dataTypes,
            reason
          });
          
          get().addSecurityAlert({
            type: 'info',
            title: 'Data Deletion Requested',
            message: `Your data deletion request has been submitted. Request ID: ${response.deletionId}`,
            dismissed: false,
            actionRequired: false
          });
          
          return response.deletionId;
          
        } catch (error) {
          console.error('Data deletion request failed:', error);
          get().addSecurityAlert({
            type: 'error',
            title: 'Deletion Request Failed',
            message: 'Could not submit data deletion request. Please try again.',
            dismissed: false,
            actionRequired: false
          });
          throw error;
        }
      },

      // Generate privacy report
      generatePrivacyReport: async () => {
        try {
          const session = get().currentSession;
          if (!session) {
            throw new Error('No active session');
          }
          
          const report = await trpcClient.security.privacy.generateReport.query({
            userId: session.userId
          });
          
          return report;
          
        } catch (error) {
          console.error('Privacy report generation failed:', error);
          throw error;
        }
      },

      // Anonymize old data
      anonymizeOldData: async () => {
        try {
          const session = get().currentSession;
          if (!session) {
            return;
          }
          
          const response = await trpcClient.security.privacy.anonymizeData.mutate({
            userId: session.userId
          });
          
          if (response.anonymizedRecords > 0) {
            get().addSecurityAlert({
              type: 'info',
              title: 'Data Anonymized',
              message: `${response.anonymizedRecords} old records have been anonymized for privacy.`,
              dismissed: false,
              actionRequired: false
            });
          }
          
        } catch (error) {
          console.error('Data anonymization failed:', error);
        }
      }
    }),
    {
      name: 'security-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        privacySettings: state.privacySettings,
        consentRecords: state.consentRecords,
        securityAlerts: state.securityAlerts.filter(alert => !alert.dismissed),
        encryptionEnabled: state.encryptionEnabled,
        dataClassificationEnabled: state.dataClassificationEnabled
      })
    }
  )
);