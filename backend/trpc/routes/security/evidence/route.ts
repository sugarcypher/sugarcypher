import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';
import { TRPCError } from '@trpc/server';
import { createHash, randomBytes } from 'crypto';

interface EvidenceRecord {
  id: string;
  timestamp: Date;
  eventType: 'user_action' | 'system_event' | 'security_event' | 'data_access' | 'compliance_check';
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  resource?: string;
  metadata: Record<string, any>;
  hash: string;
  previousHash?: string;
  complianceFlags: string[];
  retentionDate: Date;
  encrypted: boolean;
}

interface AuditTrail {
  chainId: string;
  records: EvidenceRecord[];
  integrity: {
    verified: boolean;
    lastCheck: Date;
    checksum: string;
  };
}

// In-memory storage for demo (replace with secure database in production)
const evidenceStore = new Map<string, EvidenceRecord>();
const auditChains = new Map<string, AuditTrail>();
const complianceReports = new Map<string, any>();

// Compliance Standards Categories
const COMPLIANCE_STANDARDS = {
  SOC2: {
    SECURITY: 'soc2_security',
    AVAILABILITY: 'soc2_availability', 
    PROCESSING_INTEGRITY: 'soc2_processing_integrity',
    CONFIDENTIALITY: 'soc2_confidentiality',
    PRIVACY: 'soc2_privacy'
  },
  ISO27001: {
    INFORMATION_SECURITY: 'iso27001_info_security',
    RISK_MANAGEMENT: 'iso27001_risk_mgmt',
    ACCESS_CONTROL: 'iso27001_access_control',
    CRYPTOGRAPHY: 'iso27001_cryptography',
    INCIDENT_MANAGEMENT: 'iso27001_incident_mgmt'
  },
  HIPAA: {
    ADMINISTRATIVE: 'hipaa_administrative',
    PHYSICAL: 'hipaa_physical',
    TECHNICAL: 'hipaa_technical'
  },
  GDPR: {
    LAWFULNESS: 'gdpr_lawfulness',
    CONSENT: 'gdpr_consent',
    DATA_MINIMIZATION: 'gdpr_data_minimization',
    ACCURACY: 'gdpr_accuracy',
    STORAGE_LIMITATION: 'gdpr_storage_limitation',
    SECURITY: 'gdpr_security',
    ACCOUNTABILITY: 'gdpr_accountability'
  },
  CCPA: {
    NOTICE: 'ccpa_notice',
    CHOICE: 'ccpa_choice',
    ACCESS: 'ccpa_access',
    DELETION: 'ccpa_deletion',
    NON_DISCRIMINATION: 'ccpa_non_discrimination'
  },
  CPRA: {
    SENSITIVE_DATA: 'cpra_sensitive_data',
    THIRD_PARTY_SHARING: 'cpra_third_party_sharing',
    DATA_MINIMIZATION: 'cpra_data_minimization',
    RETENTION: 'cpra_retention'
  },
  PCI_DSS: {
    NETWORK_SECURITY: 'pci_network_security',
    CARDHOLDER_DATA: 'pci_cardholder_data',
    VULNERABILITY_MGMT: 'pci_vulnerability_mgmt',
    ACCESS_CONTROL: 'pci_access_control',
    MONITORING: 'pci_monitoring',
    SECURITY_POLICIES: 'pci_security_policies'
  },
  COPPA: {
    PARENTAL_CONSENT: 'coppa_parental_consent',
    NOTICE: 'coppa_notice',
    DATA_COLLECTION: 'coppa_data_collection',
    DISCLOSURE: 'coppa_disclosure',
    DELETION: 'coppa_deletion'
  }
} as const;

// Utility functions
function generateEvidenceHash(data: string, previousHash?: string): string {
  const content = previousHash ? `${data}:${previousHash}` : data;
  return createHash('sha256').update(content).digest('hex');
}

function encryptSensitiveData(data: any): string {
  // In production, use proper encryption with key management
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

function createEvidenceRecord(
  eventType: EvidenceRecord['eventType'],
  action: string,
  metadata: Record<string, any>,
  userId?: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string
): EvidenceRecord {
  const id = randomBytes(16).toString('hex');
  const timestamp = new Date();
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() + 7); // 7-year retention for SOC 2
  
  // Get previous hash for chain integrity
  const allRecords = Array.from(evidenceStore.values()).sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  const previousHash = allRecords.length > 0 ? allRecords[allRecords.length - 1].hash : undefined;
  
  const recordData = {
    id,
    timestamp,
    eventType,
    userId,
    sessionId: sessionId || 'anonymous',
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown',
    action,
    metadata,
    complianceFlags: determineComplianceFlags(eventType, action, metadata),
    retentionDate,
    encrypted: containsSensitiveData(metadata),
    previousHash
  };
  
  const hash = generateEvidenceHash(JSON.stringify(recordData), previousHash);
  
  return {
    ...recordData,
    hash
  };
}

function determineComplianceFlags(eventType: string, action: string, metadata: any): string[] {
  const flags: string[] = [];
  const actionLower = action.toLowerCase();
  const metadataStr = JSON.stringify(metadata).toLowerCase();
  
  // SOC 2 Compliance
  if (eventType === 'security_event') flags.push(COMPLIANCE_STANDARDS.SOC2.SECURITY);
  if (actionLower.includes('access') || actionLower.includes('login')) flags.push(COMPLIANCE_STANDARDS.SOC2.CONFIDENTIALITY);
  if (actionLower.includes('data') || actionLower.includes('scan')) flags.push(COMPLIANCE_STANDARDS.SOC2.PRIVACY);
  if (actionLower.includes('system') || actionLower.includes('backup')) flags.push(COMPLIANCE_STANDARDS.SOC2.AVAILABILITY);
  if (actionLower.includes('process') || actionLower.includes('validate')) flags.push(COMPLIANCE_STANDARDS.SOC2.PROCESSING_INTEGRITY);
  
  // ISO 27001 Compliance
  if (actionLower.includes('encrypt') || actionLower.includes('decrypt')) flags.push(COMPLIANCE_STANDARDS.ISO27001.CRYPTOGRAPHY);
  if (actionLower.includes('access_control') || actionLower.includes('permission')) flags.push(COMPLIANCE_STANDARDS.ISO27001.ACCESS_CONTROL);
  if (actionLower.includes('incident') || actionLower.includes('breach')) flags.push(COMPLIANCE_STANDARDS.ISO27001.INCIDENT_MANAGEMENT);
  if (actionLower.includes('risk') || actionLower.includes('assessment')) flags.push(COMPLIANCE_STANDARDS.ISO27001.RISK_MANAGEMENT);
  
  // HIPAA Compliance (if health data detected)
  if (metadataStr.includes('health') || metadataStr.includes('medical') || metadataStr.includes('phi')) {
    flags.push(COMPLIANCE_STANDARDS.HIPAA.TECHNICAL);
    if (actionLower.includes('access')) flags.push(COMPLIANCE_STANDARDS.HIPAA.ADMINISTRATIVE);
    if (actionLower.includes('physical')) flags.push(COMPLIANCE_STANDARDS.HIPAA.PHYSICAL);
  }
  
  // GDPR Compliance
  if (actionLower.includes('consent')) flags.push(COMPLIANCE_STANDARDS.GDPR.CONSENT);
  if (actionLower.includes('delete') || actionLower.includes('erasure')) flags.push(COMPLIANCE_STANDARDS.GDPR.STORAGE_LIMITATION);
  if (actionLower.includes('minimize') || actionLower.includes('purpose')) flags.push(COMPLIANCE_STANDARDS.GDPR.DATA_MINIMIZATION);
  if (actionLower.includes('accuracy') || actionLower.includes('correct')) flags.push(COMPLIANCE_STANDARDS.GDPR.ACCURACY);
  if (actionLower.includes('lawful') || actionLower.includes('legal_basis')) flags.push(COMPLIANCE_STANDARDS.GDPR.LAWFULNESS);
  
  // CCPA/CPRA Compliance
  if (actionLower.includes('notice') || actionLower.includes('disclosure')) flags.push(COMPLIANCE_STANDARDS.CCPA.NOTICE);
  if (actionLower.includes('opt_out') || actionLower.includes('choice')) flags.push(COMPLIANCE_STANDARDS.CCPA.CHOICE);
  if (actionLower.includes('data_access') || actionLower.includes('portability')) flags.push(COMPLIANCE_STANDARDS.CCPA.ACCESS);
  if (actionLower.includes('sensitive') && metadataStr.includes('personal')) flags.push(COMPLIANCE_STANDARDS.CPRA.SENSITIVE_DATA);
  
  // PCI DSS Compliance (if payment data detected)
  if (metadataStr.includes('payment') || metadataStr.includes('card') || metadataStr.includes('pan')) {
    flags.push(COMPLIANCE_STANDARDS.PCI_DSS.CARDHOLDER_DATA);
    if (actionLower.includes('network')) flags.push(COMPLIANCE_STANDARDS.PCI_DSS.NETWORK_SECURITY);
    if (actionLower.includes('monitor')) flags.push(COMPLIANCE_STANDARDS.PCI_DSS.MONITORING);
  }
  
  // COPPA Compliance (if child data detected)
  if (metadataStr.includes('child') || metadataStr.includes('minor') || metadataStr.includes('under_13')) {
    flags.push(COMPLIANCE_STANDARDS.COPPA.DATA_COLLECTION);
    if (actionLower.includes('consent') && metadataStr.includes('parent')) flags.push(COMPLIANCE_STANDARDS.COPPA.PARENTAL_CONSENT);
    if (actionLower.includes('notice')) flags.push(COMPLIANCE_STANDARDS.COPPA.NOTICE);
  }
  
  return flags;
}

function containsSensitiveData(metadata: any): boolean {
  const sensitiveKeys = ['email', 'phone', 'address', 'payment', 'biometric', 'health'];
  const dataString = JSON.stringify(metadata).toLowerCase();
  return sensitiveKeys.some(key => dataString.includes(key));
}

function verifyChainIntegrity(chainId: string): boolean {
  const chain = auditChains.get(chainId);
  if (!chain) return false;
  
  let previousHash: string | undefined;
  for (const record of chain.records) {
    const expectedHash = generateEvidenceHash(
      JSON.stringify({
        ...record,
        hash: undefined,
        previousHash
      }),
      previousHash
    );
    
    if (record.hash !== expectedHash) {
      return false;
    }
    
    previousHash = record.hash;
  }
  
  return true;
}

// Evidence Collection Procedures
export const recordEvidenceProcedure = publicProcedure
  .input(z.object({
    eventType: z.enum(['user_action', 'system_event', 'security_event', 'data_access', 'compliance_check']),
    action: z.string(),
    resource: z.string().optional(),
    metadata: z.record(z.string(), z.any()).default({}),
    userId: z.string().optional(),
    sessionId: z.string().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      const record = createEvidenceRecord(
        input.eventType,
        input.action,
        {
          ...input.metadata,
          resource: input.resource,
          timestamp: new Date().toISOString()
        },
        input.userId,
        input.sessionId,
        ctx.req.headers.get('x-forwarded-for') || 'unknown',
        ctx.req.headers.get('user-agent') || 'unknown'
      );
      
      // Store the record
      evidenceStore.set(record.id, record);
      
      // Add to audit chain
      const chainId = `chain_${new Date().toISOString().split('T')[0]}`;
      let chain = auditChains.get(chainId);
      
      if (!chain) {
        chain = {
          chainId,
          records: [],
          integrity: {
            verified: true,
            lastCheck: new Date(),
            checksum: ''
          }
        };
      }
      
      chain.records.push(record);
      chain.integrity.checksum = generateEvidenceHash(JSON.stringify(chain.records), undefined);
      chain.integrity.lastCheck = new Date();
      auditChains.set(chainId, chain);
      
      console.log(`[SOC2-EVIDENCE] Recorded: ${input.eventType} - ${input.action}`);
      
      return {
        success: true,
        recordId: record.id,
        chainId,
        timestamp: record.timestamp
      };
    } catch (error) {
      console.error('[SOC2-EVIDENCE] Failed to record evidence:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to record evidence'
      });
    }
  });

// Evidence Retrieval (for audits)
export const getEvidenceChainProcedure = protectedProcedure
  .input(z.object({
    chainId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    eventType: z.enum(['user_action', 'system_event', 'security_event', 'data_access', 'compliance_check']).optional(),
    userId: z.string().optional(),
    limit: z.number().min(1).max(1000).default(100)
  }))
  .query(async ({ input }) => {
    try {
      let records = Array.from(evidenceStore.values());
      
      // Apply filters
      if (input.chainId) {
        const chain = auditChains.get(input.chainId);
        records = chain ? chain.records : [];
      }
      
      if (input.startDate) {
        const startDate = new Date(input.startDate);
        records = records.filter(r => r.timestamp >= startDate);
      }
      
      if (input.endDate) {
        const endDate = new Date(input.endDate);
        records = records.filter(r => r.timestamp <= endDate);
      }
      
      if (input.eventType) {
        records = records.filter(r => r.eventType === input.eventType);
      }
      
      if (input.userId) {
        records = records.filter(r => r.userId === input.userId);
      }
      
      // Sort by timestamp and limit
      records = records
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, input.limit);
      
      // Verify chain integrity if specific chain requested
      let integrityStatus = null;
      if (input.chainId) {
        integrityStatus = {
          verified: verifyChainIntegrity(input.chainId),
          lastCheck: new Date()
        };
      }
      
      return {
        records: records.map(record => ({
          ...record,
          metadata: record.encrypted ? '[ENCRYPTED]' : record.metadata
        })),
        totalCount: records.length,
        integrityStatus
      };
    } catch (error) {
      console.error('[SOC2-EVIDENCE] Failed to retrieve evidence:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve evidence'
      });
    }
  });

// Compliance Report Generation
export const generateComplianceReportProcedure = protectedProcedure
  .input(z.object({
    reportType: z.enum(['soc2_type1', 'soc2_type2', 'iso27001', 'hipaa', 'gdpr', 'ccpa', 'cpra', 'pci_dss', 'coppa', 'comprehensive', 'custom']),
    startDate: z.string(),
    endDate: z.string(),
    categories: z.array(z.string()).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      const reportId = randomBytes(16).toString('hex');
      
      // Get all evidence records in date range
      const records = Array.from(evidenceStore.values())
        .filter(r => r.timestamp >= startDate && r.timestamp <= endDate);
      
      // Categorize evidence by compliance standards
      const categorizedEvidence = {
        // SOC 2
        soc2_security: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.SOC2.SECURITY)),
        soc2_availability: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.SOC2.AVAILABILITY)),
        soc2_processing_integrity: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.SOC2.PROCESSING_INTEGRITY)),
        soc2_confidentiality: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.SOC2.CONFIDENTIALITY)),
        soc2_privacy: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.SOC2.PRIVACY)),
        
        // ISO 27001
        iso27001_info_security: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.ISO27001.INFORMATION_SECURITY)),
        iso27001_access_control: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.ISO27001.ACCESS_CONTROL)),
        iso27001_cryptography: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.ISO27001.CRYPTOGRAPHY)),
        
        // HIPAA
        hipaa_technical: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.HIPAA.TECHNICAL)),
        hipaa_administrative: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.HIPAA.ADMINISTRATIVE)),
        hipaa_physical: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.HIPAA.PHYSICAL)),
        
        // GDPR
        gdpr_consent: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.GDPR.CONSENT)),
        gdpr_data_minimization: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.GDPR.DATA_MINIMIZATION)),
        gdpr_storage_limitation: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.GDPR.STORAGE_LIMITATION)),
        
        // CCPA/CPRA
        ccpa_notice: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.CCPA.NOTICE)),
        ccpa_choice: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.CCPA.CHOICE)),
        ccpa_access: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.CCPA.ACCESS)),
        cpra_sensitive_data: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.CPRA.SENSITIVE_DATA)),
        
        // PCI DSS
        pci_cardholder_data: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.PCI_DSS.CARDHOLDER_DATA)),
        pci_network_security: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.PCI_DSS.NETWORK_SECURITY)),
        
        // COPPA
        coppa_data_collection: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.COPPA.DATA_COLLECTION)),
        coppa_parental_consent: records.filter(r => r.complianceFlags.includes(COMPLIANCE_STANDARDS.COPPA.PARENTAL_CONSENT))
      };
      
      // Generate comprehensive compliance metrics
      const metrics = {
        totalEvents: records.length,
        
        // Event type breakdown
        securityEvents: records.filter(r => r.eventType === 'security_event').length,
        dataAccessEvents: records.filter(r => r.eventType === 'data_access').length,
        userActions: records.filter(r => r.eventType === 'user_action').length,
        systemEvents: records.filter(r => r.eventType === 'system_event').length,
        complianceChecks: records.filter(r => r.eventType === 'compliance_check').length,
        
        // Security metrics
        encryptedRecords: records.filter(r => r.encrypted).length,
        integrityVerified: Array.from(auditChains.values()).every(chain => verifyChainIntegrity(chain.chainId)),
        
        // SOC 2 metrics
        soc2Coverage: {
          security: categorizedEvidence.soc2_security.length,
          availability: categorizedEvidence.soc2_availability.length,
          processingIntegrity: categorizedEvidence.soc2_processing_integrity.length,
          confidentiality: categorizedEvidence.soc2_confidentiality.length,
          privacy: categorizedEvidence.soc2_privacy.length
        },
        
        // ISO 27001 metrics
        iso27001Coverage: {
          accessControl: categorizedEvidence.iso27001_access_control.length,
          cryptography: categorizedEvidence.iso27001_cryptography.length,
          informationSecurity: categorizedEvidence.iso27001_info_security.length
        },
        
        // HIPAA metrics
        hipaaCompliance: {
          technical: categorizedEvidence.hipaa_technical.length,
          administrative: categorizedEvidence.hipaa_administrative.length,
          physical: categorizedEvidence.hipaa_physical.length
        },
        
        // GDPR metrics
        gdprCompliance: {
          consent: categorizedEvidence.gdpr_consent.length,
          dataMinimization: categorizedEvidence.gdpr_data_minimization.length,
          storageLimitation: categorizedEvidence.gdpr_storage_limitation.length
        },
        
        // CCPA/CPRA metrics
        ccpaCompliance: {
          notice: categorizedEvidence.ccpa_notice.length,
          choice: categorizedEvidence.ccpa_choice.length,
          access: categorizedEvidence.ccpa_access.length,
          sensitiveData: categorizedEvidence.cpra_sensitive_data.length
        },
        
        // PCI DSS metrics
        pciCompliance: {
          cardholderData: categorizedEvidence.pci_cardholder_data.length,
          networkSecurity: categorizedEvidence.pci_network_security.length
        },
        
        // COPPA metrics
        coppaCompliance: {
          dataCollection: categorizedEvidence.coppa_data_collection.length,
          parentalConsent: categorizedEvidence.coppa_parental_consent.length
        }
      };
      
      const report = {
        id: reportId,
        type: input.reportType,
        generatedAt: new Date(),
        period: {
          start: startDate,
          end: endDate
        },
        metrics,
        categorizedEvidence,
        summary: {
          compliant: metrics.integrityVerified && metrics.totalEvents > 0,
          recommendations: generateRecommendations(metrics),
          riskLevel: calculateRiskLevel(metrics)
        },
        auditTrail: {
          chains: Array.from(auditChains.keys()),
          integrityStatus: Array.from(auditChains.values()).map(chain => ({
            chainId: chain.chainId,
            verified: verifyChainIntegrity(chain.chainId),
            recordCount: chain.records.length
          }))
        }
      };
      
      // Store report
      complianceReports.set(reportId, report);
      
      // Record the report generation as evidence
      const reportRecord = createEvidenceRecord(
        'compliance_check',
        'generate_compliance_report',
        {
          reportType: input.reportType,
          reportId,
          recordCount: records.length,
          period: `${input.startDate} to ${input.endDate}`
        },
        undefined,
        'system',
        'system',
        'ComplianceReporter/1.0'
      );
      evidenceStore.set(reportRecord.id, reportRecord);
      
      // Add to audit chain
      const reportChainId = `report_${new Date().toISOString().split('T')[0]}`;
      let reportChain = auditChains.get(reportChainId);
      
      if (!reportChain) {
        reportChain = {
          chainId: reportChainId,
          records: [],
          integrity: {
            verified: true,
            lastCheck: new Date(),
            checksum: ''
          }
        };
      }
      
      reportChain.records.push(reportRecord);
      reportChain.integrity.checksum = generateEvidenceHash(JSON.stringify(reportChain.records), undefined);
      reportChain.integrity.lastCheck = new Date();
      auditChains.set(reportChainId, reportChain);
      
      console.log(`[SOC2-COMPLIANCE] Generated ${input.reportType} report: ${reportId}`);
      
      return {
        success: true,
        reportId,
        summary: report.summary,
        downloadUrl: `/api/compliance/reports/${reportId}`
      };
    } catch (error) {
      console.error('[SOC2-COMPLIANCE] Failed to generate report:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate compliance report'
      });
    }
  });

function generateRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.securityEvents === 0) {
    recommendations.push('Implement security event monitoring');
  }
  
  if (metrics.encryptedRecords / metrics.totalEvents < 0.5) {
    recommendations.push('Increase encryption coverage for sensitive data');
  }
  
  if (!metrics.integrityVerified) {
    recommendations.push('Address audit trail integrity issues');
  }
  
  if (metrics.complianceChecks === 0) {
    recommendations.push('Implement regular compliance monitoring');
  }
  
  return recommendations;
}

function calculateRiskLevel(metrics: any): 'low' | 'medium' | 'high' {
  let riskScore = 0;
  
  if (metrics.securityEvents === 0) riskScore += 2;
  if (!metrics.integrityVerified) riskScore += 3;
  if (metrics.encryptedRecords / metrics.totalEvents < 0.3) riskScore += 2;
  if (metrics.complianceChecks === 0) riskScore += 1;
  
  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

// Evidence Cleanup (for retention compliance)
export const cleanupExpiredEvidenceProcedure = protectedProcedure
  .mutation(async () => {
    try {
      const now = new Date();
      let cleanedCount = 0;
      
      for (const [id, record] of evidenceStore.entries()) {
        if (record.retentionDate <= now) {
          evidenceStore.delete(id);
          cleanedCount++;
        }
      }
      
      // Clean up audit chains
      for (const [chainId, chain] of auditChains.entries()) {
        chain.records = chain.records.filter(record => record.retentionDate > now);
        if (chain.records.length === 0) {
          auditChains.delete(chainId);
        }
      }
      
      console.log(`[SOC2-CLEANUP] Cleaned ${cleanedCount} expired evidence records`);
      
      return {
        success: true,
        cleanedRecords: cleanedCount,
        timestamp: now
      };
    } catch (error) {
      console.error('[SOC2-CLEANUP] Failed to cleanup evidence:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to cleanup expired evidence'
      });
    }
  });

// Launch Evidence Collection
export const initializeLaunchEvidenceProcedure = publicProcedure
  .mutation(async ({ ctx }) => {
    try {
      const launchTimestamp = new Date();
      
      // Record launch event
      const launchRecord = createEvidenceRecord(
        'system_event',
        'application_launch',
        {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          timestamp: launchTimestamp.toISOString(),
          soc2_compliance_enabled: true,
          evidence_collection_active: true
        },
        undefined,
        'system',
        ctx.req.headers.get('x-forwarded-for') || 'system',
        'SugarCypher/1.0.0'
      );
      
      evidenceStore.set(launchRecord.id, launchRecord);
      
      // Initialize daily audit chain
      const chainId = `launch_${launchTimestamp.toISOString().split('T')[0]}`;
      const chain: AuditTrail = {
        chainId,
        records: [launchRecord],
        integrity: {
          verified: true,
          lastCheck: launchTimestamp,
          checksum: generateEvidenceHash(JSON.stringify([launchRecord]), undefined)
        }
      };
      
      auditChains.set(chainId, chain);
      
      console.log('[SOC2-LAUNCH] Evidence collection initialized for SugarCypher launch');
      
      return {
        success: true,
        launchId: launchRecord.id,
        chainId,
        timestamp: launchTimestamp,
        complianceStatus: 'active'
      };
    } catch (error) {
      console.error('[SOC2-LAUNCH] Failed to initialize launch evidence:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to initialize launch evidence collection'
      });
    }
  });