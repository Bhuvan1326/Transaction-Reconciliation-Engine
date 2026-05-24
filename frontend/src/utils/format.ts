import type { RunStatus } from '@/types/reconciliation';

export function formatNumber(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatReason(reason: string): string {
  return reason
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function statusLabel(status: RunStatus): string {
  const labels: Record<RunStatus, string> = {
    pending: 'Pending',
    running: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[status] ?? status;
}

export function truncateId(id: string, visible = 8): string {
  if (id.length <= visible * 2 + 3) return id;
  return `${id.slice(0, visible)}…${id.slice(-visible)}`;
}
