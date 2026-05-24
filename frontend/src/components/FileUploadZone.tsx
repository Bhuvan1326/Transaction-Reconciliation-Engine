import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, Upload, X, AlertCircle } from 'lucide-react';
import { validateCsvFile } from '@/utils/fileValidation';

interface FileUploadZoneProps {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
}

export function FileUploadZone({
  id,
  label,
  hint,
  file,
  onFileChange,
  disabled = false,
  error: externalError,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const displayError = externalError ?? localError;

  const handleFile = useCallback(
    (selected: File | null) => {
      setLocalError(undefined);
      if (!selected) {
        onFileChange(null);
        return;
      }
      const result = validateCsvFile(selected);
      if (!result.valid) {
        setLocalError(result.error);
        onFileChange(null);
        return;
      }
      onFileChange(selected);
    },
    [onFileChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [disabled, handleFile]
  );

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        whileHover={disabled ? undefined : { scale: 1.005 }}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-colors
          ${dragOver ? 'border-accent bg-accent/5' : 'border-white/10 bg-white/[0.02]'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-accent/40 hover:bg-white/[0.04]'}
          ${displayError ? 'border-danger/50' : ''}
        `}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
        aria-disabled={disabled}
        aria-describedby={`${id}-hint ${displayError ? `${id}-error` : ''}`}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10">
                <FileSpreadsheet className="h-6 w-6 text-success" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-3 py-2 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Upload className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Drag & drop or click to upload
                </p>
                <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
                  {hint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {displayError && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-sm text-danger"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {displayError}
        </p>
      )}
    </div>
  );
}
