import { useQuery } from '@tanstack/react-query';
import { getReconciliationStatus } from '@/services/reconciliation.service';
import type { RunStatus } from '@/types/reconciliation';

const POLL_INTERVAL_MS = 2000;

const ACTIVE_STATUSES: RunStatus[] = ['pending', 'running'];

export function useReconciliationPoll(runId: string | null) {
  return useQuery({
    queryKey: ['reconciliation', runId],
    queryFn: () => getReconciliationStatus(runId!),
    enabled: Boolean(runId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return POLL_INTERVAL_MS;
      return ACTIVE_STATUSES.includes(status) ? POLL_INTERVAL_MS : false;
    },
    refetchIntervalInBackground: true,
  });
}
