import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { formatNumber } from '@/utils/format';
import type { ReconciliationSummary } from '@/types/reconciliation';

interface SummaryCardsProps {
  summary: ReconciliationSummary;
}

const cards = [
  {
    key: 'matched' as const,
    label: 'Matched',
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
    ring: 'ring-success/20',
  },
  {
    key: 'conflicting' as const,
    label: 'Conflicting',
    icon: ShieldAlert,
    color: 'text-warning',
    bg: 'bg-warning/10',
    ring: 'ring-warning/20',
  },
  {
    key: 'unmatchedUser' as const,
    label: 'Unmatched User',
    icon: HelpCircle,
    color: 'text-accent',
    bg: 'bg-accent/10',
    ring: 'ring-accent/20',
  },
  {
    key: 'unmatchedExchange' as const,
    label: 'Unmatched Exchange',
    icon: XCircle,
    color: 'text-slate-300',
    bg: 'bg-white/5',
    ring: 'ring-white/10',
  },
  {
    key: 'dataQualityIssues' as const,
    label: 'Data Quality Issues',
    icon: AlertTriangle,
    color: 'text-danger',
    bg: 'bg-danger/10',
    ring: 'ring-danger/20',
  },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = summary[card.key];

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card flex flex-col gap-3 p-5 ring-1 ${card.ring}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className={`font-display text-3xl font-bold ${card.color}`}>
              {formatNumber(value)}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
