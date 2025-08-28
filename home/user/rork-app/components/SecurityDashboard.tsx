import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  ActivityIndicator
} from 'react-native';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Download,
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react-native';
import { useSecurityStore } from '../store/securityStore';
import { PrivacyLevel } from '../lib/security';

interface SecurityDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ visible, onClose }) => {
  const {
    securityHealth,
    privacySettings,
    consentRecords,
    securityAlerts,
    isAuthenticated,
    sessionValid,
    encryptionEnabled,
    checkSecurityHealth,
    updatePrivacySettings,
    recordConsent,
    dismissAlert,
    requestDataDeletion,
    generatePrivacyReport,
    anonymizeOldData
  } = useSecurityStore();

  const [loading, setLoading] = useState(false);
  const [showPrivacyReport, setShowPrivacyReport] = useState(false);
  const [privacyReport, setPrivacyReport] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      checkSecurityHealth();
    }
  }, [visible, checkSecurityHealth]);

  const handlePrivacyLevelChange = async (level: PrivacyLevel) => {
    setLoading(true);
    try {
      await updatePrivacySettings({ level });
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy level');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentToggle = async (consentType: 'analytics' | 'marketing' | 'functional' | 'necessary', granted: boolean) => {
    try {
      await recordConsent(consentType, granted);
    } catch (error) {
      Alert.alert('Error', 'Failed to update consent');
    }
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await requestDataDeletion(['all'], 'user_request');
              Alert.alert('Success', 'Data deletion request submitted');
            } catch (error) {
              Alert.alert('Error', 'Failed to submit deletion request');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const report = await generatePrivacyReport();
      setPrivacyReport(report);
      setShowPrivacyReport(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate privacy report');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymizeData = async () => {
    try {
      setLoading(true);
      await anonymizeOldData();
      Alert.alert('Success', 'Old data has been anonymized');
    } catch (error) {
      Alert.alert('Error', 'Failed to anonymize data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Info;
    }
  };

  const getConsentStatus = (consentType: string) => {
    const consent = consentRecords.find((c: any) => c.consentType === consentType);
    return consent?.granted || false;
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'error': return styles.alertError;
      case 'warning': return styles.alertWarning;
      case 'info': return styles.alertInfo;
      default: return styles.alertInfo;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Security & Privacy</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Security Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Status</Text>
            <View style={[styles.statusCard, { borderLeftColor: getStatusColor(securityHealth.status) }]}>
              <View style={styles.statusHeader}>
                {React.createElement(getStatusIcon(securityHealth.status), {
                  size: 24,
                  color: getStatusColor(securityHealth.status)
                })}
                <Text style={[styles.statusText, { color: getStatusColor(securityHealth.status) }]}>
                  {securityHealth.status.toUpperCase()}
                </Text>
                <TouchableOpacity onPress={checkSecurityHealth} style={styles.refreshButton}>
                  <RefreshCw size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.statusDetails}>
                <View style={styles.statusItem}>
                  <Shield size={16} color={isAuthenticated ? '#10B981' : '#EF4444'} />
                  <Text style={styles.statusItemText}>
                    Authentication: {isAuthenticated ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <Lock size={16} color={encryptionEnabled ? '#10B981' : '#EF4444'} />
                  <Text style={styles.statusItemText}>
                    Encryption: {encryptionEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <Eye size={16} color={sessionValid ? '#10B981' : '#EF4444'} />
                  <Text style={styles.statusItemText}>
                    Session: {sessionValid ? 'Valid' : 'Invalid'}
                  </Text>
                </View>
              </View>

              {securityHealth.issues.length > 0 && (
                <View style={styles.issuesContainer}>
                  <Text style={styles.issuesTitle}>Issues:</Text>
                  {securityHealth.issues.map((issue: string, index: number) => (
                    <Text key={index} style={styles.issueText}>• {issue}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Level</Text>
            <View style={styles.privacyLevels}>
              {(['minimal', 'standard', 'enhanced', 'maximum'] as PrivacyLevel[]).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.privacyLevel,
                    privacySettings.level === level && styles.privacyLevelActive
                  ]}
                  onPress={() => handlePrivacyLevelChange(level)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.privacyLevelText,
                    privacySettings.level === level && styles.privacyLevelTextActive
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.privacyDetails}>
              <Text style={styles.privacyDetailText}>
                Data Retention: {privacySettings.dataRetentionDays} days
              </Text>
              <Text style={styles.privacyDetailText}>
                Anonymization: After {privacySettings.anonymizeAfterDays} days
              </Text>
              <Text style={styles.privacyDetailText}>
                Processing: {privacySettings.localProcessingOnly ? 'Local only' : 'Cloud & Local'}
              </Text>
            </View>
          </View>

          {/* Consent Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Usage Consent</Text>
            <View style={styles.consentList}>
              <View style={styles.consentItem}>
                <View style={styles.consentInfo}>
                  <Text style={styles.consentTitle}>Analytics</Text>
                  <Text style={styles.consentDescription}>Help improve the app</Text>
                </View>
                <Switch
                  value={getConsentStatus('analytics')}
                  onValueChange={(value) => handleConsentToggle('analytics', value)}
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <View style={styles.consentItem}>
                <View style={styles.consentInfo}>
                  <Text style={styles.consentTitle}>Crash Reporting</Text>
                  <Text style={styles.consentDescription}>Help fix bugs and crashes</Text>
                </View>
                <Switch
                  value={getConsentStatus('functional')}
                  onValueChange={(value) => handleConsentToggle('functional', value)}
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* Security Alerts */}
          {securityAlerts.filter((alert: any) => !alert.dismissed).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Alerts</Text>
              {securityAlerts
                .filter((alert: any) => !alert.dismissed)
                .slice(0, 3)
                .map((alert: any) => (
                  <View key={alert.id} style={[styles.alertCard, getAlertStyle(alert.type)]}>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => dismissAlert(alert.id)}
                      style={styles.dismissButton}
                    >
                      <Text style={styles.dismissText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          )}

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGenerateReport}
                disabled={loading}
              >
                <Download size={20} color="#6B7280" />
                <Text style={styles.actionButtonText}>Privacy Report</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAnonymizeData}
                disabled={loading}
              >
                <EyeOff size={20} color="#6B7280" />
                <Text style={styles.actionButtonText}>Anonymize Old Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleDataDeletion}
                disabled={loading}
              >
                <Trash2 size={20} color="#EF4444" />
                <Text style={[styles.actionButtonText, styles.dangerText]}>Delete All Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        )}

        {/* Privacy Report Modal */}
        <Modal visible={showPrivacyReport} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Privacy Report</Text>
              <TouchableOpacity onPress={() => setShowPrivacyReport(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.content}>
              {privacyReport && (
                <View style={styles.reportContent}>
                  <Text style={styles.reportText}>
                    <Text style={styles.reportLabel}>Privacy Level:</Text> {privacyReport.privacyLevel}
                  </Text>
                  <Text style={styles.reportText}>
                    <Text style={styles.reportLabel}>Data Retention:</Text> {privacyReport.dataRetentionPolicy}
                  </Text>
                  <Text style={styles.reportText}>
                    <Text style={styles.reportLabel}>Anonymization:</Text> {privacyReport.anonymizationPolicy}
                  </Text>
                  <Text style={styles.reportText}>
                    <Text style={styles.reportLabel}>Data Age:</Text> {privacyReport.dataAge} days
                  </Text>
                  <Text style={styles.reportText}>
                    <Text style={styles.reportLabel}>Processing Activities:</Text> {privacyReport.dataProcessingActivities}
                  </Text>
                  
                  <View style={styles.complianceSection}>
                    <Text style={styles.sectionTitle}>Compliance Status</Text>
                    <Text style={styles.reportText}>
                      GDPR Compliant: {privacyReport.complianceStatus?.gdprCompliant ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.reportText}>
                      CCPA Compliant: {privacyReport.complianceStatus?.ccpaCompliant ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.reportText}>
                      Data Minimization: {privacyReport.complianceStatus?.dataMinimization ? '✅' : '❌'}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  closeText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  section: {
    marginVertical: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  statusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1
  },
  refreshButton: {
    padding: 4
  },
  statusDetails: {
    gap: 8
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusItemText: {
    fontSize: 14,
    color: '#6B7280'
  },
  issuesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    marginBottom: 4
  },
  issueText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8
  },
  privacyLevels: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  privacyLevel: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center'
  },
  privacyLevelActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1'
  },
  privacyLevelText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500'
  },
  privacyLevelTextActive: {
    color: '#FFFFFF'
  },
  privacyDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 4
  },
  privacyDetailText: {
    fontSize: 12,
    color: '#6B7280'
  },
  consentList: {
    gap: 12
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  consentInfo: {
    flex: 1
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827'
  },
  consentDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  alertCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  alertError: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444'
  },
  alertWarning: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B'
  },
  alertInfo: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6'
  },
  alertContent: {
    flex: 1
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2
  },
  alertMessage: {
    fontSize: 12,
    color: '#6B7280'
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8
  },
  dismissText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '300'
  },
  actionButtons: {
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  dangerButton: {
    borderColor: '#FEE2E2'
  },
  dangerText: {
    color: '#EF4444'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  reportContent: {
    padding: 16,
    gap: 12
  },
  reportText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20
  },
  reportLabel: {
    fontWeight: '600'
  },
  complianceSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  }
});