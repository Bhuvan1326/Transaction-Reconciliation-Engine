import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { downloadReport } from '@/services/reconciliation.service';
import { parseApiError } from '@/utils/errors';

interface ReportDownloadButtonProps {
  runId: string;
  disabled?: boolean;
  onError?: (message: string) => void;
}

export function ReportDownloadButton({
  runId,
  disabled = false,
  onError,
}: ReportDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await downloadReport(runId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reconciliation-report-${runId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const parsed = parseApiError(err);
      onError?.(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || loading}
      className="btn-secondary"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Download CSV Report
    </button>
  );
}
