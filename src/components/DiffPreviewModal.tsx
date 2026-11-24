import React, { useState, useEffect, useMemo } from 'react';
import {
  GitCompareArrows,
  X,
  RefreshCw,
  AlertTriangle,
  Search,
  Plus,
  FileEdit,
  Trash2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { formatFileSize, type DiffPreviewResult } from '../utils/deployHelpers';

interface DiffPreviewModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  result: DiffPreviewResult | null;
  onRefresh: () => void;
  onConfirmPush: () => void;
}

type DiffFilter = 'all' | 'added' | 'modified' | 'deleted';

export const DiffPreviewModal: React.FC<DiffPreviewModalProps> = ({
  open,
  onClose,
  isLoading,
  error,
  result,
  onRefresh,
  onConfirmPush
}) => {
  const [filter, setFilter] = useState<DiffFilter>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setFilter('all');
    setQuery('');
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const combinedEntries = useMemo(() => {
    if (!result) return [];
    const list =
      filter === 'added'
        ? result.added
        : filter === 'modified'
        ? result.modified
        : filter === 'deleted'
        ? result.deleted
        : [...result.added, ...result.modified, ...result.deleted];

    if (!query.trim()) return list;
    const lower = query.toLowerCase();
    return list.filter((item) => item.path.toLowerCase().includes(lower));
  }, [result, filter, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[86vh] bg-white dark:bg-[#17181C] border border-black/[0.05] dark:border-white/[0.08] rounded-[24px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
              <GitCompareArrows className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 id="diff-modal-title" className="text-sm font-semibold text-[#141414] dark:text-white truncate">
                推送前变更差异清单 (Diff)
              </h2>
              <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {result ? result.targetLabel : '基于远端 Git Tree 与本地 SHA-1 指纹逐一比对'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors disabled:opacity-50"
              title="重新比对远端差异"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors"
              aria-label="关闭差异预览"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-14 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col items-center gap-2.5">
              <RefreshCw className="w-5 h-5 animate-spin text-[#141414] dark:text-white" />
              <span>正在拉取远端目录树并计算本地 SHA-1 变更差异...</span>
            </div>
          ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">无法生成变更差异清单</div>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Context note */}
              <div className="bg-[#F2F3F5] dark:bg-[#23252C] rounded-2xl px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {result.isNewRepoOrBranch
                      ? '远端分支尚未初始化，本次将全新写入所有文件'
                      : result.forcePush && !result.targetSubdir
                      ? '强制覆写模式：远端未包含在本次文件包中的旧文件将被清理'
                      : result.targetSubdir
                      ? `子目录模式 (${result.targetSubdir}/)：安全保留仓库其余目录现有文件`
                      : '增量合并模式：仅新增或更新本次文件包内容，保留远端其余旧文件'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                  未变动将跳过 {result.unchangedCount} 个文件
                </span>
              </div>

              {/* Filter Tabs + Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-[#F2F3F5] dark:bg-[#23252C] rounded-full overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 tabular-nums ${
                      filter === 'all'
                        ? 'bg-[#141414] dark:bg-white text-white dark:text-[#141414]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-white'
                    }`}
                  >
                    全部 ({result.added.length + result.modified.length + result.deleted.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('added')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 tabular-nums ${
                      filter === 'added'
                        ? 'bg-[#141414] dark:bg-white text-white dark:text-[#141414]'
                        : 'text-emerald-700 dark:text-emerald-400 hover:bg-white/60 dark:hover:bg-white/5'
                    }`}
                  >
                    + 新增 {result.added.length}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('modified')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 tabular-nums ${
                      filter === 'modified'
                        ? 'bg-[#141414] dark:bg-white text-white dark:text-[#141414]'
                        : 'text-amber-700 dark:text-amber-400 hover:bg-white/60 dark:hover:bg-white/5'
                    }`}
                  >
                    ~ 修改 {result.modified.length}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('deleted')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 tabular-nums ${
                      filter === 'deleted'
                        ? 'bg-[#141414] dark:bg-white text-white dark:text-[#141414]'
                        : 'text-rose-700 dark:text-rose-400 hover:bg-white/60 dark:hover:bg-white/5'
                    }`}
                  >
                    - 将删除 {result.deleted.length}
                  </button>
                </div>

                <div className="relative flex items-center sm:w-56">
                  <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center absolute left-1 pointer-events-none">
                    <Search className="w-3 h-3" />
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="过滤路径..."
                    className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full pl-10 pr-3.5 py-1.5 text-xs text-[#141414] dark:text-white placeholder:text-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Diff List */}
              {combinedEntries.length > 0 ? (
                <div className="border border-black/[0.06] dark:border-white/[0.07] rounded-2xl divide-y divide-black/[0.04] dark:divide-white/[0.05] max-h-72 overflow-y-auto bg-[#F2F3F5] dark:bg-[#23252C]">
                  {combinedEntries.slice(0, 300).map((entry, idx) => (
                    <div
                      key={`${entry.status}-${entry.path}-${idx}`}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {entry.status === 'added' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold shrink-0 font-sans">
                            <Plus className="w-3.5 h-3.5" />
                            <span>新增</span>
                          </span>
                        ) : entry.status === 'modified' ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold shrink-0 font-sans">
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>修改</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold shrink-0 font-sans">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>将删</span>
                          </span>
                        )}
                        <span
                          className={`truncate ${
                            entry.status === 'deleted'
                              ? 'line-through text-rose-700/80 dark:text-rose-300/80'
                              : 'text-[#141414] dark:text-zinc-100'
                          }`}
                        >
                          {entry.path}
                        </span>
                      </div>

                      {entry.localSize !== undefined && (
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0 tabular-nums">
                          {formatFileSize(entry.localSize)}
                        </span>
                      )}
                    </div>
                  ))}
                  {combinedEntries.length > 300 && (
                    <div className="px-4 py-2.5 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                      还有 {combinedEntries.length - 300} 条变更未展示，可通过右上角搜索过滤查看
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-[#F2F3F5] dark:bg-[#23252C] rounded-2xl">
                  {result.added.length === 0 && result.modified.length === 0 && result.deleted.length === 0
                    ? '本地文件与远端仓库完全一致，没有任何文件变更需要推送！'
                    : '没有符合搜索条件的变更项'}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F2F3F5] dark:bg-[#111216] border-t border-black/[0.05] dark:border-white/[0.06] flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#141414] dark:text-zinc-200 bg-white dark:bg-[#17181C] border border-black/[0.06] dark:border-white/[0.08] hover:shadow-sm transition-all"
          >
            返回工作台
          </button>
          {result && !isLoading && !error && (
            <button
              type="button"
              onClick={onConfirmPush}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity"
            >
              <span>确认无误，安全检测并推送</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
