import React, { useState, useEffect } from 'react';
import {
  Clock,
  X,
  Search,
  ExternalLink,
  Trash2,
  ArrowUpRight,
  RotateCcw,
  FolderArchive
} from 'lucide-react';
import type { DeployHistoryRecord } from '../utils/deployHelpers';

interface DeployHistoryModalProps {
  open: boolean;
  onClose: () => void;
  records: DeployHistoryRecord[];
  onApplyConfig: (record: DeployHistoryRecord) => void;
  onClearHistory: () => void;
}

export const DeployHistoryModal: React.FC<DeployHistoryModalProps> = ({
  open,
  onClose,
  records,
  onApplyConfig,
  onClearHistory
}) => {
  const [query, setQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmClear(false);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = records.filter((item) => {
    if (!query.trim()) return true;
    const lower = query.toLowerCase();
    return (
      `${item.username}/${item.repo}`.toLowerCase().includes(lower) ||
      item.branch.toLowerCase().includes(lower) ||
      item.commitMessage.toLowerCase().includes(lower) ||
      item.sourceName.toLowerCase().includes(lower)
    );
  });

  const totalSyncedFiles = records.reduce((acc, r) => acc + r.totalFiles, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deploy-history-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[86vh] bg-white dark:bg-[#17181C] border border-black/[0.05] dark:border-white/[0.08] rounded-[24px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h2 id="deploy-history-title" className="text-sm font-semibold text-[#141414] dark:text-white">
                本地部署记录本
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                仅保存于当前浏览器本地 · 累计推送 {records.length} 次 · 共处理 {totalSyncedFiles} 个文件
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors"
            aria-label="关闭部署记录"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {records.length > 0 && (
            <div className="relative flex items-center">
              <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center absolute left-1 pointer-events-none">
                <Search className="w-3 h-3" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="按仓库名、分支、源文件名或提交描述筛选..."
                className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full pl-10 pr-4 py-2 text-xs text-[#141414] dark:text-white placeholder:text-zinc-400 focus:outline-none transition-colors"
              />
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="border border-black/[0.06] dark:border-white/[0.07] rounded-2xl divide-y divide-black/[0.05] dark:divide-white/[0.06] overflow-hidden">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <a
                        href={`https://github.com/${item.username}/${item.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-semibold text-[#141414] dark:text-white hover:underline inline-flex items-center gap-1"
                      >
                        <span>
                          {item.username}/{item.repo}
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        · {item.branch}
                        {item.targetSubdir ? `/${item.targetSubdir}` : ''}
                      </span>
                      <a
                        href={item.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-white underline underline-offset-2"
                      >
                        #{item.commitSha.slice(0, 7)}
                      </a>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                      {item.commitMessage}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                      <span>
                        {item.sourceKind === 'folder' ? '文件夹' : 'ZIP'}: {item.sourceName}
                      </span>
                      <span>·</span>
                      <span>
                        上传 {item.uploadedFiles} / 复用 {item.reusedFiles}
                      </span>
                      <span>·</span>
                      <span>耗时 {(item.durationMs / 1000).toFixed(1)}s</span>
                      <span>·</span>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyConfig(item);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#141414] dark:text-zinc-200 bg-[#F2F3F5] dark:bg-[#23252C] hover:bg-[#141414] hover:text-white dark:hover:bg-white dark:hover:text-[#141414] transition-colors whitespace-nowrap"
                      title="将该次记录的用户名、仓库、分支和子目录填入当前工作台"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>填入配置</span>
                    </button>

                    <a
                      href={`https://${item.username}.github.io/${item.repo}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-[#17181C] border border-black/[0.07] dark:border-white/[0.08] text-[#141414] dark:text-white hover:shadow-sm transition-all whitespace-nowrap"
                    >
                      <span>站点</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2.5">
              <FolderArchive className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-xs font-medium text-[#141414] dark:text-zinc-300">
                {records.length === 0 ? '暂无本地推送记录' : '未找到匹配的部署记录'}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {records.length === 0
                  ? '完成任意一次推送后，这里会自动在本地记录仓库、分支、耗时与提交详情。'
                  : '尝试清空搜索关键词查看所有历史推送。'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F2F3F5] dark:bg-[#111216] border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-3 shrink-0">
          <div>
            {records.length > 0 &&
              (confirmClear ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                  >
                    确认清空全部
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 rounded-full text-xs text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清空记录</span>
                </button>
              ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
