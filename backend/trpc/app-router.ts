import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import {
  createSessionProcedure,
  validateSessionProcedure,
  invalidateSessionProcedure,
  securityHealthCheckProcedure,
  getSecurityMetricsProcedure
} from "./routes/security/auth/route";
import {
  updatePrivacySettingsProcedure,
  getPrivacySettingsProcedure,
  recordConsentProcedure,
  getConsentStatusProcedure,
  requestDataDeletionProcedure,
  getDataProcessingLogProcedure,
  generatePrivacyReportProcedure,
  anonymizeUserDataProcedure
} from "./routes/security/privacy/route";
import {
  recordEvidenceProcedure,
  getEvidenceChainProcedure,
  generateComplianceReportProcedure,
  cleanupExpiredEvidenceProcedure,
  initializeLaunchEvidenceProcedure
} from "./routes/security/evidence/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  security: createTRPCRouter({
    auth: createTRPCRouter({
      createSession: createSessionProcedure,
      validateSession: validateSessionProcedure,
      invalidateSession: invalidateSessionProcedure,
      healthCheck: securityHealthCheckProcedure,
      getMetrics: getSecurityMetricsProcedure
    }),
    privacy: createTRPCRouter({
      updateSettings: updatePrivacySettingsProcedure,
      getSettings: getPrivacySettingsProcedure,
      recordConsent: recordConsentProcedure,
      getConsentStatus: getConsentStatusProcedure,
      requestDataDeletion: requestDataDeletionProcedure,
      getProcessingLog: getDataProcessingLogProcedure,
      generateReport: generatePrivacyReportProcedure,
      anonymizeData: anonymizeUserDataProcedure
    }),
    evidence: createTRPCRouter({
      record: recordEvidenceProcedure,
      getChain: getEvidenceChainProcedure,
      generateReport: generateComplianceReportProcedure,
      cleanup: cleanupExpiredEvidenceProcedure,
      initializeLaunch: initializeLaunchEvidenceProcedure
    })
  })
});

export type AppRouter = typeof appRouter;