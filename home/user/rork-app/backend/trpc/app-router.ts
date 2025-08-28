import { createTRPCRouter } from "../../backend/trpc/create-context";
import hiRoute from "../../backend/trpc/routes/example/hi/route";
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
    })
  })
});

export type AppRouter = typeof appRouter;