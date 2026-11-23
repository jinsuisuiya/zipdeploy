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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-repo-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </span>
            <div>
              <h2 id="create-repo-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                一键新建 GitHub 仓库
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                调用当前 Token 直接在你的 GitHub 账号下创建空仓库
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {createdSuccessName && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-lg p-3 text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                仓库 <code className="font-mono font-semibold">{createdSuccessName}</code> 已成功创建并同步至配置区！
              </span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3 text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-medium text-neutral-700 dark:text-neutral-300 block">
              新仓库名称 (Repository Name)
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="例如 my-awesome-site"
              className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 font-mono text-xs focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-neutral-700 dark:text-neutral-300 block">
              仓库简介 (可选)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简短描述项目用途..."
              className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <span className="font-medium text-neutral-700 dark:text-neutral-300 block">
              可见性权限
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-lg border text-left transition-all space-y-1 ${
                  !isPrivate
                    ? 'border-neutral-900 dark:border-white bg-neutral-900/5 dark:bg-white/10'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
                  <Globe className="w-3.5 h-3.5" />
                  <span>公开 (Public)</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  可免费托管 GitHub Pages 网页
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-lg border text-left transition-all space-y-1 ${
                  isPrivate
                    ? 'border-neutral-900 dark:border-white bg-neutral-900/5 dark:bg-white/10'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
                  <Lock className="w-3.5 h-3.5" />
                  <span>私有 (Private)</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  仅自己与授权协作者可见
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50/80 dark:bg-[#111113] border-t border-neutral-200/80 dark:border-neutral-800 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
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
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-white dark:bg-[#141416] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:border-neutral-900 dark:hover:border-neutral-400 transition-colors disabled:opacity-40"
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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity disabled:opacity-40"
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
