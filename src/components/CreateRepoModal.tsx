import React, { useState, useEffect } from 'react';
import { FolderPlus, X, Lock, Globe, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CreateRepoModalProps {
  open: boolean;
  onClose: () => void;
  defaultRepoName: string;
  hasExtractedFiles: boolean;
  isCreating: boolean;
  error: string | null;
  createdSuccessName: string | null;
  onCreateRepo: (params: {
    name: string;
    description: string;
    isPrivate: boolean;
    autoPushAfterCreate: boolean;
  }) => void;
}

export const CreateRepoModal: React.FC<CreateRepoModalProps> = ({
  open,
  onClose,
  defaultRepoName,
  hasExtractedFiles,
  isCreating,
  error,
  createdSuccessName,
  onCreateRepo
}) => {
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (open) {
      const initial =
        defaultRepoName && defaultRepoName !== 'your-repository' ? defaultRepoName.trim() : '';
      setRepoName(initial);
      setDescription('');
      setIsPrivate(false);
    }
  }, [open, defaultRepoName]);

  if (!open) return null;

  const trimmedName = repoName.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-repo-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#17181C] border border-black/[0.05] dark:border-white/[0.08] rounded-[24px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
              <FolderPlus className="w-4 h-4" />
            </span>
            <div>
              <h2 id="create-repo-title" className="text-sm font-semibold text-[#141414] dark:text-white">
                一键新建 GitHub 仓库
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                调用当前 Token 直接在你的 GitHub 账号下创建空仓库
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {createdSuccessName && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-3 text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                仓库 <code className="font-mono font-semibold">{createdSuccessName}</code> 已成功创建并同步至配置区！
              </span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-3 text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-medium text-[#141414] dark:text-zinc-200 block">
              新仓库名称 (Repository Name)
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="例如 my-awesome-site"
              className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-2.5 text-[#141414] dark:text-white font-mono text-xs focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-[#141414] dark:text-zinc-200 block">
              仓库简介 (可选)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简短描述项目用途..."
              className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-2.5 text-[#141414] dark:text-white text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <span className="font-medium text-[#141414] dark:text-zinc-200 block">
              可见性权限
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                  !isPrivate
                    ? 'border-[#141414] dark:border-white bg-[#F2F3F5] dark:bg-[#23252C]'
                    : 'border-black/[0.06] dark:border-white/[0.07] hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[#141414] dark:text-white">
                  <Globe className="w-3.5 h-3.5" />
                  <span>公开 (Public)</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  可免费托管 GitHub Pages 网页
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                  isPrivate
                    ? 'border-[#141414] dark:border-white bg-[#F2F3F5] dark:bg-[#23252C]'
                    : 'border-black/[0.06] dark:border-white/[0.07] hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[#141414] dark:text-white">
                  <Lock className="w-3.5 h-3.5" />
                  <span>私有 (Private)</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  仅自己与授权协作者可见
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F2F3F5] dark:bg-[#111216] border-t border-black/[0.05] dark:border-white/[0.06] flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
          >
            关闭
          </button>

          <button
            type="button"
            disabled={isCreating || !trimmedName}
            onClick={() =>
              onCreateRepo({
                name: trimmedName,
                description: description.trim(),
                isPrivate,
                autoPushAfterCreate: false
              })
            }
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-[#17181C] border border-black/[0.08] dark:border-white/[0.09] text-[#141414] dark:text-white hover:shadow-sm transition-all disabled:opacity-40"
          >
            {isCreating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>仅创建仓库</span>
          </button>

          {hasExtractedFiles && (
            <button
              type="button"
              disabled={isCreating || !trimmedName}
              onClick={() =>
                onCreateRepo({
                  name: trimmedName,
                  description: description.trim(),
                  isPrivate,
                  autoPushAfterCreate: true
                })
              }
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isCreating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>创建并立即推送代码</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
