import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import type { AppError } from '@/utils/errors';

interface ErrorAlertProps {
  error: AppError;
  onDismiss?: () => void;
}

const kindLabels: Record<AppError['kind'], string> = {
  invalid_file: 'Invalid file',
  network: 'Network error',
  validation: 'Validation error',
  server: 'Server error',
  unknown: 'Error',
};

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      role="alert"
      className="flex gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger"
    >
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{kindLabels[error.kind]}</p>
        <p className="mt-1 text-sm text-danger/90">{error.message}</p>
        {error.details && (
          <p className="mt-1 text-xs text-danger/70">{error.details}</p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 transition hover:bg-danger/20"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}
