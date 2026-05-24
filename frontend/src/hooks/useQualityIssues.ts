import { useQuery } from '@tanstack/react-query';
import { getQualityIssues } from '@/services/reconciliation.service';

export function useQualityIssues(
  runId: string | null,
  page: number,
  limit: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['quality-issues', runId, page, limit],
    queryFn: () => getQualityIssues(runId!, page, limit),
    enabled: Boolean(runId) && enabled,
    placeholderData: (previous) => previous,
  });
}
