import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Loader } from '@/components/Loader';
import { formatReason } from '@/utils/format';
import type { DataQualityIssue } from '@/types/reconciliation';

interface IssuesTableProps {
  items: DataQualityIssue[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

function SeverityBadge({ severity }: { severity: DataQualityIssue['severity'] }) {
  const styles =
    severity === 'error'
      ? 'bg-danger/15 text-danger ring-danger/30'
      : 'bg-warning/15 text-warning ring-warning/30';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${styles}`}
    >
      {severity}
    </span>
  );
}

export function IssuesTable({
  items,
  page,
  limit,
  total,
  onPageChange,
  isLoading = false,
}: IssuesTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 font-medium text-slate-400">Severity</th>
              <th className="px-4 py-3 font-medium text-slate-400">Source</th>
              <th className="px-4 py-3 font-medium text-slate-400">Reason</th>
              <th className="px-4 py-3 font-medium text-slate-400">
                Transaction ID
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">Row</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12">
                  <Loader label="Loading issues…" size="md" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  No data quality issues found for this run.
                </td>
              </tr>
            ) : (
              items.map((issue, i) => (
                <motion.tr
                  key={`${issue.source}-${issue.rowIndex}-${issue.reason}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/5 transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <SeverityBadge severity={issue.severity} />
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-300">
                    {issue.source}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatReason(issue.reason)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {issue.transactionId || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{issue.rowIndex}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 px-4 py-4 sm:flex-row">
        <p className="text-sm text-slate-500">
          Showing {from}–{to} of {total}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="btn-secondary px-3 py-2"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[80px] text-center text-sm text-slate-400">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="btn-secondary px-3 py-2"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
