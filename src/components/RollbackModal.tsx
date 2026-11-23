import React, { useState } from 'react';
import { History, X, RefreshCw, RotateCcw, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { CommitHistoryItem } from '../utils/deployHelpers';

interface RollbackModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  repo: string;
  branch: string;
  commits: CommitHistoryItem[];
  isLoading: boolean;
  error: string | null;
  isRollingBack: boolean;
  rollbackSuccessSha: string | null;
  onRefresh: () => void;
  onRollbackToSha: (sha: string) => void;
}

export const RollbackModal: React.FC<RollbackModalProps> = ({
  open,
  onClose,
  username,
  repo,
  branch,
  commits,
  isLoading,
  error,
  isRollingBack,
  rollbackSuccessSha,
  onRefresh,
  onRollbackToSha
}) => {
  const [confirmSha, setConfirmSha] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rollback-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center">
              <History className="w-4 h-4" />
            </span>
            <div>
              <h2 id="rollback-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                版本历史与一键回滚
              </h2>
              <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                {username}/{repo} · 分支 {branch || 'main'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              title="刷新提交历史"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {rollbackSuccessSha && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-lg p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                已成功将分支 <code className="font-mono font-semibold">{branch}</code> 回滚至提交{' '}
                <code className="font-mono font-semibold">{rollbackSuccessSha.slice(0, 7)}</code>！
              </span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-xs text-neutral-500 dark:text-neutral-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>正在拉取最近提交记录...</span>
            </div>
          ) : commits.length > 0 ? (
            <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200/70 dark:divide-neutral-800/80">
              {commits.map((commit, idx) => {
                const isCurrentHead = idx === 0;
                const isConfirming = confirmSha === commit.sha;
                return (
                  <div
                    key={commit.sha}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 dark:hover:bg-[#18181B] transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <a
                          href={commit.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{commit.sha.slice(0, 7)}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        {isCurrentHead && (
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            · 当前最新
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                          · {commit.authorName} · {new Date(commit.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 truncate">
                        {commit.message}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isCurrentHead ? (
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 px-2">
                          当前版本
                        </span>
                      ) : isConfirming ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setConfirmSha(null)}
                            disabled={isRollingBack}
                            className="px-2.5 py-1.5 rounded-md text-[11px] font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            disabled={isRollingBack}
                            onClick={() => {
                              onRollbackToSha(commit.sha);
                              setConfirmSha(null);
                            }}
                            className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50"
                          >
                            {isRollingBack ? '回滚中...' : '确认强制回滚'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmSha(commit.sha)}
                          disabled={isRollingBack}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-colors whitespace-nowrap"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>回滚到此版本</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !error && (
              <div className="py-10 text-center text-xs text-neutral-400 dark:text-neutral-500">
                暂无可回滚的提交记录
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
