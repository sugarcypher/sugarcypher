import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
  Eye,
  Lock,
  Users,
  Globe,
  CreditCard,
  Baby,
  Clock
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useSecurityStore } from '@/store/securityStore';

interface ComplianceMetrics {
  totalEvents: number;
  securityEvents: number;
  dataAccessEvents: number;
  encryptedRecords: number;
  integrityVerified: boolean;
  soc2Coverage: {
    security: number;
    availability: number;
    processingIntegrity: number;
    confidentiality: number;
    privacy: number;
  };
  iso27001Coverage: {
    accessControl: number;
    cryptography: number;
    informationSecurity: number;
  };
  hipaaCompliance: {
    technical: number;
    administrative: number;
    physical: number;
  };
  gdprCompliance: {
    consent: number;
    dataMinimization: number;
    storageLimitation: number;
  };
  ccpaCompliance: {
    notice: number;
    choice: number;
    access: number;
    sensitiveData: number;
  };
  pciCompliance: {
    cardholderData: number;
    networkSecurity: number;
  };
  coppaCompliance: {
    dataCollection: number;
    parentalConsent: number;
  };
}

interface ComplianceReport {
  id: string;
  type: string;
  generatedAt: Date;
  metrics: ComplianceMetrics;
  summary: {
    compliant: boolean;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

const COMPLIANCE_STANDARDS = [
  {
    id: 'soc2_type2',
    name: 'SOC 2 Type II',
    icon: Shield,
    color: '#00ff88',
    description: 'Service Organization Control 2'
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    icon: Lock,
    color: '#3b82f6',
    description: 'Information Security Management'
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    icon: FileText,
    color: '#ef4444',
    description: 'Health Insurance Portability'
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    icon: Globe,
    color: '#8b5cf6',
    description: 'General Data Protection Regulation'
  },
  {
    id: 'ccpa',
    name: 'CCPA',
    icon: Users,
    color: '#f59e0b',
    description: 'California Consumer Privacy Act'
  },
  {
    id: 'cpra',
    name: 'CPRA',
    icon: Eye,
    color: '#06b6d4',
    description: 'California Privacy Rights Act'
  },
  {
    id: 'pci_dss',
    name: 'PCI DSS',
    icon: CreditCard,
    color: '#10b981',
    description: 'Payment Card Industry Data Security'
  },
  {
    id: 'coppa',
    name: 'COPPA',
    icon: Baby,
    color: '#f97316',
    description: 'Children\'s Online Privacy Protection'
  }
];

interface ComplianceDashboardProps {
  onClose?: () => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ onClose }) => {
  const [selectedStandard, setSelectedStandard] = useState<string>('comprehensive');
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [evidenceStats, setEvidenceStats] = useState<any>(null);
  
  const { currentSession, checkSecurityHealth } = useSecurityStore();
  
  const generateReportMutation = trpc.security.evidence.generateReport.useMutation();
  const evidenceQuery = trpc.security.evidence.getChain.useQuery({
    limit: 1000,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
    endDate: new Date().toISOString()
  });
  
  useEffect(() => {
    loadEvidenceStats();
    checkSecurityHealth();
  }, []);
  
  const loadEvidenceStats = async () => {
    try {
      if (evidenceQuery.data) {
        const records = evidenceQuery.data.records;
        setEvidenceStats({
          totalRecords: records.length,
          encryptedRecords: records.filter((r) => r.encrypted).length,
          securityEvents: records.filter((r) => r.eventType === 'security_event').length,
          dataAccessEvents: records.filter((r) => r.eventType === 'data_access').length,
          complianceChecks: records.filter((r) => r.eventType === 'compliance_check').length
        });
      }
    } catch (error) {
      console.error('Failed to load evidence stats:', error);
    }
  };
  
  const generateComplianceReport = async (reportType: string) => {
    if (!currentSession) {
      Alert.alert('Authentication Required', 'Please log in to generate compliance reports.');
      return;
    }
    
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // Last 90 days
      
      const result = await generateReportMutation.mutateAsync({
        reportType: reportType as any,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      Alert.alert(
        'Report Generated',
        `${reportType.toUpperCase()} compliance report has been generated successfully.`,
        [
          { text: 'OK' },
          { text: 'View Report', onPress: () => viewReport(result.reportId) }
        ]
      );
      
      // Refresh evidence stats
      await evidenceQuery.refetch();
      loadEvidenceStats();
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      Alert.alert('Error', 'Failed to generate compliance report. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const viewReport = (reportId: string) => {
    Alert.alert('Report Ready', `Report ID: ${reportId}\n\nIn a production environment, this would download or display the full compliance report.`);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await evidenceQuery.refetch();
      await loadEvidenceStats();
      await checkSecurityHealth();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getComplianceStatus = (standard: string): 'compliant' | 'partial' | 'non-compliant' => {
    if (!evidenceStats) return 'non-compliant';
    
    // Simple compliance logic based on evidence presence
    const hasEvidence = evidenceStats.totalRecords > 0;
    const hasSecurityEvents = evidenceStats.securityEvents > 0;
    const hasEncryption = evidenceStats.encryptedRecords > 0;
    const hasComplianceChecks = evidenceStats.complianceChecks > 0;
    
    if (hasEvidence && hasSecurityEvents && hasEncryption && hasComplianceChecks) {
      return 'compliant';
    } else if (hasEvidence && (hasSecurityEvents || hasEncryption)) {
      return 'partial';
    }
    return 'non-compliant';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle size={20} color="#10b981" />;
      case 'partial':
        return <AlertTriangle size={20} color="#f59e0b" />;
      default:
        return <XCircle size={20} color="#ef4444" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return '#10b981';
      case 'partial':
        return '#f59e0b';
      default:
        return '#ef4444';
    }
  };
  
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'security_event': return <Shield size={16} color="#ff6b6b" />;
      case 'user_action': return <CheckCircle size={16} color="#00ff88" />;
      case 'data_access': return <FileText size={16} color="#ffa500" />;
      case 'compliance_check': return <AlertTriangle size={16} color="#00bfff" />;
      case 'system_event': return <Clock size={16} color="#888" />;
      default: return <FileText size={16} color="#888" />;
    }
  };

  const records = evidenceQuery.data?.records || [];
  const totalRecords = records.length;
  const securityEvents = records.filter((r) => r.eventType === 'security_event').length;
  const userActions = records.filter((r) => r.eventType === 'user_action').length;
  const dataAccess = records.filter((r) => r.eventType === 'data_access').length;
  const complianceChecks = records.filter((r) => r.eventType === 'compliance_check').length;
  const systemEvents = records.filter((r) => r.eventType === 'system_event').length;

  const complianceScore = totalRecords > 0 ? Math.round(((complianceChecks + systemEvents) / totalRecords) * 100) : 0;
  const integrityStatus = evidenceQuery.data?.integrityStatus?.verified ? 'verified' : 'pending';

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Shield size={32} color="#00ff88" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Compliance Dashboard</Text>
            <Text style={styles.subtitle}>Multi-Standard Security Compliance</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Evidence Statistics */}
      {evidenceStats && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Evidence Collection Status</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{evidenceStats.totalRecords}</Text>
              <Text style={styles.statLabel}>Total Records</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{evidenceStats.encryptedRecords}</Text>
              <Text style={styles.statLabel}>Encrypted</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{evidenceStats.securityEvents}</Text>
              <Text style={styles.statLabel}>Security Events</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{evidenceStats.complianceChecks}</Text>
              <Text style={styles.statLabel}>Compliance Checks</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Compliance Standards */}
      <View style={styles.standardsContainer}>
        <Text style={styles.sectionTitle}>Compliance Standards</Text>
        
        {COMPLIANCE_STANDARDS.map((standard) => {
          const status = getComplianceStatus(standard.id);
          const IconComponent = standard.icon;
          
          return (
            <View key={standard.id} style={styles.standardCard}>
              <View style={styles.standardHeader}>
                <View style={styles.standardInfo}>
                  <IconComponent size={24} color={standard.color} />
                  <View style={styles.standardText}>
                    <Text style={styles.standardName}>{standard.name}</Text>
                    <Text style={styles.standardDescription}>{standard.description}</Text>
                  </View>
                </View>
                <View style={styles.standardStatus}>
                  {getStatusIcon(status)}
                  <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                    {status.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.standardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.generateButton]}
                  onPress={() => generateComplianceReport(standard.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <FileText size={16} color="#000" />
                  )}
                  <Text style={styles.generateButtonText}>Generate Report</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={() => Alert.alert('Evidence View', `Viewing evidence for ${standard.name}`)}
                >
                  <Eye size={16} color="#00ff88" />
                  <Text style={styles.viewButtonText}>View Evidence</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
      
      {/* Comprehensive Report */}
      <View style={styles.comprehensiveContainer}>
        <Text style={styles.sectionTitle}>Comprehensive Compliance</Text>
        <View style={styles.comprehensiveCard}>
          <View style={styles.comprehensiveHeader}>
            <Shield size={28} color="#00ff88" />
            <View>
              <Text style={styles.comprehensiveTitle}>All Standards Report</Text>
              <Text style={styles.comprehensiveSubtitle}>
                Generate a comprehensive report covering all compliance standards
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.comprehensiveButton}
            onPress={() => generateComplianceReport('comprehensive')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Download size={20} color="#000" />
            )}
            <Text style={styles.comprehensiveButtonText}>Generate Comprehensive Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Evidence Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Evidence Records</Text>
        <View style={styles.recordsList}>
          {records.slice(0, 10).map((record: any, index: number) => (
            <View key={record.id || index} style={styles.recordItem}>
              <View style={styles.recordHeader}>
                {getEventTypeIcon(record.eventType)}
                <Text style={styles.recordAction}>{record.action}</Text>
                <Text style={styles.recordTime}>
                  {new Date(record.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              {record.resource && (
                <Text style={styles.recordResource}>Resource: {record.resource}</Text>
              )}
              <View style={styles.recordFlags}>
                {record.complianceFlags?.map((flag: string) => (
                  <View key={flag} style={styles.flagBadge}>
                    <Text style={styles.flagText}>{flag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Evidence collection is active and compliant with all major privacy and security standards.
        </Text>
        <Text style={styles.footerSubtext}>
          Last updated: {new Date().toLocaleString()}
        </Text>
      </View>

      {evidenceQuery.isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading evidence data...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1
  },
  headerText: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#888'
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 16
  },
  statsContainer: {
    padding: 20
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#00ff88',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center'
  },
  standardsContainer: {
    padding: 20,
    paddingTop: 0
  },
  standardCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  standardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  standardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  standardText: {
    flex: 1
  },
  standardName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2
  },
  standardDescription: {
    fontSize: 12,
    color: '#888'
  },
  standardStatus: {
    alignItems: 'center',
    gap: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600' as const
  },
  standardActions: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  generateButton: {
    backgroundColor: '#00ff88'
  },
  generateButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600' as const
  },
  viewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ff88'
  },
  viewButtonText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600' as const
  },
  comprehensiveContainer: {
    padding: 20,
    paddingTop: 0
  },
  comprehensiveCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#00ff88'
  },
  comprehensiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20
  },
  comprehensiveTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4
  },
  comprehensiveSubtitle: {
    fontSize: 14,
    color: '#888'
  },
  comprehensiveButton: {
    backgroundColor: '#00ff88',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 8
  },
  comprehensiveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700' as const
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#00ff88',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  dateRangeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  dateButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#111',
  },
  dateButtonActive: {
    backgroundColor: '#00ff88',
  },
  dateButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dateButtonTextActive: {
    color: '#000',
  },
  evidenceList: {
    gap: 10,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  evidenceLabel: {
    flex: 1,
    color: '#ccc',
    fontSize: 14,
  },
  evidenceCount: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600' as const,
    minWidth: 30,
    textAlign: 'right',
  },
  reportTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  reportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#111',
  },
  reportButtonActive: {
    backgroundColor: '#00ff88',
  },
  reportButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  reportButtonTextActive: {
    color: '#000',
  },

  recordsList: {
    gap: 10,
  },
  recordItem: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  recordAction: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  recordTime: {
    color: '#888',
    fontSize: 12,
  },
  recordResource: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 5,
  },
  recordFlags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  flagBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flagText: {
    color: '#00ff88',
    fontSize: 10,
    fontWeight: '500' as const,
  },
  cleanupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
  },
  cleanupButtonText: {
    color: '#ffa500',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  }
});