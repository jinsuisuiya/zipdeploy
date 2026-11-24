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
  FolderPlus,
  SlidersHorizontal,
  ChevronDown,
  FolderOpen,
  GitCompareArrows
} from 'lucide-react';
import type { ExtractedFile, UploadLog, ErrorDiagnostics } from '../data/knowledgeBase';
import type { QuickDrawerTab } from './QuickDrawer';
import {
  LARGE_FILE_WARN_BYTES,
  LARGE_FILE_CRITICAL_BYTES,
  formatFileSize,
  type WorkspaceProfile,
  type TokenCheckResult,
  type ActionRunInfo
} from '../utils/deployHelpers';

export interface SourcePackageInfo {
  name: string;
  totalSize: number;
  kind: 'zip' | 'folder';
}

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

  // Rollback & Create Repo & Diff Preview
  onOpenRollback: () => void;
  onOpenCreateRepo: () => void;
  onOpenDiffPreview: () => void;

  // Zip & Folder Extraction props
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  folderInputRef: React.RefObject<HTMLInputElement | null>;
  sourceInfo: SourcePackageInfo | null;
  extractedFiles: ExtractedFile[];
  excludedPaths: Set<string>;
  onToggleExcludeFile: (path: string) => void;
  onExcludeAllLargeFiles: () => void;
  onRestoreAllExcluded: () => void;
  isUnzipping: boolean;
  unzipError: string | null;
  fileSearch: string;
  setFileSearch: (v: string) => void;
  visibleFileCount: number;
  setVisibleFileCount: React.Dispatch<React.SetStateAction<number>>;
  ignoreNodeModules: boolean;
  filterStats: { junkCount: number; nodeModulesCount: number };
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFolderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onOpenDiffPreview,
  fileInputRef,
  folderInputRef,
  sourceInfo,
  extractedFiles,
  excludedPaths,
  onToggleExcludeFile,
  onExcludeAllLargeFiles,
  onRestoreAllExcluded,
  isUnzipping,
  unzipError,
  fileSearch,
  setFileSearch,
  visibleFileCount,
  setVisibleFileCount,
  ignoreNodeModules,
  filterStats,
  onFileChange,
  onFolderChange,
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
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  const filteredFiles = extractedFiles.filter((f) =>
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const activeFilesCount = extractedFiles.length - excludedPaths.size;
  const activeLargeFiles = extractedFiles.filter(
    (f) => f.size >= LARGE_FILE_WARN_BYTES && !excludedPaths.has(f.path)
  );
  const hasCriticalLargeFile = activeLargeFiles.some((f) => f.size >= LARGE_FILE_CRITICAL_BYTES);

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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start w-full min-w-0">
      {/* Left Column: Core Repository Config + Collapsible Advanced Options */}
      <section className="xl:col-span-5 min-w-0 bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-black/[0.05] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
              <Github className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#141414] dark:text-white truncate">
                仓库参数配置
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                REST API 直连 · 凭证仅留存本地浏览器
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenRollback}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-[#141414] dark:text-zinc-200 bg-[#F2F3F5] dark:bg-[#23252C] hover:bg-[#E5E7EB] dark:hover:bg-[#2E303A] transition-colors whitespace-nowrap"
              title="查看历史提交并一键回滚"
            >
              <History className="w-3 h-3" />
              <span>版本回滚</span>
            </button>
            <button
              type="button"
              onClick={onClearSaved}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors whitespace-nowrap"
              title="清空已保存的表单配置"
            >
              <Trash2 className="w-3 h-3" />
              <span>重置</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Workspace Profiles Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0 flex items-center">
                <Bookmark className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 absolute left-3.5 pointer-events-none" />
                <select
                  value={activeProfileId}
                  onChange={(e) => onSelectProfile(e.target.value)}
                  aria-label="选择项目配置预设"
                  className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full pl-9 pr-4 py-2 text-xs text-[#141414] dark:text-white focus:outline-none transition-colors"
                >
                  <option value="">项目预设：当前临时配置</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.username}/{p.repo})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingProfile(!isAddingProfile)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-[11px] font-medium bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-zinc-200 hover:bg-[#E5E7EB] dark:hover:bg-[#2E303A] transition-colors whitespace-nowrap shrink-0"
                title="将当前仓库、分支与子目录保存为快速预设"
              >
                <Plus className="w-3 h-3" />
                <span>存为预设</span>
              </button>
              {activeProfileId && (
                <button
                  type="button"
                  onClick={() => onDeleteProfile(activeProfileId)}
                  className="p-2 rounded-full text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors shrink-0"
                  title="删除当前选中的预设"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isAddingProfile && (
              <form onSubmit={handleConfirmSaveProfile} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="输入预设名称（如：个人主站 / 测试页）"
                  className="flex-1 bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-1.5 text-xs text-[#141414] dark:text-white focus:outline-none transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 whitespace-nowrap"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingProfile(false)}
                  className="px-3 py-1.5 rounded-full text-xs text-zinc-500 hover:text-[#141414] dark:hover:text-white whitespace-nowrap"
                >
                  取消
                </button>
              </form>
            )}
          </div>

          {/* PAT Token + Permission & Rate Limit Check */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-[#141414] dark:text-zinc-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>GitHub Access Token (PAT)</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCheckToken}
                  disabled={isCheckingToken || !token.trim()}
                  className="text-[11px] font-medium text-[#141414] dark:text-zinc-200 hover:opacity-75 underline underline-offset-2 transition-opacity whitespace-nowrap disabled:opacity-40"
                >
                  {isCheckingToken ? '检测中...' : '检测权限与额度'}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenQuickDrawer('guide')}
                  className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-white underline underline-offset-2 transition-colors whitespace-nowrap"
                >
                  获取教程
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="在此粘贴 ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full pl-4 pr-11 py-2.5 text-[#141414] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-mono text-xs focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white transition-colors"
                aria-label={showToken ? '隐藏 Token' : '显示 Token'}
                title={showToken ? '隐藏 Token' : '显示 Token'}
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Token Check Result */}
            {tokenCheckResult && (
              <div
                className={`mt-2 px-4 py-3 rounded-2xl text-[11px] flex items-start gap-2.5 border ${
                  tokenCheckResult.status === 'ok'
                    ? 'bg-emerald-50/75 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                    : tokenCheckResult.status === 'warning'
                    ? 'bg-amber-50/75 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-50/75 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#141414] dark:text-zinc-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>GitHub 用户名</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-2.5 text-[#141414] dark:text-white placeholder:text-zinc-400 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-[#141414] dark:text-zinc-200 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>仓库名 (Repo)</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenCreateRepo}
                  className="text-[11px] font-medium text-[#141414] dark:text-zinc-200 hover:opacity-75 underline underline-offset-2 transition-opacity whitespace-nowrap"
                >
                  + 一键新建
                </button>
              </div>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="your-repository"
                className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-2.5 text-[#141414] dark:text-white placeholder:text-zinc-400 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Settings & Deployment Policies */}
        <div className="border-t border-black/[0.05] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowAdvancedConfig((prev) => !prev)}
            aria-expanded={showAdvancedConfig}
            className="w-full px-6 py-4 hover:bg-[#F7F8FA] dark:hover:bg-[#1E2026] transition-colors flex items-center justify-between gap-3 text-left"
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#141414] dark:text-white">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span>高级设置与部署策略</span>
              </div>
              {!showAdvancedConfig && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate pl-5.5">
                  分支 {branch || 'main'}
                  {cleanSubdirPreview ? ` · 子目录 ${cleanSubdirPreview}/` : ''}
                  {` · ${forcePush ? '强制覆写' : '增量合并'}`}
                  {autoInjectPagesAction ? ' · 自动 Pages' : ''}
                </p>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0 transition-transform duration-200 ${
                showAdvancedConfig ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAdvancedConfig && (
            <div className="px-6 pb-6 pt-2 border-t border-black/[0.04] dark:border-white/[0.05] space-y-5">
              {/* Email & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#141414] dark:text-zinc-200 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>提交邮箱</span>
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-2 text-[#141414] dark:text-white placeholder:text-zinc-400 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#141414] dark:text-zinc-200 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>目标分支</span>
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-2 text-[#141414] dark:text-white placeholder:text-zinc-400 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Target Subdirectory (Subfolder Deploy) & Commit Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#141414] dark:text-zinc-200 flex items-center gap-1.5">
                    <FolderInput className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>部署子目录 (可选)</span>
                  </label>
                  <input
                    type="text"
                    value={targetSubdir}
                    onChange={(e) => setTargetSubdir(e.target.value)}
                    placeholder="留空即根目录，如 docs"
                    className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-2 text-[#141414] dark:text-white placeholder:text-zinc-400 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#141414] dark:text-zinc-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>Commit 提交描述</span>
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="提交信息"
                    className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full px-4 py-2 text-[#141414] dark:text-white placeholder:text-zinc-400 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {cleanSubdirPreview && (
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-[#F2F3F5] dark:bg-[#23252C] rounded-2xl px-4 py-2.5">
                  子目录模式已激活：本次解压文件将部署至{' '}
                  <code className="font-mono font-semibold text-[#141414] dark:text-white">
                    {cleanSubdirPreview}/
                  </code>{' '}
                  下，并安全保留仓库其他目录现有文件。
                </p>
              )}

              {/* Deployment Flags */}
              <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06] space-y-3 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={forcePush}
                    onChange={(e) => setForcePush(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#141414] dark:accent-white rounded border-zinc-300 dark:border-zinc-700 shrink-0"
                  />
                  <div>
                    <span className="font-semibold text-[#141414] dark:text-white block">
                      强制清空重置远端仓库 (--force overwrite)
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {cleanSubdirPreview
                        ? `子目录模式下将保留非 ${cleanSubdirPreview}/ 文件，强制刷新分支提交`
                        : forcePush
                        ? '彻底清洗远端历史多余文件，以本次解压代码为准'
                        : '增量合并：保留远端已有旧文件'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={autoInjectPagesAction}
                    onChange={(e) => setAutoInjectPagesAction(e.target.checked)}
                    className="w-4 h-4 accent-[#141414] dark:accent-white rounded border-zinc-300 dark:border-zinc-700 shrink-0"
                  />
                  <span>自动注入 Pages 自动编译工作流 (.yml)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none text-zinc-500 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={saveLocally}
                    onChange={(e) => setSaveLocally(e.target.checked)}
                    className="w-4 h-4 accent-[#141414] dark:accent-white rounded border-zinc-300 dark:border-zinc-700 shrink-0"
                  />
                  <span>记住配置（仅保存在当前浏览器）</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Right Column: ZIP/Folder Dropzone, File Tree, Progress & Logs */}
      <section className="xl:col-span-7 min-w-0 space-y-6">
        {/* Drag & Drop File or Folder Select Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#141414] dark:hover:border-white rounded-[24px] text-center bg-white dark:bg-[#17181C] hover:bg-[#FAFAFB] dark:hover:bg-[#1C1D23] cursor-pointer transition-all duration-150 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] group ${
            extractedFiles.length > 0 ? 'p-6' : 'px-8 py-14'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={onFileChange}
            className="hidden"
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
            onChange={onFolderChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center mx-auto shadow-[0_6px_16px_-4px_rgba(0,0,0,0.22)] transition-transform duration-150 group-hover:scale-105">
            {sourceInfo?.kind === 'folder' ? <FolderOpen className="w-5 h-5" /> : <FileArchive className="w-5 h-5" />}
          </div>

          <div className="mt-4 space-y-1">
            <h3 className="font-semibold text-[#141414] dark:text-white text-sm">
              {sourceInfo
                ? `${sourceInfo.kind === 'folder' ? '已载入文件夹：' : ''}${sourceInfo.name}`
                : '点击选择 .zip，或直接拖入 ZIP / 本地文件夹'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {sourceInfo ? (
                <span className="font-mono tabular-nums">
                  {sourceInfo.kind === 'folder' ? '文件夹总体积' : '压缩包体积'}{' '}
                  {formatFileSize(sourceInfo.totalSize)} · 点击可重新选包
                </span>
              ) : (
                '在浏览器内存中秒速解析并剥离单层嵌套目录，支持 5 路并发无损直推 GitHub'
              )}
            </p>
          </div>

          {!isUnzipping && (
            <div className="pt-5 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  folderInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 text-xs text-[#141414] dark:text-white bg-[#F2F3F5] dark:bg-[#23252C] hover:bg-[#E5E7EB] dark:hover:bg-[#2E303A] px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{sourceInfo ? '改选本地文件夹' : '选择本地文件夹'}</span>
              </button>

              {!sourceInfo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateSampleZip();
                  }}
                  className="inline-flex items-center gap-2 text-xs text-[#141414] dark:text-white bg-[#F2F3F5] dark:bg-[#23252C] hover:bg-[#E5E7EB] dark:hover:bg-[#2E303A] px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>生成测试示范包 (Demo)</span>
                </button>
              )}
            </div>
          )}

          {isUnzipping && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#141414] dark:text-white bg-[#F2F3F5] dark:bg-[#23252C] px-4 py-2 rounded-full">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>正在内存中读取并分析目录结构...</span>
            </div>
          )}
        </div>

        {/* Unzip Error */}
        {unzipError && (
          <div className="bg-rose-50/85 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-[24px] p-4 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-200">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{unzipError}</span>
          </div>
        )}

        {/* Empty State Hint */}
        {extractedFiles.length === 0 && !isUnzipping && (
          <div className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
              <span className="text-xs font-semibold text-[#141414] dark:text-white">
                载入文件后将自动执行以下工作流
              </span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                5x Concurrent Pipeline
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="font-semibold text-[#141414] dark:text-white">解压与体检</span>
                </div>
                <p className="leading-relaxed">自动过滤元数据、预警超大文件并支持即时预览，推送前自动扫描敏感密钥。</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="font-semibold text-[#141414] dark:text-white">差异与并发</span>
                </div>
                <p className="leading-relaxed">支持推送前比对新增/修改/删除差异清单，通过 5 路并发与 SHA-1 去重高速同步。</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="font-semibold text-[#141414] dark:text-white">记录与回滚</span>
                </div>
                <p className="leading-relaxed">本地留存每次推送记录本，实时追踪 Actions 构建并随时支持历史回滚。</p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted File Tree & Deployment Control Card */}
        {extractedFiles.length > 0 && (
          <div className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Header & Primary Action */}
            <div className="px-6 py-5 border-b border-black/[0.05] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
                  <FolderTree className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#141414] dark:text-white text-sm flex items-center gap-2">
                    <span>已解析文件目录</span>
                    <span className="font-mono text-xs font-normal text-zinc-500 dark:text-zinc-400 tabular-nums">
                      ({excludedPaths.size > 0 ? `已选 ${activeFilesCount} / ${extractedFiles.length}` : `${extractedFiles.length} 个文件`})
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                    点击文件名可预览，左侧勾选框可单独排除 · 目标 {username}/{repo} ({branch})
                    {cleanSubdirPreview ? `/${cleanSubdirPreview}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onOpenDiffPreview}
                  disabled={isUploading || activeFilesCount === 0}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-white hover:bg-[#E5E7EB] dark:hover:bg-[#2E303A] transition-colors whitespace-nowrap shrink-0 disabled:opacity-40"
                  title="拉取远端文件树比对新增、修改与将删除清单"
                >
                  <GitCompareArrows className="w-3.5 h-3.5" />
                  <span>变更差异</span>
                </button>

                <button
                  type="button"
                  onClick={onUploadToGithub}
                  disabled={isUploading || activeFilesCount === 0}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isUploading || activeFilesCount === 0
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                      : 'bg-[#141414] dark:bg-white hover:opacity-90 text-white dark:text-[#141414] shadow-[0_6px_16px_-4px_rgba(0,0,0,0.22)]'
                  }`}
                >
                  {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploading ? '正在并发同步...' : '安全检测并推送到 GitHub'}</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Oversized File Warning Banner */}
              {activeLargeFiles.length > 0 && (
                <div
                  className={`rounded-2xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                    hasCriticalLargeFile
                      ? 'bg-rose-50/85 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
                      : 'bg-amber-50/85 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-900/50 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        hasCriticalLargeFile
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <div className="font-semibold">
                        体积预警：检测到 {activeLargeFiles.length} 个超大文件
                        {hasCriticalLargeFile ? '（含超过 95MB 极高风险文件，GitHub 限制单文件 < 100MB）' : '（≥ 25MB，可能导致同步变慢或超时）'}
                      </div>
                      <p className="text-[11px] opacity-85">
                        你可以点击右侧按钮一键排除这些大文件，或在下方文件列表中取消勾选单个文件。
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onExcludeAllLargeFiles}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                  >
                    一键排除 ≥25MB 文件
                  </button>
                </div>
              )}

              {/* Filter Status & node_modules toggle */}
              <div className="bg-[#F2F3F5] dark:bg-[#23252C] rounded-2xl p-3.5 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#141414] dark:text-zinc-200 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      保留全部代码与隐藏配置 (
                      <code className="font-mono">.gitignore</code>, <code className="font-mono">.env</code>,{' '}
                      <code className="font-mono">.github</code>)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {excludedPaths.size > 0 && (
                      <button
                        type="button"
                        onClick={onRestoreAllExcluded}
                        className="px-3 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-[#17181C] border border-black/[0.06] dark:border-white/[0.08] text-[#141414] dark:text-zinc-200 hover:border-[#141414] dark:hover:border-white transition-colors tabular-nums"
                      >
                        恢复已排除 ({excludedPaths.size})
                      </button>
                    )}

                    {filterStats.nodeModulesCount > 0 && (
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-white dark:bg-[#17181C] px-3 py-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] text-[#141414] dark:text-zinc-200 font-medium hover:border-[#141414] dark:hover:border-white transition-colors">
                        <input
                          type="checkbox"
                          checked={ignoreNodeModules}
                          onChange={(e) => onToggleNodeModules(e.target.checked)}
                          className="accent-[#141414] dark:accent-white w-3.5 h-3.5 rounded"
                        />
                        <span className="tabular-nums">跳过 node_modules ({filterStats.nodeModulesCount})</span>
                      </label>
                    )}
                  </div>
                </div>

                {(filterStats.junkCount > 0 || filterStats.nodeModulesCount > 0) && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
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
                  <div className="flex justify-between gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                    <span className="truncate">{currentStepText}</span>
                    <span className="shrink-0 font-semibold text-[#141414] dark:text-white">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] dark:bg-[#23252C] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#141414] dark:bg-white h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Banner + Live Actions Tracker */}
              {uploadSuccess && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/85 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>代码已成功推送！远端 GitHub 仓库已更新，并已记入本地部署记录本。</span>
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
                  <div className="bg-[#F2F3F5] dark:bg-[#23252C] rounded-2xl p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-[#141414] dark:text-white">
                        <Activity className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <span>GitHub Actions 实时构建状态</span>
                      </div>
                      <button
                        type="button"
                        onClick={onRefreshActionRun}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#141414] dark:text-zinc-200 bg-white dark:bg-[#17181C] px-3 py-1 rounded-full hover:opacity-85 transition-opacity"
                      >
                        <RefreshCw className={`w-3 h-3 ${isPollingActions ? 'animate-spin' : ''}`} />
                        <span>{isPollingActions ? '轮询监测中' : '刷新状态'}</span>
                      </button>
                    </div>

                    {latestActionRun ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-medium text-[#141414] dark:text-white">
                            <span>{latestActionRun.name}</span>
                            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
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
                          <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                            最近更新：{new Date(latestActionRun.updated_at).toLocaleTimeString()}
                          </p>
                        </div>

                        <a
                          href={latestActionRun.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#141414] dark:text-white underline underline-offset-4 hover:opacity-80 shrink-0"
                        >
                          <span>查看云端日志</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {isPollingActions
                          ? '正在查询最新的 GitHub Actions 工作流运行记录...'
                          : '暂未获取到最近的 Actions 构建记录，点击右上角「刷新状态」可手动获取。'}
                      </p>
                    )}
                  </div>

                  {/* Crucial Setup Guide for GitHub Pages */}
                  <div className="bg-amber-50/75 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-5 text-xs text-amber-950 dark:text-amber-200 space-y-4">
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
                        className="inline-flex items-center gap-1.5 bg-[#141414] dark:bg-white hover:opacity-90 text-white dark:text-[#141414] font-semibold text-xs px-4 py-2 rounded-full transition-opacity shrink-0 disabled:opacity-50"
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
                        className="inline-flex items-center gap-1 font-mono font-semibold underline min-w-0 max-w-full break-all"
                      >
                        <span>https://{username}.github.io/{repo}/</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    {pagesStatus && (
                      <div className="bg-emerald-100/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 p-3 rounded-2xl text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{pagesStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Banner with Resumable Retry & Diagnostics */}
              {uploadError && (
                <div className="bg-rose-50/85 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200 p-5 rounded-2xl space-y-4 text-xs">
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
                          className="inline-flex items-center gap-1.5 bg-[#141414] dark:bg-white hover:opacity-90 text-white dark:text-[#141414] font-semibold px-4 py-2 rounded-full transition-opacity whitespace-nowrap"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>一键新建此仓库</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onUploadToGithub}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1.5 bg-rose-900 dark:bg-rose-200 hover:opacity-90 text-white dark:text-rose-950 font-semibold px-4 py-2 rounded-full transition-opacity whitespace-nowrap disabled:opacity-50"
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

              {/* File Search Bar with Embedded Circular Search Icon */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 flex items-center">
                  <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center absolute left-1 pointer-events-none">
                    <Search className="w-3 h-3" />
                  </span>
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={(e) => {
                      setFileSearch(e.target.value);
                      setVisibleFileCount(100);
                    }}
                    placeholder="搜索已载入的文件路径..."
                    className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full pl-10 pr-4 py-2 text-xs text-[#141414] dark:text-white placeholder:text-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums whitespace-nowrap shrink-0">
                  {filteredFiles.length} / {extractedFiles.length} 项
                </span>
              </div>

              {/* File Tree List (Checkable + Clickable for Instant Preview) */}
              <div className="bg-[#F2F3F5] dark:bg-[#23252C] rounded-2xl p-2 max-h-64 overflow-y-auto font-mono text-xs divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                {filteredFiles.slice(0, visibleFileCount).map((file, idx) => {
                  const isExcluded = excludedPaths.has(file.path);
                  const isCritical = file.size >= LARGE_FILE_CRITICAL_BYTES;
                  const isWarn = !isCritical && file.size >= LARGE_FILE_WARN_BYTES;

                  return (
                    <div
                      key={file.path + idx}
                      className="py-1.5 px-2.5 flex items-center gap-2.5 hover:bg-white dark:hover:bg-[#17181C] rounded-xl transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={!isExcluded}
                        onChange={() => onToggleExcludeFile(file.path)}
                        aria-label={`包含文件 ${file.path}`}
                        title={isExcluded ? '取消排除，纳入本次上传' : '勾选排除此文件不上传'}
                        className="w-3.5 h-3.5 accent-[#141414] dark:accent-white rounded shrink-0 cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => onPreviewFile(file)}
                        className="flex-1 min-w-0 flex items-center justify-between gap-2 text-left py-0.5"
                        title="点击即时预览此文件内容"
                      >
                        <span
                          className={`truncate transition-colors ${
                            isExcluded
                              ? 'line-through opacity-45 text-zinc-500 dark:text-zinc-500'
                              : 'text-[#141414] dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white'
                          }`}
                        >
                          {cleanSubdirPreview ? `${cleanSubdirPreview}/${file.path}` : file.path}
                        </span>

                        <span className="flex items-center gap-2 shrink-0">
                          {isCritical && !isExcluded && (
                            <span className="text-[10px] font-sans font-semibold text-rose-600 dark:text-rose-400">
                              超限不可传
                            </span>
                          )}
                          {isWarn && !isExcluded && (
                            <span className="text-[10px] font-sans font-semibold text-amber-600 dark:text-amber-400">
                              超大文件
                            </span>
                          )}
                          {isExcluded ? (
                            <span className="text-[10px] font-sans text-zinc-400">已排除</span>
                          ) : (
                            <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                              预览
                            </span>
                          )}
                          <span
                            className={`text-[11px] tabular-nums ${
                              isCritical && !isExcluded
                                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                : isWarn && !isExcluded
                                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                : 'text-zinc-500 dark:text-zinc-400'
                            }`}
                          >
                            {formatFileSize(file.size)}
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}

                {filteredFiles.length > visibleFileCount && (
                  <div className="py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleFileCount((prev) => prev + 300)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#141414] dark:text-white bg-white dark:bg-[#17181C] border border-black/[0.06] dark:border-white/[0.08] px-4 py-1.5 rounded-full hover:shadow-sm transition-all"
                    >
                      <span className="tabular-nums">
                        显示更多文件 (已载入 {visibleFileCount} / 剩余 {filteredFiles.length - visibleFileCount} 项)
                      </span>
                    </button>
                  </div>
                )}

                {filteredFiles.length === 0 && (
                  <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                    未找到符合条件的文件
                  </div>
                )}
              </div>

              {/* Activity Log */}
              {logs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      交互执行日志
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                      {logs.length} 条记录
                    </span>
                  </div>
                  <div className="bg-[#141414] dark:bg-[#0B0C0F] border border-black/10 dark:border-white/[0.06] text-zinc-200 p-4 rounded-2xl font-mono text-[11px] max-h-44 overflow-y-auto space-y-1">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-2.5 leading-relaxed">
                        <span className="text-zinc-500 shrink-0 tabular-nums">[{log.time}]</span>
                        <span
                          className={`min-w-0 break-words ${
                            log.status === 'success'
                              ? 'text-emerald-400'
                              : log.status === 'error'
                              ? 'text-rose-400'
                              : 'text-zinc-300'
                          }`}
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
