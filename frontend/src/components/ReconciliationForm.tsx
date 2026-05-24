import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Clock, Percent, Play, Settings2 } from 'lucide-react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { Loader } from '@/components/Loader';
import type { ReconciliationFormValues, UploadFiles } from '@/types/reconciliation';

interface ReconciliationFormProps {
  files: UploadFiles;
  onFilesChange: (files: UploadFiles) => void;
  onSubmit: (config: ReconciliationFormValues) => void;
  isSubmitting: boolean;
  isUploading?: boolean;
  fileErrors?: { userFile?: string; exchangeFile?: string };
}

const defaultValues: ReconciliationFormValues = {
  timestampToleranceSeconds: 300,
  quantityTolerancePct: 0.01,
};

export function ReconciliationForm({
  files,
  onFilesChange,
  onSubmit,
  isSubmitting,
  isUploading = false,
  fileErrors,
}: ReconciliationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReconciliationFormValues>({ defaultValues });

  const canSubmit =
    Boolean(files.userFile) &&
    Boolean(files.exchangeFile) &&
    !isSubmitting &&
    !isUploading;

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onSubmit={handleSubmit(onSubmit)}
      className="glass-card space-y-8 p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 border-b border-white/5 pb-6">
        <Settings2 className="h-5 w-5 text-accent" />
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            Upload & Configure
          </h2>
          <p className="text-sm text-slate-500">
            Provide both CSV files and matching tolerances
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FileUploadZone
          id="user-file"
          label="User Transactions"
          hint="user_transactions.csv"
          file={files.userFile}
          onFileChange={(f) => onFilesChange({ ...files, userFile: f })}
          disabled={isSubmitting || isUploading}
          error={fileErrors?.userFile}
        />
        <FileUploadZone
          id="exchange-file"
          label="Exchange Transactions"
          hint="exchange_transactions.csv"
          file={files.exchangeFile}
          onFileChange={(f) => onFilesChange({ ...files, exchangeFile: f })}
          disabled={isSubmitting || isUploading}
          error={fileErrors?.exchangeFile}
        />
      </div>

      {isUploading && (
        <Loader label="Uploading files…" size="md" className="py-4" />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="timestampToleranceSeconds"
            className="flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <Clock className="h-4 w-4 text-accent" />
            Timestamp tolerance (seconds)
          </label>
          <input
            id="timestampToleranceSeconds"
            type="number"
            min={1}
            step={1}
            disabled={isSubmitting || isUploading}
            className="input-field"
            {...register('timestampToleranceSeconds', {
              required: 'Required',
              valueAsNumber: true,
              min: { value: 1, message: 'Must be at least 1 second' },
            })}
          />
          {errors.timestampToleranceSeconds && (
            <p className="text-sm text-danger" role="alert">
              {errors.timestampToleranceSeconds.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="quantityTolerancePct"
            className="flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <Percent className="h-4 w-4 text-accent" />
            Quantity tolerance (%)
          </label>
          <input
            id="quantityTolerancePct"
            type="number"
            min={0.0001}
            max={100}
            step={0.01}
            disabled={isSubmitting || isUploading}
            className="input-field"
            {...register('quantityTolerancePct', {
              required: 'Required',
              valueAsNumber: true,
              min: { value: 0.0001, message: 'Must be greater than 0' },
              max: { value: 100, message: 'Cannot exceed 100%' },
            })}
          />
          {errors.quantityTolerancePct && (
            <p className="text-sm text-danger" role="alert">
              {errors.quantityTolerancePct.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-surface-950/30 border-t-surface-950" />
            Processing…
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Start Reconciliation
          </>
        )}
      </button>
    </motion.form>
  );
}
