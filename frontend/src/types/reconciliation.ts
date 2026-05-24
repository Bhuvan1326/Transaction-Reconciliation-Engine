export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';

export type IssueSeverity = 'error' | 'warning';

export interface ReconciliationConfig {
  timestampToleranceSeconds: number;
  quantityTolerancePct: number;
}

export interface ReconciliationSummary {
  totalUser?: number;
  totalExchange?: number;
  matched: number;
  conflicting: number;
  unmatchedUser: number;
  unmatchedExchange: number;
  dataQualityIssues: number;
}

export interface StartReconciliationResponse {
  runId: string;
  status: RunStatus;
}

export interface ReconciliationStatusResponse {
  runId: string;
  status: RunStatus;
  startedAt?: string;
  completedAt?: string;
  config?: ReconciliationConfig;
  summary?: ReconciliationSummary;
  reportPath?: string;
}

export interface DataQualityIssue {
  source: string;
  rowIndex: number;
  transactionId: string;
  reason: string;
  severity: IssueSeverity;
}

export interface ReconciliationFormValues {
  timestampToleranceSeconds: number;
  quantityTolerancePct: number;
}

export interface UploadFiles {
  userFile: File | null;
  exchangeFile: File | null;
}

export interface ReconciliationUploadFiles {
  userFile: File;
  exchangeFile: File;
}
