import { motion } from 'framer-motion';
import { Activity, Github } from 'lucide-react';
import { getApiBaseUrl } from '@/services/api';

export function Navbar() {
  const apiUrl = getApiBaseUrl();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/30">
            <Activity className="h-5 w-5 text-accent" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
              Reconciliation Engine
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Cross-source transaction matching
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {apiUrl && (
            <span
              className="hidden max-w-[220px] truncate rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 lg:inline-block"
              title={apiUrl}
            >
              {apiUrl.replace(/^https?:\/\//, '')}
            </span>
          )}
          <a
            href="https://transaction-reconciliation-engine-fna4.onrender.com/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-accent/30 hover:text-white"
          >
            <Github className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">API Docs</span>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
