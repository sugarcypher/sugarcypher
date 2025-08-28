import { Platform } from 'react-native';
import { securityManager, privacyManager, SecurityUtils } from '@/lib/security';
import { useSecurityStore } from '@/store/securityStore';

// Security utility functions for the app
export const AppSecurityUtils = {
  // Initialize security for the app
  initializeAppSecurity: async (): Promise<boolean> => {
    try {
      const { initializeSecurity } = useSecurityStore.getState();
      await initializeSecurity();
      return true;
    } catch (error) {
      console.error('App security initialization failed:', error);
      return false;
    }
  },

  // Secure data storage wrapper
  secureStore: {
    async setItem(key: string, value: any, classification?: any): Promise<void> {
      try {
        const { encryptSensitiveData } = useSecurityStore.getState();
        const encrypted = await encryptSensitiveData(value, classification);
        
        if (Platform.OS === 'web') {
          localStorage.setItem(key, encrypted);
        } else {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem(key, encrypted);
        }
      } catch (error) {
        console.error('Secure storage failed:', error);
        throw error;
      }
    },

    async getItem(key: string): Promise<any> {
      try {
        let encrypted: string | null;
        
        if (Platform.OS === 'web') {
          encrypted = localStorage.getItem(key);
        } else {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          encrypted = await AsyncStorage.getItem(key);
        }

        if (!encrypted) return null;

        const { decryptSensitiveData } = useSecurityStore.getState();
        return await decryptSensitiveData(encrypted);
      } catch (error) {
        console.error('Secure retrieval failed:', error);
        return null;
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem(key);
        } else {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Secure removal failed:', error);
      }
    }
  },

  // Session management utilities
  session: {
    async create(userId: string): Promise<boolean> {
      try {
        const { createSession } = useSecurityStore.getState();
        return await createSession(userId);
      } catch (error) {
        console.error('Session creation failed:', error);
        return false;
      }
    },

    async validate(): Promise<boolean> {
      try {
        const { validateSession } = useSecurityStore.getState();
        return await validateSession();
      } catch (error) {
        console.error('Session validation failed:', error);
        return false;
      }
    },

    async invalidate(): Promise<void> {
      try {
        const { invalidateSession } = useSecurityStore.getState();
        await invalidateSession();
      } catch (error) {
        console.error('Session invalidation failed:', error);
      }
    }
  },

  // Privacy compliance utilities
  privacy: {
    async updateSettings(settings: any): Promise<void> {
      try {
        const { updatePrivacySettings } = useSecurityStore.getState();
        await updatePrivacySettings(settings);
      } catch (error) {
        console.error('Privacy settings update failed:', error);
        throw error;
      }
    },

    async recordConsent(type: string, granted: boolean): Promise<void> {
      try {
        const { recordConsent } = useSecurityStore.getState();
        await recordConsent(type as any, granted);
      } catch (error) {
        console.error('Consent recording failed:', error);
        throw error;
      }
    },

    async generateReport(): Promise<any> {
      try {
        const { generatePrivacyReport } = useSecurityStore.getState();
        return await generatePrivacyReport();
      } catch (error) {
        console.error('Privacy report generation failed:', error);
        throw error;
      }
    },

    shouldAnonymizeData(dataAge: number): boolean {
      return privacyManager.shouldAnonymizeData(dataAge);
    },

    shouldDeleteData(dataAge: number): boolean {
      return privacyManager.shouldDeleteData(dataAge);
    }
  },

  // Security monitoring utilities
  monitoring: {
    async performHealthCheck(): Promise<any> {
      try {
        const { checkSecurityHealth } = useSecurityStore.getState();
        await checkSecurityHealth();
        return useSecurityStore.getState().securityHealth;
      } catch (error) {
        console.error('Security health check failed:', error);
        return {
          status: 'critical',
          issues: ['Health check failed'],
          recommendations: ['Restart the application']
        };
      }
    },

    addAlert(alert: any): void {
      try {
        const { addSecurityAlert } = useSecurityStore.getState();
        addSecurityAlert(alert);
      } catch (error) {
        console.error('Alert addition failed:', error);
      }
    },

    dismissAlert(alertId: string): void {
      try {
        const { dismissAlert } = useSecurityStore.getState();
        dismissAlert(alertId);
      } catch (error) {
        console.error('Alert dismissal failed:', error);
      }
    }
  },

  // Data protection utilities
  dataProtection: {
    sanitizeInput: SecurityUtils.sanitizeInput,
    generateDataHash: SecurityUtils.generateDataHash,
    validateDataIntegrity: SecurityUtils.validateDataIntegrity,
    detectSuspiciousActivity: SecurityUtils.detectSuspiciousActivity,

    async anonymizeUserData(data: any): Promise<any> {
      try {
        return securityManager.anonymizeData(data);
      } catch (error) {
        console.error('Data anonymization failed:', error);
        return data; // Return original data if anonymization fails
      }
    },

    async requestDataDeletion(dataTypes?: string[], reason?: string): Promise<string | null> {
      try {
        const { requestDataDeletion } = useSecurityStore.getState();
        return await requestDataDeletion(dataTypes, reason);
      } catch (error) {
        console.error('Data deletion request failed:', error);
        return null;
      }
    }
  },

  // Compliance utilities
  compliance: {
    isGDPRCompliant(): boolean {
      const { privacySettings } = useSecurityStore.getState();
      return privacySettings.localProcessingOnly && 
             privacySettings.dataRetentionDays <= 365 &&
             privacySettings.anonymizeAfterDays <= 90;
    },

    isCCPACompliant(): boolean {
      const { privacySettings } = useSecurityStore.getState();
      return !privacySettings.shareUsageData && 
             privacySettings.allowAnalytics === false;
    },

    getComplianceStatus(): {
      gdprCompliant: boolean;
      ccpaCompliant: boolean;
      dataMinimization: boolean;
    } {
      return {
        gdprCompliant: this.isGDPRCompliant(),
        ccpaCompliant: this.isCCPACompliant(),
        dataMinimization: useSecurityStore.getState().privacySettings.localProcessingOnly
      };
    }
  }
};

// Export individual utilities for convenience
export const { secureStore, session, privacy, monitoring, dataProtection, compliance } = AppSecurityUtils;

// Default export
export default AppSecurityUtils;