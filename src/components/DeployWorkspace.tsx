import React, { useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  FileText,
  User,
  Github,
  Mail,
  GitBranch,
  Trash2,
  FileArchive,
  Play,
  RefreshCw,
  XCircle,
  FolderTree,
  Upload,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Zap,
  ShieldAlert,
  Wrench,
  LifeBuoy,
  Search,
  FolderInput,
  History,
  Bookmark,
  Plus,
  Activity,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';
import type { ExtractedFile, UploadLog, ErrorDiagnostics } from '../data/knowledgeBase';
import type { QuickDrawerTab } from './QuickDrawer';
import type {
  WorkspaceProfile,
  TokenCheckResult,
  ActionRunInfo
} from '../utils/deployHelpers';

interface DeployWorkspaceProps {
  // Config props
  token: string;
  setToken: (v: string) => void;
  showToken: boolean;
  setShowToken: (v: boolean) => void;
  username: string;
  setUsername: (v: string) => void;
  repo: string;
  setRepo: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
  targetSubdir: string;
  setTargetSubdir: (v: string) => void;
  commitMessage: string;
  setCommitMessage: (v: string) => void;
  forcePush: boolean;
  setForcePush: (v: boolean) => void;
  autoInjectPagesAction: boolean;
  setAutoInjectPagesAction: (v: boolean) => void;
  saveLocally: boolean;
  setSaveLocally: (v: boolean) => void;
  onClearSaved: () => void;

  // Workspace Profiles
  profiles: WorkspaceProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;

  // Token & Rate-limit Check
  isCheckingToken: boolean;
  tokenCheckResult: TokenCheckResult | null;
  onCheckToken: () => void;

  // Rollback & Create Repo
  onOpenRollback: () => void;
  onOpenCreateRepo: () => void;

  // Zip & Extraction props
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  zipFile: File | null;
  extractedFiles: ExtractedFile[];
  isUnzipping: boolean;
  unzipError: string | null;
  fileSearch: string;
  setFileSearch: (v: string) => void;
  visibleFileCount: number;
  setVisibleFileCount: React.Dispatch<React.SetStateAction<number>>;
  ignoreNodeModules: boolean;
  filterStats: { junkCount: number; nodeModulesCount: number };
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onGenerateSampleZip: () => void;
  onToggleNodeModules: (skip: boolean) => void;
  onPreviewFile: (file: ExtractedFile) => void;

  // Upload & Diagnostics props
  isUploading: boolean;
  uploadProgress: number;
  currentStepText: string;
  logs: UploadLog[];
  uploadSuccess: boolean;
  uploadError: string | null;
  errorDiagnostics: ErrorDiagnostics | null;
  pagesStatus: string | null;
  isTriggeringPages: boolean;
  onUploadToGithub: () => void;
  onTriggerPagesAutoSetup: () => void;

  // Live Actions Status Tracker
  latestActionRun: ActionRunInfo | null;
  isPollingActions: boolean;
  onRefreshActionRun: () => void;

  // Drawer helper
  onOpenQuickDrawer: (tab: Exclude<QuickDrawerTab, null>, query?: string) => void;
}

export const DeployWorkspace: React.FC<DeployWorkspaceProps> = ({
  token,
  setToken,
  showToken,
  setShowToken,
  username,
  setUsername,
  repo,
  setRepo,
  email,
  setEmail,
  branch,
  setBranch,
  targetSubdir,
  setTargetSubdir,
  commitMessage,
  setCommitMessage,
  forcePush,
  setForcePush,
  autoInjectPagesAction,
  setAutoInjectPagesAction,
  saveLocally,
  setSaveLocally,
  onClearSaved,
  profiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
  isCheckingToken,
  tokenCheckResult,
  onCheckToken,
  onOpenRollback,
  onOpenCreateRepo,
  fileInputRef,
  zipFile,
  extractedFiles,
  isUnzipping,
  unzipError,
  fileSearch,
  setFileSearch,
  visibleFileCount,
  setVisibleFileCount,
  ignoreNodeModules,
  filterStats,
  onFileChange,
  onDrop,
  onGenerateSampleZip,
  onToggleNodeModules,
  onPreviewFile,
  isUploading,
  uploadProgress,
  currentStepText,
  logs,
  uploadSuccess,
  uploadError,
  errorDiagnostics,
  pagesStatus,
  isTriggeringPages,
  onUploadToGithub,
  onTriggerPagesAutoSetup,
  latestActionRun,
  isPollingActions,
  onRefreshActionRun,
  onOpenQuickDrawer
}) => {
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const filteredFiles = extractedFiles.filter((f) =>
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const cleanSubdirPreview = targetSubdir.trim().replace(/^\/+|\/+$/g, '');

  const handleConfirmSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newProfileName.trim();
    if (!trimmed) return;
    onSaveProfile(trimmed);
    setNewProfileName('');
    setIsAddingProfile(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Left Column: Repository Parameter Configuration */}
      <section className="xl:col-span-5 bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200/70 dark:border-neutral-800/80 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              仓库参数配置
            </h2>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              REST API 直连 · 凭证仅留存本地浏览器
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenRollback}
              className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap"
              title="查看历史提交并一键回滚"
            >
              <History className="w-3.5 h-3.5" />
              <span>版本回滚</span>
            </button>
            <button
              type="button"
              onClick={onClearSaved}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap"
              title="清空已保存的表单配置"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>

        {/* Workspace Profiles Bar */}
        <div className="px-6 py-3 bg-neutral-50/70 dark:bg-[#111113] border-b border-neutral-200/70 dark:border-neutral-800/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Bookmark className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <select
                value={activeProfileId}
                onChange={(e) => onSelectProfile(e.target.value)}
                aria-label="选择项目配置预设"
                className="flex-1 min-w-0 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-md px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400 transition-colors"
              >
                <option value="">当前临时配置（未选择预设）</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.username}/{p.repo})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddingProfile(!isAddingProfile)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-neutral-500 transition-colors whitespace-nowrap"
                title="将当前仓库、分支与子目录保存为快速预设"
              >
                <Plus className="w-3 h-3" />
                <span>存为预设</span>
              </button>
              {activeProfileId && (
                <button
                  type="button"
                  onClick={() => onDeleteProfile(activeProfileId)}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-[#141416] transition-colors"
                  title="删除当前选中的预设"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {isAddingProfile && (
            <form onSubmit={handleConfirmSaveProfile} className="flex items-center gap-2 pt-0.5">
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="输入预设名称（如：个人主站 / 测试页）"
                className="flex-1 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 whitespace-nowrap"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setIsAddingProfile(false)}
                className="px-2.5 py-1.5 rounded-md text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 whitespace-nowrap"
              >
                取消
              </button>
            </form>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* PAT Token + Permission & Rate Limit Check */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>GitHub Access Token (PAT)</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCheckToken}
                  disabled={isCheckingToken || !token.trim()}
                  className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2 transition-colors whitespace-nowrap disabled:opacity-40"
                >
                  {isCheckingToken ? '检测中...' : '检测权限与额度'}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenQuickDrawer('guide')}
                  className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline underline-offset-2 transition-colors whitespace-nowrap"
                >
                  获取教程
                </button>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showToken ? '隐藏' : '显示'}</span>
                </button>
              </div>
            </div>
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="在此粘贴 ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-mono text-xs focus:outline-none transition-colors"
            />

            {/* Token Check Result */}
            {tokenCheckResult && (
              <div
                className={`mt-1.5 px-3 py-2 rounded-lg text-[11px] flex items-start gap-2 border ${
                  tokenCheckResult.status === 'ok'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                    : tokenCheckResult.status === 'warning'
                    ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                }`}
              >
                {tokenCheckResult.status === 'ok' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : tokenCheckResult.status === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 min-w-0">
                  <div className="font-medium">{tokenCheckResult.message}</div>
                  {(tokenCheckResult.scopes !== undefined || tokenCheckResult.rateRemaining !== undefined) && (
                    <div className="font-mono text-[10px] opacity-85 tabular-nums">
                      {tokenCheckResult.login && `@${tokenCheckResult.login} · `}
                      {tokenCheckResult.scopes ? `Scopes: ${tokenCheckResult.scopes}` : 'Fine-grained / 无 Classic Scopes 头'}
                      {tokenCheckResult.rateRemaining !== undefined &&
                        ` · 剩余额度 ${tokenCheckResult.rateRemaining}/${tokenCheckResult.rateLimit}`}
                    </div>
                  )}
                  {tokenCheckResult.repoNotFound && (
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={onOpenCreateRepo}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-900 dark:bg-amber-200 text-white dark:text-amber-950 hover:opacity-90 transition-opacity"
                      >
                        <FolderPlus className="w-3 h-3" />
                        <span>一键在 GitHub 新建此仓库</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Username & Repo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>GitHub 用户名</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span>仓库名 (Repo)</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenCreateRepo}
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2 transition-colors whitespace-nowrap"
                >
                  + 一键新建
                </button>
              </div>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="your-repository"
                className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>提交邮箱</span>
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>目标分支</span>
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Target Subdirectory (Subfolder Deploy) & Commit Message */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <FolderInput className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>部署子目录 (可选)</span>
              </label>
              <input
                type="text"
                value={targetSubdir}
                onChange={(e) => setTargetSubdir(e.target.value)}
                placeholder="留空即根目录，如 docs"
                className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>Commit 提交描述</span>
              </label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="提交信息"
                className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 focus:bg-white dark:focus:bg-[#141416] rounded-lg px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>

          {cleanSubdirPreview && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-[#0D0D0F] border border-neutral-200/70 dark:border-neutral-800 rounded-lg px-3 py-2">
              子目录模式已激活：本次解压文件将部署至{' '}
              <code className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                {cleanSubdirPreview}/
              </code>{' '}
              下，并安全保留仓库其他目录现有文件。
            </p>
          )}
        </div>

        {/* Deployment Flags */}
        <div className="px-6 py-4 bg-neutral-50/60 dark:bg-[#111113] border-t border-neutral-200/70 dark:border-neutral-800/80 space-y-3 text-xs">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forcePush}
              onChange={(e) => setForcePush(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-neutral-900 dark:accent-white rounded border-neutral-300 dark:border-neutral-700 shrink-0"
            />
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                强制清空重置远端仓库 (--force overwrite)
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {cleanSubdirPreview
                  ? `子目录模式下将保留非 ${cleanSubdirPreview}/ 文件，强制刷新分支提交`
                  : forcePush
                  ? '彻底清洗远端历史多余文件，以本次解压代码为准'
                  : '增量合并：保留远端已有旧文件'}
              </span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={autoInjectPagesAction}
              onChange={(e) => setAutoInjectPagesAction(e.target.checked)}
              className="w-4 h-4 accent-neutral-900 dark:accent-white rounded border-neutral-300 dark:border-neutral-700 shrink-0"
            />
            <span>自动注入 Pages 自动编译工作流 (.yml)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none text-neutral-500 dark:text-neutral-400">
            <input
              type="checkbox"
              checked={saveLocally}
              onChange={(e) => setSaveLocally(e.target.checked)}
              className="w-4 h-4 accent-neutral-900 dark:accent-white rounded border-neutral-300 dark:border-neutral-700 shrink-0"
            />
            <span>记住配置（仅保存在当前浏览器）</span>
          </label>
        </div>
      </section>

      {/* Right Column: ZIP Dropzone, File Tree, Progress & Logs */}
      <section className="xl:col-span-7 space-y-5">
        {/* Drag & Drop File Select Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-400 rounded-xl text-center bg-[#FFFFFF] dark:bg-[#141416] hover:bg-neutral-50/70 dark:hover:bg-[#18181B] cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.03)] group ${
            extractedFiles.length > 0 ? 'p-6' : 'px-6 py-12'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={onFileChange}
            className="hidden"
          />

          <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 group-hover:bg-neutral-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-neutral-900 flex items-center justify-center mx-auto text-neutral-700 dark:text-neutral-300 transition-colors duration-150">
            <FileArchive className="w-5 h-5" />
          </div>

          <div className="mt-3.5 space-y-1">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              {zipFile ? zipFile.name : '点击或拖拽上传你的 .zip 格式压缩包'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {zipFile ? (
                <span className="font-mono tabular-nums">
                  压缩包体积 {(zipFile.size / 1024).toFixed(1)} KB · 点击此处可重新选择其他压缩包
                </span>
              ) : (
                '在浏览器内存中秒速解压、剥离嵌套目录，5 路并发无损直推 GitHub'
              )}
            </p>
          </div>

          {!zipFile && !isUnzipping && (
            <div className="pt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateSampleZip();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>无 ZIP？点击生成测试示范包 (Demo)</span>
              </button>
            </div>
          )}

          {isUnzipping && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1.5 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>正在内存中解压分析 ZIP 结构...</span>
            </div>
          )}
        </div>

        {/* Unzip Error */}
        {unzipError && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-200">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{unzipError}</span>
          </div>
        )}

        {/* Empty State Hint */}
        {extractedFiles.length === 0 && !isUnzipping && (
          <div className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-neutral-200/70 dark:border-neutral-800/80">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                上传后将自动执行以下工作流
              </span>
              <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                5x Concurrent Pipeline
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">01 / 解压与体检</span>
                <p className="leading-relaxed">自动过滤元数据并支持点击文件树即时预览源码与图片，推送前自动扫描敏感密钥。</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">02 / 并发与复用</span>
                <p className="leading-relaxed">SHA-1 比对跳过未修改文件，其余文件通过 5 路受控并发队列高速无损传输。</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">03 / 追踪与回滚</span>
                <p className="leading-relaxed">工作台内实时追踪 GitHub Actions 打包状态，随时支持版本历史回滚。</p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted File Tree & Deployment Control Card */}
        {extractedFiles.length > 0 && (
          <div className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Header & Primary Action */}
            <div className="px-6 py-4 border-b border-neutral-200/70 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  <span>已解析解压目录</span>
                  <span className="font-mono text-xs font-normal text-neutral-500 dark:text-neutral-400 tabular-nums">
                    ({extractedFiles.length} 个文件)
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  点击列表任意文件可即时预览 · 目标 {username}/{repo} ({branch})
                  {cleanSubdirPreview ? `/${cleanSubdirPreview}` : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={onUploadToGithub}
                disabled={isUploading}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isUploading
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-900 dark:bg-white hover:opacity-90 text-white dark:text-neutral-900 shadow-sm'
                }`}
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isUploading ? '正在并发同步...' : '安全检测并推送到 GitHub'}</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Filter Status & node_modules toggle */}
              <div className="bg-neutral-50 dark:bg-[#0D0D0F] border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-3.5 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      保留全部代码与隐藏配置 (
                      <code className="font-mono">.gitignore</code>, <code className="font-mono">.env</code>,{' '}
                      <code className="font-mono">.github</code>)
                    </span>
                  </div>

                  {filterStats.nodeModulesCount > 0 && (
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-white dark:bg-[#141416] px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium hover:border-neutral-900 dark:hover:border-neutral-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={ignoreNodeModules}
                        onChange={(e) => onToggleNodeModules(e.target.checked)}
                        className="accent-neutral-900 dark:accent-white w-3.5 h-3.5 rounded"
                      />
                      <span className="tabular-nums">跳过 node_modules ({filterStats.nodeModulesCount})</span>
                    </label>
                  )}
                </div>

                {(filterStats.junkCount > 0 || filterStats.nodeModulesCount > 0) && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {filterStats.junkCount > 0 &&
                      `已净化屏蔽 ${filterStats.junkCount} 个系统元数据 (.DS_Store / __MACOSX / .git)`}
                    {filterStats.junkCount > 0 && filterStats.nodeModulesCount > 0 && ignoreNodeModules && ' · '}
                    {filterStats.nodeModulesCount > 0 &&
                      ignoreNodeModules &&
                      `已跳过 ${filterStats.nodeModulesCount} 个依赖文件（取消勾选右侧开关可恢复）`}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between gap-4 text-xs font-mono text-neutral-600 dark:text-neutral-400 tabular-nums">
                    <span className="truncate">{currentStepText}</span>
                    <span className="shrink-0 font-semibold text-neutral-900 dark:text-neutral-100">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-900 dark:bg-white h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Banner + Live Actions Tracker */}
              {uploadSuccess && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>代码已成功推送！远端 GitHub 仓库已更新。</span>
                    </div>
                    <a
                      href={`https://github.com/${username}/${repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold hover:opacity-80 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <span>前往查看仓库</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Built-in Live GitHub Actions Status Tracker */}
                  <div className="bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100">
                        <Activity className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        <span>GitHub Actions 实时构建状态</span>
                      </div>
                      <button
                        type="button"
                        onClick={onRefreshActionRun}
                        className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${isPollingActions ? 'animate-spin' : ''}`} />
                        <span>{isPollingActions ? '轮询监测中' : '刷新状态'}</span>
                      </button>
                    </div>

                    {latestActionRun ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-neutral-200/70 dark:border-neutral-800/80">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                            <span>{latestActionRun.name}</span>
                            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                              ·{' '}
                              {latestActionRun.status === 'completed'
                                ? latestActionRun.conclusion === 'success'
                                  ? '构建成功 (Success)'
                                  : `构建结束 (${latestActionRun.conclusion || 'completed'})`
                                : latestActionRun.status === 'in_progress'
                                ? '云端打包构建中...'
                                : '排队等待执行中...'}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                            最近更新：{new Date(latestActionRun.updated_at).toLocaleTimeString()}
                          </p>
                        </div>

                        <a
                          href={latestActionRun.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:opacity-80 shrink-0"
                        >
                          <span>查看云端日志</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {isPollingActions
                          ? '正在查询最新的 GitHub Actions 工作流运行记录...'
                          : '暂未获取到最近的 Actions 构建记录，点击右上角「刷新状态」可手动获取。'}
                      </p>
                    )}
                  </div>

                  {/* Crucial Setup Guide for GitHub Pages */}
                  <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-5 text-xs text-amber-950 dark:text-amber-200 space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-200/70 dark:border-amber-900/50 pb-2.5">
                      <span className="font-semibold text-amber-900 dark:text-amber-100">
                        GitHub Pages 上线引导（新建仓库必看）
                      </span>
                      <span className="font-mono text-[11px] text-amber-700 dark:text-amber-300">
                        deploy-pages.yml
                      </span>
                    </div>

                    <p className="leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                      网页已为你自动注入云端构建工作流 <code className="font-mono">.github/workflows/deploy-pages.yml</code>。若是全新创建的仓库，可点击下方按钮自动触发或核对以下 3 步：
                    </p>

                    <div className="divide-y divide-amber-200/70 dark:divide-amber-900/50 border-y border-amber-200/70 dark:border-amber-900/50">
                      <div className="py-2.5 space-y-1">
                        <div className="font-semibold text-amber-950 dark:text-amber-100">
                          01. 将 Build Source 切换为 GitHub Actions
                        </div>
                        <p className="text-amber-900/85 dark:text-amber-200/85">
                          前往{' '}
                          <a
                            href={`https://github.com/${username}/${repo}/settings/pages`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-mono font-semibold"
                          >
                            Settings → Pages
                          </a>{' '}
                          将 Source 设为 <strong className="font-mono">GitHub Actions</strong>（切换即自动保存，无需找 Save 按钮）。
                        </p>
                      </div>

                      <div className="py-2.5 space-y-1">
                        <div className="font-semibold text-amber-950 dark:text-amber-100">
                          02. 开启 Actions 读写权限（防止 403）
                        </div>
                        <p className="text-amber-900/85 dark:text-amber-200/85">
                          前往{' '}
                          <a
                            href={`https://github.com/${username}/${repo}/settings/actions`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-mono font-semibold"
                          >
                            Settings → Actions → General
                          </a>{' '}
                          底部选中 <strong>Read and write permissions</strong> 并点击 Save。
                        </p>
                      </div>

                      <div className="py-2.5 space-y-1">
                        <div className="font-semibold text-amber-950 dark:text-amber-100">
                          03. 触发云端编译打包
                        </div>
                        <p className="text-amber-900/85 dark:text-amber-200/85">
                          前往{' '}
                          <a
                            href={`https://github.com/${username}/${repo}/actions`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-mono font-semibold"
                          >
                            Actions 标签页
                          </a>{' '}
                          运行工作流，约 1 分钟后即可访问在线站点。
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={onTriggerPagesAutoSetup}
                        disabled={isTriggeringPages}
                        className="inline-flex items-center gap-1.5 bg-amber-900 dark:bg-amber-200 hover:opacity-90 text-white dark:text-amber-950 font-semibold text-xs px-4 py-2 rounded-lg transition-opacity shrink-0 disabled:opacity-50"
                      >
                        {isTriggeringPages ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        <span>网页 API 一键开启 Pages & 启动 Actions</span>
                      </button>

                      <a
                        href={`https://${username}.github.io/${repo}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono font-semibold underline shrink-0"
                      >
                        <span>https://{username}.github.io/{repo}/</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {pagesStatus && (
                      <div className="bg-emerald-100/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{pagesStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Banner with Resumable Retry & Diagnostics */}
              {uploadError && (
                <div className="bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200 p-5 rounded-xl space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 border-b border-rose-200/70 dark:border-rose-900/50 pb-3.5">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-rose-900 dark:text-rose-100 text-sm">
                            {errorDiagnostics?.title || '部署传输中断'}
                          </span>
                          {errorDiagnostics?.code && (
                            <span className="font-mono text-[11px] text-rose-700 dark:text-rose-300">
                              · {errorDiagnostics.code}
                            </span>
                          )}
                        </div>
                        <p className="text-rose-800 dark:text-rose-200/90 leading-relaxed">
                          {errorDiagnostics?.reason || uploadError}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {errorDiagnostics?.code === 'ERR_REPO_404_NOT_FOUND' && (
                        <button
                          type="button"
                          onClick={onOpenCreateRepo}
                          className="inline-flex items-center gap-1.5 bg-neutral-900 dark:bg-white hover:opacity-90 text-white dark:text-neutral-900 font-semibold px-3.5 py-2 rounded-lg transition-opacity whitespace-nowrap"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>一键新建此仓库</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onUploadToGithub}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1.5 bg-rose-900 dark:bg-rose-200 hover:opacity-90 text-white dark:text-rose-950 font-semibold px-3.5 py-2 rounded-lg transition-opacity whitespace-nowrap disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>断点继续上传</span>
                      </button>
                    </div>
                  </div>

                  {errorDiagnostics?.steps && errorDiagnostics.steps.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-semibold flex items-center gap-1.5 text-xs text-rose-900 dark:text-rose-100">
                        <Wrench className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
                        <span>推荐排查步骤</span>
                      </div>
                      <ul className="space-y-1.5 text-xs">
                        {errorDiagnostics.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="font-mono font-semibold text-rose-700 dark:text-rose-300 shrink-0">
                              {idx + 1}.
                            </span>
                            <div className="flex-1">
                              <span>{step.text}</span>
                              {step.linkUrl && (
                                <a
                                  href={step.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1.5 font-semibold underline text-rose-900 dark:text-rose-100 hover:opacity-80 inline-flex items-center gap-0.5"
                                >
                                  <span>{step.linkText || '点击前往管理页'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t border-rose-200/70 dark:border-rose-900/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-rose-800 dark:text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <LifeBuoy className="w-3.5 h-3.5 shrink-0" />
                      <span>需要更多对照案例？</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenQuickDrawer('faq', errorDiagnostics?.code || '')}
                      className="font-semibold underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
                    >
                      在速查抽屉中查看排障百科 →
                    </button>
                  </div>
                </div>
              )}

              {/* File Search Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={(e) => {
                      setFileSearch(e.target.value);
                      setVisibleFileCount(100);
                    }}
                    placeholder="搜索解压出的文件路径..."
                    className="w-full bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200 dark:border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400 transition-colors"
                  />
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono tabular-nums whitespace-nowrap shrink-0">
                  {filteredFiles.length} / {extractedFiles.length} 项
                </span>
              </div>

              {/* File Tree List (Clickable for Instant Preview) */}
              <div className="bg-[#F8F8F7] dark:bg-[#0D0D0F] border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-2 max-h-60 overflow-y-auto font-mono text-xs divide-y divide-neutral-200/50 dark:divide-neutral-800/70">
                {filteredFiles.slice(0, visibleFileCount).map((file, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onPreviewFile(file)}
                    className="w-full py-1.5 px-2.5 flex items-center justify-between hover:bg-white dark:hover:bg-[#141416] rounded-md transition-colors text-left group"
                    title="点击即时预览此文件内容"
                  >
                    <span className="truncate pr-4 text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-950 dark:group-hover:text-white">
                      {cleanSubdirPreview ? `${cleanSubdirPreview}/${file.path}` : file.path}
                    </span>
                    <span className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                        预览
                      </span>
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </span>
                  </button>
                ))}

                {filteredFiles.length > visibleFileCount && (
                  <div className="py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleFileCount((prev) => prev + 300)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-700 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <span className="tabular-nums">
                        显示更多文件 (已载入 {visibleFileCount} / 剩余 {filteredFiles.length - visibleFileCount} 项)
                      </span>
                    </button>
                  </div>
                )}

                {filteredFiles.length === 0 && (
                  <div className="py-6 text-center text-neutral-400 dark:text-neutral-500 text-xs">
                    未找到符合条件的文件
                  </div>
                )}
              </div>

              {/* Activity Log */}
              {logs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      交互执行日志
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                      {logs.length} 条记录
                    </span>
                  </div>
                  <div className="bg-[#111113] dark:bg-[#09090B] border border-neutral-800 text-neutral-200 p-4 rounded-lg font-mono text-[11px] max-h-44 overflow-y-auto space-y-1">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-2.5 leading-relaxed">
                        <span className="text-neutral-500 shrink-0 tabular-nums">[{log.time}]</span>
                        <span
                          className={
                            log.status === 'success'
                              ? 'text-emerald-400'
                              : log.status === 'error'
                              ? 'text-rose-400'
                              : 'text-neutral-300'
                          }
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
