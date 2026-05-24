import { apiClient } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  DataQualityIssue,
  ReconciliationFormValues,
  ReconciliationStatusResponse,
  StartReconciliationResponse,
  ReconciliationUploadFiles,
} from '@/types/reconciliation';

export async function startReconciliation(
  files: ReconciliationUploadFiles,
  config: ReconciliationFormValues
): Promise<StartReconciliationResponse> {
  const formData = new FormData();
  formData.append('userFile', files.userFile);
  formData.append('exchangeFile', files.exchangeFile);
  formData.append(
    'timestampToleranceSeconds',
    String(config.timestampToleranceSeconds)
  );
  formData.append('quantityTolerancePct', String(config.quantityTolerancePct));

  const { data } = await apiClient.post<StartReconciliationResponse>(
    '/api/v1/reconcile',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return data;
}

export async function getReconciliationStatus(
  runId: string
): Promise<ReconciliationStatusResponse> {
  const { data } = await apiClient.get<ReconciliationStatusResponse>(
    `/api/v1/reconcile/${runId}`
  );
  return data;
}

export async function downloadReport(runId: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/api/v1/reconcile/${runId}/report`, {
    responseType: 'blob',
  });
  return data;
}

export async function getQualityIssues(
  runId: string,
  page: number,
  limit: number
): Promise<PaginatedResponse<DataQualityIssue>> {
  const { data } = await apiClient.get<PaginatedResponse<DataQualityIssue>>(
    `/api/v1/reconcile/${runId}/issues`,
    { params: { page, limit } }
  );
  return data;
}
