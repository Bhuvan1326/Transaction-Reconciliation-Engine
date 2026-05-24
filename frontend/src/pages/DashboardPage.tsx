import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { ReconciliationForm } from '@/components/ReconciliationForm';
import { ReconciliationProgress } from '@/components/ReconciliationProgress';
import { SummaryCards } from '@/components/SummaryCards';
import { IssuesTable } from '@/components/IssuesTable';
import { ReportDownloadButton } from '@/components/ReportDownloadButton';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useReconciliationPoll } from '@/hooks/useReconciliationPoll';
import { useQualityIssues } from '@/hooks/useQualityIssues';
import { startReconciliation } from '@/services/reconciliation.service';
import { parseApiError, type AppError } from '@/utils/errors';
import type {
  ReconciliationFormValues,
  UploadFiles,
} from '@/types/reconciliation';

const ISSUES_PAGE_SIZE = 10;

export function DashboardPage() {
  const [files, setFiles] = useState<UploadFiles>({
    userFile: null,
    exchangeFile: null,
  });
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [showIssues, setShowIssues] = useState(false);
  const [issuesPage, setIssuesPage] = useState(1);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const pollQuery = useReconciliationPoll(activeRunId);
  const statusData = pollQuery.data;
  const status = statusData?.status;
  const isProcessing =
    status === 'pending' || status === 'running' || pollQuery.isLoading;

  const issuesQuery = useQualityIssues(
    activeRunId,
    issuesPage,
    ISSUES_PAGE_SIZE,
    showIssues && status === 'completed'
  );

  const startMutation = useMutation({
    mutationFn: (config: ReconciliationFormValues) => {
      if (!files.userFile || !files.exchangeFile) {
        throw new Error('Both CSV files are required.');
      }
      return startReconciliation(
        { userFile: files.userFile, exchangeFile: files.exchangeFile },
        config
      );
    },
    onMutate: () => {
      setError(null);
      setDownloadError(null);
      setShowIssues(false);
      setIssuesPage(1);
    },
    onSuccess: (data) => {
      setActiveRunId(data.runId);
    },
    onError: (err) => {
      setError(parseApiError(err));
    },
  });

  const handleSubmit = (config: ReconciliationFormValues) => {
    startMutation.mutate(config);
  };

  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Reconciliation Dashboard
        </h2>
        <p className="mt-2 text-slate-400">
          Upload user and exchange transaction CSVs, configure tolerances, and
          review match results with downloadable reports.
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <ErrorAlert error={error} onDismiss={() => setError(null)} />
        )}
      </AnimatePresence>

      <ReconciliationForm
        files={files}
        onFilesChange={setFiles}
        onSubmit={handleSubmit}
        isSubmitting={startMutation.isPending || Boolean(activeRunId && isProcessing)}
        isUploading={startMutation.isPending}
      />

      {activeRunId && (
        <div className="space-y-8">
          <ReconciliationProgress runId={activeRunId} status={status ?? 'running'} />

          {pollQuery.isError && (
            <ErrorAlert
              error={parseApiError(pollQuery.error)}
              onDismiss={() => pollQuery.refetch()}
            />
          )}

          {isFailed && (
            <ErrorAlert
              error={{
                kind: 'server',
                message:
                  'Reconciliation failed. Check server logs or try again with different files.',
              }}
            />
          )}

          {isCompleted && statusData?.summary && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-display text-xl font-semibold text-white">
                  Results Summary
                </h3>
                <div className="flex flex-wrap gap-3">
                  <ReportDownloadButton
                    runId={activeRunId}
                    onError={(msg) => setDownloadError(msg)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowIssues((v) => !v);
                      setIssuesPage(1);
                    }}
                    className="btn-secondary"
                  >
                    {showIssues ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Issues
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        View Data Quality Issues
                      </>
                    )}
                  </button>
                </div>
              </div>

              {downloadError && (
                <p className="text-sm text-danger" role="alert">
                  {downloadError}
                </p>
              )}

              <SummaryCards summary={statusData.summary} />
            </motion.section>
          )}

          {showIssues && isCompleted && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="font-display text-xl font-semibold text-white">
                Data Quality Issues
              </h3>
              <IssuesTable
                items={issuesQuery.data?.items ?? []}
                page={issuesPage}
                limit={ISSUES_PAGE_SIZE}
                total={issuesQuery.data?.total ?? 0}
                onPageChange={setIssuesPage}
                isLoading={issuesQuery.isFetching}
              />
            </motion.section>
          )}
        </div>
      )}
    </div>
  );
}
