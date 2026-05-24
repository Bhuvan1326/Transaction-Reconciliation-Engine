import { motion } from 'framer-motion';
import { Loader } from '@/components/Loader';
import { statusLabel } from '@/utils/format';
import type { RunStatus } from '@/types/reconciliation';

interface ReconciliationProgressProps {
  runId: string;
  status: RunStatus;
}

export function ReconciliationProgress({
  runId,
  status,
}: ReconciliationProgressProps) {
  const isActive = status === 'pending' || status === 'running';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 sm:p-8"
    >
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        {isActive && <Loader label="Reconciling transactions…" size="lg" />}
        <div className="flex-1 space-y-2">
          <p className="text-sm text-slate-500">Run ID</p>
          <p className="break-all font-mono text-sm text-accent">{runId}</p>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="text-sm text-slate-400">Status:</span>
            <StatusPill status={status} />
          </div>
          {isActive && (
            <p className="text-xs text-slate-500">
              Polling every 2 seconds until complete…
            </p>
          )}
        </div>
      </div>
      {isActive && (
        <motion.div
          className="mt-6 h-1 overflow-hidden rounded-full bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-accent-muted to-accent"
            initial={{ width: '0%' }}
            animate={{ width: ['20%', '80%', '40%', '90%', '60%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function StatusPill({ status }: { status: RunStatus }) {
  const styles: Record<RunStatus, string> = {
    pending: 'bg-slate-500/20 text-slate-300',
    running: 'bg-accent/20 text-accent animate-pulse-slow',
    completed: 'bg-success/20 text-success',
    failed: 'bg-danger/20 text-danger',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
