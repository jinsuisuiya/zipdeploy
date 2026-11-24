import React, { useState, useRef, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import {
  Menu,
  BookOpen,
  Github,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';
import {
  analyzeError,
  type ExtractedFile,
  type UploadLog,
  type ErrorDiagnostics
} from './data/knowledgeBase';
import {
  uint8ToBase64Fast,
  computeGitBlobSha,
  scanFilesForSecrets,
  LARGE_FILE_WARN_BYTES,
  type WorkspaceProfile,
  type SecurityFinding,
  type TokenCheckResult,
  type ActionRunInfo,
  type CommitHistoryItem,
  type DiffEntry,
  type DiffPreviewResult,
  type DeployHistoryRecord
} from './utils/deployHelpers';
import { Sidebar, type ActiveView } from './components/Sidebar';
import { QuickDrawer, type QuickDrawerTab } from './components/QuickDrawer';
import { DeployWorkspace, type SourcePackageInfo } from './components/DeployWorkspace';
import { GuideView } from './components/GuideView';
import { ScriptsView } from './components/ScriptsView';
import { FaqView } from './components/FaqView';
import { WelcomeModal } from './components/WelcomeModal';
import { SecurityWarningModal } from './components/SecurityWarningModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { RollbackModal } from './components/RollbackModal';
import { CreateRepoModal } from './components/CreateRepoModal';
import { DiffPreviewModal } from './components/DiffPreviewModal';
import { DeployHistoryModal } from './components/DeployHistoryModal';

const VIEW_TITLES: Record<ActiveView, string> = {
  deploy: '部署工作台',
  guide: '三分钟教程',
  scripts: '脚本与 Actions',
  faq: '排障百科'
};

const WELCOME_STORAGE_KEY = 'zd_welcome_accepted_v1';
const PROFILES_STORAGE_KEY = 'zd_profiles_v1';
const ACTIVE_PROFILE_STORAGE_KEY = 'zd_active_profile_v1';
const DEPLOY_HISTORY_STORAGE_KEY = 'zd_deploy_history_v1';

export default function App() {
  // Welcome / First-Visit Safety Notice Modal
  const [hasAcceptedWelcome, setHasAcceptedWelcome] = useState<boolean>(() => {
    try {
      return localStorage.getItem(WELCOME_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [welcomeModalOpen, setWelcomeModalOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(WELCOME_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const handleAcceptWelcome = () => {
    try {
      localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setHasAcceptedWelcome(true);
    setWelcomeModalOpen(false);
  };

  // Theme State (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('zd_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('zd_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Config States
  const [token, setToken] = useState<string>(() => localStorage.getItem('zd_token') || '');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(() => localStorage.getItem('zd_username') || 'your-username');
  const [repo, setRepo] = useState<string>(() => localStorage.getItem('zd_repo') || 'your-repository');
  const [email, setEmail] = useState<string>(() => localStorage.getItem('zd_email') || 'user@example.com');
  const [branch, setBranch] = useState<string>(() => localStorage.getItem('zd_branch') || 'main');
  const [targetSubdir, setTargetSubdir] = useState<string>(() => localStorage.getItem('zd_subdir') || '');
  const [commitMessage, setCommitMessage] = useState<string>('refactor: auto deploy unzipped contents');
  const [forcePush, setForcePush] = useState<boolean>(true);
  const [saveLocally, setSaveLocally] = useState<boolean>(true);
  const [autoInjectPagesAction, setAutoInjectPagesAction] = useState<boolean>(true);
  const [pagesStatus, setPagesStatus] = useState<string | null>(null);
  const [isTriggeringPages, setIsTriggeringPages] = useState<boolean>(false);

  // Workspace Profiles
  const [profiles, setProfiles] = useState<WorkspaceProfile[]>(() => {
    try {
      const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      return localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, activeProfileId);
    } catch {
      // ignore
    }
  }, [profiles, activeProfileId]);

  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    if (!id) return;
    const found = profiles.find((p) => p.id === id);
    if (found) {
      setUsername(found.username);
      setRepo(found.repo);
      setEmail(found.email);
      setBranch(found.branch);
      setTargetSubdir(found.targetSubdir);
      setCommitMessage(found.commitMessage);
      setForcePush(found.forcePush);
      setAutoInjectPagesAction(found.autoInjectPagesAction);
    }
  };

  const handleSaveProfile = (name: string) => {
    const id = `prof_${Date.now()}`;
    const newProfile: WorkspaceProfile = {
      id,
      name,
      username: username.trim() || 'your-username',
      repo: repo.trim() || 'your-repository',
      email: email.trim() || 'user@example.com',
      branch: branch.trim() || 'main',
      targetSubdir: targetSubdir.trim(),
      commitMessage: commitMessage.trim() || 'refactor: auto deploy unzipped contents',
      forcePush,
      autoInjectPagesAction
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(id);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId('');
    }
  };

  // Token Permission & Rate Limit Check
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(false);
  const [tokenCheckResult, setTokenCheckResult] = useState<TokenCheckResult | null>(null);

  useEffect(() => {
    setTokenCheckResult(null);
  }, [token]);

  const handleCheckToken = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) return;
    setIsCheckingToken(true);
    setTokenCheckResult(null);

    const headers = {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github+json'
    };

    try {
      const userRes = await fetch('https://api.github.com/user', { headers });
      const rateRemainingHeader = userRes.headers.get('x-ratelimit-remaining');
      const rateLimitHeader = userRes.headers.get('x-ratelimit-limit');
      const scopesHeader = userRes.headers.get('x-oauth-scopes') || '';

      const rateRemaining = rateRemainingHeader !== null ? Number(rateRemainingHeader) : undefined;
      const rateLimit = rateLimitHeader !== null ? Number(rateLimitHeader) : undefined;

      if (!userRes.ok) {
        setTokenCheckResult({
          status: 'error',
          rateRemaining,
          rateLimit,
          message:
            userRes.status === 401
              ? 'Token 无效或已过期 (401 Unauthorized)，请核对或重新生成。'
              : `校验失败 (${userRes.status})，请检查网络连接或 Token 状态。`
        });
        return;
      }

      const userData = await userRes.json().catch(() => ({}));
      const login = userData.login as string | undefined;

      // Check target repo write permissions if repo is configured
      let repoWritable: boolean | null = null;
      const cleanU = username.trim();
      const cleanR = repo.trim();
      if (cleanU && cleanU !== 'your-username' && cleanR && cleanR !== 'your-repository') {
        const repoRes = await fetch(`https://api.github.com/repos/${cleanU}/${cleanR}`, { headers });
        if (repoRes.ok) {
          const repoData = await repoRes.json().catch(() => ({}));
          repoWritable = Boolean(repoData?.permissions?.push);
        } else if (repoRes.status === 404) {
          setTokenCheckResult({
            status: 'warning',
            login,
            scopes: scopesHeader,
            rateRemaining,
            rateLimit,
            repoWritable: false,
            repoNotFound: true,
            message: `Token 有效，但未找到仓库 [${cleanU}/${cleanR}] (404) 或无权访问私有仓库。`
          });
          return;
        }
      }

      const scopeList = scopesHeader
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const isClassicMissingRepo = scopesHeader !== '' && !scopeList.includes('repo');

      if (isClassicMissingRepo) {
        setTokenCheckResult({
          status: 'warning',
          login,
          scopes: scopesHeader,
          rateRemaining,
          rateLimit,
          repoWritable,
          message: 'Token 有效但未检测到 repo 完整权限，推送代码时可能被拒绝 (403)。'
        });
      } else if (repoWritable === false) {
        setTokenCheckResult({
          status: 'warning',
          login,
          scopes: scopesHeader,
          rateRemaining,
          rateLimit,
          repoWritable,
          message: `Token 有效，但当前账号对目标仓库 [${cleanU}/${cleanR}] 缺少写入权限。`
        });
      } else {
        setTokenCheckResult({
          status: 'ok',
          login,
          scopes: scopesHeader,
          rateRemaining,
          rateLimit,
          repoWritable,
          message:
            repoWritable === true
              ? `Token 权限正常，已确认具备 [${cleanU}/${cleanR}] 写入权限。`
              : 'Token 校验通过，可正常调用 GitHub API。'
        });
      }
    } catch (err: any) {
      setTokenCheckResult({
        status: 'error',
        message: `网络检测失败: ${err.message || '请检查网络连接'}`
      });
    } finally {
      setIsCheckingToken(false);
    }
  };

  // Save settings to localStorage
  useEffect(() => {
    if (saveLocally) {
      if (token) localStorage.setItem('zd_token', token);
      if (username) localStorage.setItem('zd_username', username);
      if (repo) localStorage.setItem('zd_repo', repo);
      if (email) localStorage.setItem('zd_email', email);
      if (branch) localStorage.setItem('zd_branch', branch);
      localStorage.setItem('zd_subdir', targetSubdir);
    }
  }, [token, username, repo, email, branch, targetSubdir, saveLocally]);

  // File Extraction & Exclusion States
  const rawLoadedEntriesRef = useRef<{ path: string; content: Uint8Array }[] | null>(null);
  const [sourceInfo, setSourceInfo] = useState<SourcePackageInfo | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [excludedPaths, setExcludedPaths] = useState<Set<string>>(new Set());
  const [isUnzipping, setIsUnzipping] = useState<boolean>(false);
  const [unzipError, setUnzipError] = useState<string | null>(null);
  const [fileSearch, setFileSearch] = useState<string>('');
  const [visibleFileCount, setVisibleFileCount] = useState<number>(100);
  const [ignoreNodeModules, setIgnoreNodeModules] = useState<boolean>(true);
  const [filterStats, setFilterStats] = useState<{ junkCount: number; nodeModulesCount: number }>({
    junkCount: 0,
    nodeModulesCount: 0
  });
  const [previewFile, setPreviewFile] = useState<ExtractedFile | null>(null);

  // Upload Progress & Secret Scan States
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errorDiagnostics, setErrorDiagnostics] = useState<ErrorDiagnostics | null>(null);
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([]);

  // Live GitHub Actions Status Tracker
  const [latestActionRun, setLatestActionRun] = useState<ActionRunInfo | null>(null);
  const [isPollingActions, setIsPollingActions] = useState<boolean>(false);

  // Rollback Modal States
  const [rollbackModalOpen, setRollbackModalOpen] = useState<boolean>(false);
  const [rollbackCommits, setRollbackCommits] = useState<CommitHistoryItem[]>([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState<boolean>(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
  const [rollbackSuccessSha, setRollbackSuccessSha] = useState<string | null>(null);

  // Create Repository Modal States
  const [createRepoModalOpen, setCreateRepoModalOpen] = useState<boolean>(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState<boolean>(false);
  const [createRepoError, setCreateRepoError] = useState<string | null>(null);
  const [createdRepoSuccessName, setCreatedRepoSuccessName] = useState<string | null>(null);

  // Diff Preview Modal States
  const [diffModalOpen, setDiffModalOpen] = useState<boolean>(false);
  const [isComputingDiff, setIsComputingDiff] = useState<boolean>(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<DiffPreviewResult | null>(null);

  // Local Deploy History States
  const [deployHistory, setDeployHistory] = useState<DeployHistoryRecord[]>(() => {
    try {
      const raw = localStorage.getItem(DEPLOY_HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(DEPLOY_HISTORY_STORAGE_KEY, JSON.stringify(deployHistory));
    } catch {
      // ignore
    }
  }, [deployHistory]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = '文件部署上传中，离开或刷新页面可能会中断当前传输！';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  // Navigation & Drawer UI States
  const [activeView, setActiveView] = useState<ActiveView>('deploy');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [quickDrawerTab, setQuickDrawerTab] = useState<QuickDrawerTab>(null);
  const [quickDrawerQuery, setQuickDrawerQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRefreshingSite, setIsRefreshingSite] = useState<boolean>(false);

  const openQuickDrawer = (tab: Exclude<QuickDrawerTab, null>, query = '') => {
    setQuickDrawerQuery(query);
    setQuickDrawerTab(tab);
  };

  const handleForceUpdateSite = async () => {
    setIsRefreshingSite(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      sessionStorage.clear();
    } catch (err) {
      console.warn('清空浏览器缓存失败:', err);
    } finally {
      setTimeout(() => {
        const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.location.href = cleanUrl + '?v=' + Date.now();
      }, 300);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string, status: 'pending' | 'success' | 'error' | 'info' = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { id: Math.random().toString(), time: timeStr, message, status }]);
  };

  // Fetch latest GitHub Actions run
  const fetchLatestActionRun = useCallback(async (): Promise<ActionRunInfo | null> => {
    const cleanToken = token.trim();
    const cleanU = username.trim();
    const cleanR = repo.trim();
    if (!cleanToken || !cleanU || !cleanR || cleanU === 'your-username' || cleanR === 'your-repository') {
      return null;
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${cleanU}/${cleanR}/actions/runs?per_page=1`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github+json'
        }
      });
      if (!res.ok) return null;
      const data = await res.json();
      const run = data?.workflow_runs?.[0];
      if (!run) return null;

      const parsed: ActionRunInfo = {
        id: run.id,
        name: run.name || 'Workflow',
        status: run.status,
        conclusion: run.conclusion,
        html_url: run.html_url,
        created_at: run.created_at,
        updated_at: run.updated_at
      };
      setLatestActionRun(parsed);
      return parsed;
    } catch {
      return null;
    }
  }, [token, username, repo]);

  // Poll Actions while active after upload success
  useEffect(() => {
    if (!uploadSuccess) {
      setIsPollingActions(false);
      return;
    }

    let cancelled = false;
    let pollCount = 0;
    const maxPolls = 24; // ~2 mins max
    setIsPollingActions(true);

    const tick = async () => {
      if (cancelled) return;
      pollCount++;
      const run = await fetchLatestActionRun();
      if (cancelled) return;
      if ((run && run.status === 'completed') || pollCount >= maxPolls) {
        setIsPollingActions(false);
        return;
      }
      setTimeout(tick, 5000);
    };

    const initialTimer = setTimeout(tick, 2500);
    return () => {
      cancelled = true;
      clearTimeout(initialTimer);
    };
  }, [uploadSuccess, fetchLatestActionRun]);

  // Rollback handlers
  const fetchCommitHistory = async () => {
    const cleanToken = token.trim();
    const cleanU = username.trim();
    const cleanR = repo.trim();
    const cleanB = branch.trim() || 'main';

    if (!cleanToken || !cleanU || !cleanR || cleanU === 'your-username' || cleanR === 'your-repository') {
      setRollbackError('请先填写有效的 GitHub Token、用户名与仓库名。');
      setRollbackCommits([]);
      return;
    }

    setIsLoadingCommits(true);
    setRollbackError(null);
    setRollbackSuccessSha(null);

    try {
      const res = await fetch(
        `https://api.github.com/repos/${cleanU}/${cleanR}/commits?sha=${encodeURIComponent(cleanB)}&per_page=8`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github+json'
          }
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `读取历史失败 (${res.status})`);
      }

      const data = await res.json();
      const mapped: CommitHistoryItem[] = Array.isArray(data)
        ? data.map((item: any) => ({
            sha: item.sha,
            message: item.commit?.message || '(无提交说明)',
            authorName: item.commit?.author?.name || item.author?.login || 'Unknown',
            date: item.commit?.author?.date || '',
            htmlUrl: item.html_url
          }))
        : [];
      setRollbackCommits(mapped);
    } catch (err: any) {
      setRollbackError(err.message || '拉取提交记录失败');
    } finally {
      setIsLoadingCommits(false);
    }
  };

  const handleOpenRollback = () => {
    setRollbackModalOpen(true);
    fetchCommitHistory();
  };

  const handleRollbackToSha = async (sha: string) => {
    const cleanToken = token.trim();
    const cleanU = username.trim();
    const cleanR = repo.trim();
    const cleanB = branch.trim() || 'main';

    setIsRollingBack(true);
    setRollbackError(null);
    setRollbackSuccessSha(null);

    try {
      const res = await fetch(
        `https://api.github.com/repos/${cleanU}/${cleanR}/git/refs/heads/${encodeURIComponent(cleanB)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sha, force: true })
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `回滚失败 (${res.status})`);
      }

      setRollbackSuccessSha(sha);
      await fetchCommitHistory();
    } catch (err: any) {
      setRollbackError(err.message || '执行分支回滚时出现错误');
    } finally {
      setIsRollingBack(false);
    }
  };

  // One-click Create GitHub Repository
  const handleOpenCreateRepo = () => {
    setCreateRepoError(null);
    setCreatedRepoSuccessName(null);
    setCreateRepoModalOpen(true);
  };

  const handleCreateRepo = async ({
    name,
    description,
    isPrivate,
    autoPushAfterCreate
  }: {
    name: string;
    description: string;
    isPrivate: boolean;
    autoPushAfterCreate: boolean;
  }) => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setCreateRepoError('请先在配置区填入您的 GitHub Access Token (PAT) 后再新建仓库。');
      return;
    }

    setIsCreatingRepo(true);
    setCreateRepoError(null);
    setCreatedRepoSuccessName(null);

    const headers = {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    };

    try {
      // Determine authenticated user to decide personal vs org repo endpoint
      const userRes = await fetch('https://api.github.com/user', { headers });
      if (!userRes.ok) {
        if (userRes.status === 401) {
          throw new Error('GitHub Token 无效或已过期 (401)，请检查后重试。');
        }
        throw new Error(`无法验证当前 GitHub 账号 (${userRes.status})。`);
      }

      const userData = await userRes.json();
      const authLogin = userData.login as string;
      const cleanFormUser = username.trim();
      const useOrgEndpoint =
        cleanFormUser &&
        cleanFormUser !== 'your-username' &&
        cleanFormUser.toLowerCase() !== authLogin.toLowerCase();

      const endpoint = useOrgEndpoint
        ? `https://api.github.com/orgs/${encodeURIComponent(cleanFormUser)}/repos`
        : 'https://api.github.com/user/repos';

      const createRes = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          description: description || 'Deployed via zipdeploy',
          private: isPrivate,
          auto_init: false
        })
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        if (createRes.status === 404 && useOrgEndpoint) {
          throw new Error(
            `未找到组织 [${cleanFormUser}] 或无权创建仓库。若要创建个人仓库，请将用户名改为 [${authLogin}]。`
          );
        }
        if (createRes.status === 422) {
          throw new Error(
            `仓库名 [${name}] 已存在或格式不符合 GitHub 规范（只允许字母、数字、点、下划线与连字符）。`
          );
        }
        if (createRes.status === 403) {
          throw new Error('Token 权限不足 (403)，请确保 Token 勾选了 repo 完整控制权限。');
        }
        throw new Error(formatApiError(errData, `创建仓库失败 (${createRes.status})`));
      }

      const created = await createRes.json();
      const createdOwner = created?.owner?.login || authLogin;
      const createdName = created?.name || name;
      const fullName = created?.full_name || `${createdOwner}/${createdName}`;

      setUsername(createdOwner);
      setRepo(createdName);
      setUploadError(null);
      setErrorDiagnostics(null);
      setTokenCheckResult({
        status: 'ok',
        login: authLogin,
        repoWritable: true,
        message: `新仓库 [${fullName}] 已创建成功并具备写入权限。`
      });
      setCreatedRepoSuccessName(fullName);

      const activeFiles = extractedFiles.filter((f) => !excludedPaths.has(f.path));
      if (autoPushAfterCreate && activeFiles.length > 0) {
        setCreateRepoModalOpen(false);
        const findings = scanFilesForSecrets(activeFiles);
        if (findings.length > 0) {
          setSecurityFindings(findings);
        } else {
          executeUploadToGithub({ overrideUsername: createdOwner, overrideRepo: createdName });
        }
      }
    } catch (err: any) {
      setCreateRepoError(err.message || '创建仓库时发生未知错误');
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const triggerPagesAutoSetup = async () => {
    if (!token || !username || !repo) return;
    setIsTriggeringPages(true);
    setPagesStatus('正在调用 API 为你自动开启 GitHub Pages 并发起部署...');
    addLog('正在通过 API 尝试开启/配置 GitHub Pages...', 'info');

    const headers = {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    };

    try {
      let pagesRes = await fetch(`https://api.github.com/repos/${username}/${repo}/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ build_type: 'workflow' })
      });

      if (!pagesRes.ok && (pagesRes.status === 409 || pagesRes.status === 422)) {
        pagesRes = await fetch(`https://api.github.com/repos/${username}/${repo}/pages`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ build_type: 'workflow' })
        });
      }

      if (pagesRes.ok || pagesRes.status === 204) {
        addLog('已成功通过 API 将 GitHub Pages 切换为 Actions 构建模式', 'success');
      }

      const dispatchRes = await fetch(
        `https://api.github.com/repos/${username}/${repo}/actions/workflows/deploy-pages.yml/dispatches`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ ref: branch })
        }
      );

      if (dispatchRes.ok || dispatchRes.status === 204) {
        addLog('成功触发 GitHub Actions 云端打包与上线，上方追踪器将持续同步进度', 'success');
        setPagesStatus('全自动触发成功！已开启 Pages 并启动云端打包，等待约 1 分钟刷新网址即可。');
        setTimeout(() => {
          fetchLatestActionRun();
        }, 1500);
      } else {
        setPagesStatus('Pages 模式已配置下发，请前往 Actions 标签页或稍后刷新预览。');
      }
    } catch (e: any) {
      console.error(e);
      setPagesStatus(`API 配置提示: ${e.message || '操作已完成'}`);
    } finally {
      setIsTriggeringPages(false);
    }
  };

  const handleClearSaved = () => {
    localStorage.removeItem('zd_token');
    localStorage.removeItem('zd_username');
    localStorage.removeItem('zd_repo');
    localStorage.removeItem('zd_email');
    localStorage.removeItem('zd_branch');
    localStorage.removeItem('zd_subdir');
    setToken('');
    setUsername('your-username');
    setRepo('your-repository');
    setEmail('user@example.com');
    setBranch('main');
    setTargetSubdir('');
    setActiveProfileId('');
    setTokenCheckResult(null);
  };

  const handleGenerateSampleZip = async () => {
    setIsUnzipping(true);
    setUnzipError(null);
    setUploadSuccess(false);
    setUploadError(null);
    setLogs([]);

    try {
      const zip = new JSZip();
      zip.file(
        'index.html',
        '<!DOCTYPE html>\n<html>\n<head>\n  <title>Sample Site</title>\n</head>\n<body>\n  <h1>Hello from ZipDeploy!</h1>\n</body>\n</html>'
      );
      zip.file('css/style.css', 'body { background: #f8f8f7; font-family: sans-serif; }');
      zip.file('README.md', '# Sample Project\nDeployed via ZipDeploy.');

      const blob = await zip.generateAsync({ type: 'blob' });
      const sampleFile = new File([blob], 'demo-sample-project.zip', { type: 'application/zip' });
      await processZipFile(sampleFile);
    } catch (err: any) {
      setIsUnzipping(false);
      setUnzipError(`生成示例包失败: ${err.message}`);
    }
  };

  const sanitizeGitPath = (rawPath: string): string => {
    if (!rawPath) return '';
    const normalized = rawPath.replace(/\\/g, '/');
    const parts = normalized
      .split('/')
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && p !== '.' && p !== '..');
    return parts.join('/');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      await processZipFile(file);
    } catch (err: any) {
      console.error(err);
      setUnzipError(`文件处理异常: ${err.message || '系统发生未知错误'}`);
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      await processFolderFiles(Array.from(files));
    } catch (err: any) {
      console.error(err);
      setUnzipError(`文件夹读取异常: ${err.message || '系统发生未知错误'}`);
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const readDroppedEntriesRecursive = async (
    items: DataTransferItemList
  ): Promise<{ entries: { path: string; content: Uint8Array }[]; rootFolderName: string } | null> => {
    const webkitEntries: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = (items[i] as any).webkitGetAsEntry?.();
      if (entry) webkitEntries.push(entry);
    }
    if (webkitEntries.length === 0) return null;

    // If it's just a single .zip file, let ZIP pipeline handle it
    if (webkitEntries.length === 1 && webkitEntries[0].isFile && webkitEntries[0].name.toLowerCase().endsWith('.zip')) {
      return null;
    }

    const collected: { path: string; content: Uint8Array }[] = [];

    const readFileFromEntry = (fileEntry: any): Promise<File> =>
      new Promise((resolve, reject) => fileEntry.file(resolve, reject));

    const readAllDirEntries = async (dirEntry: any): Promise<any[]> => {
      const reader = dirEntry.createReader();
      const all: any[] = [];
      while (true) {
        const batch: any[] = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
        if (!batch || batch.length === 0) break;
        all.push(...batch);
      }
      return all;
    };

    const traverse = async (entry: any, prefix: string) => {
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isFile) {
        try {
          const f = await readFileFromEntry(entry);
          const buf = await f.arrayBuffer();
          collected.push({ path: relPath, content: new Uint8Array(buf) });
        } catch (err) {
          console.warn(`跳过无法读取的文件 [${relPath}]:`, err);
        }
      } else if (entry.isDirectory) {
        const children = await readAllDirEntries(entry);
        for (const child of children) {
          await traverse(child, relPath);
        }
      }
    };

    for (const entry of webkitEntries) {
      await traverse(entry, '');
    }

    const rootFolderName =
      webkitEntries.length === 1 && webkitEntries[0].isDirectory
        ? webkitEntries[0].name
        : `folder-upload-${collected.length}-files`;

    return { entries: collected, rootFolderName };
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const droppedFolder = await readDroppedEntriesRecursive(items);
        if (droppedFolder && droppedFolder.entries.length > 0) {
          const totalSize = droppedFolder.entries.reduce((acc, item) => acc + item.content.byteLength, 0);
          applyRawEntriesToWorkspace(
            droppedFolder.entries,
            { name: droppedFolder.rootFolderName, totalSize, kind: 'folder' },
            ignoreNodeModules,
            true
          );
          return;
        }
      }

      const file = e.dataTransfer.files?.[0];
      if (file && (file.name.endsWith('.zip') || file.type.includes('zip'))) {
        await processZipFile(file);
      } else {
        setUnzipError('请拖入标准的 .zip 压缩包或本地项目文件夹');
      }
    } catch (err: any) {
      console.error(err);
      setUnzipError(`文件或文件夹拖拽解析异常: ${err.message || '格式不受支持'}`);
    }
  };

  const applyRawEntriesToWorkspace = (
    rawEntries: { path: string; content: Uint8Array }[],
    pkgInfo: SourcePackageInfo,
    skipNodeModules: boolean,
    resetExclusions = true
  ) => {
    rawLoadedEntriesRef.current = rawEntries;
    setSourceInfo(pkgInfo);
    setUnzipError(null);
    setUploadSuccess(false);
    setUploadError(null);
    setLatestActionRun(null);
    setLogs([]);
    setVisibleFileCount(100);
    if (resetExclusions) {
      setExcludedPaths(new Set());
    }

    const validEntries = rawEntries
      .map((e) => e.path.replace(/\\/g, '/'))
      .filter((normalized) => {
        const filename = normalized.split('/').pop() || '';
        return !(
          normalized.includes('__MACOSX/') ||
          normalized.startsWith('.git/') ||
          normalized.includes('/.git/') ||
          filename === '.DS_Store' ||
          filename === 'Thumbs.db' ||
          filename === 'desktop.ini'
        );
      });

    let rootPrefix = '';
    if (validEntries.length > 0) {
      const firstParts = validEntries[0].split('/');
      if (firstParts.length > 1) {
        const candidatePrefix = firstParts[0] + '/';
        if (validEntries.every((p) => p.startsWith(candidatePrefix))) {
          rootPrefix = candidatePrefix;
        }
      }
    }

    let junkCount = 0;
    let nodeModulesCount = 0;
    const fileList: ExtractedFile[] = [];
    const seenPaths = new Set<string>();

    for (const entry of rawEntries) {
      const normalized = entry.path.replace(/\\/g, '/');
      const filename = normalized.split('/').pop() || '';

      if (
        normalized.includes('__MACOSX/') ||
        normalized.endsWith('.DS_Store') ||
        filename === '.DS_Store' ||
        filename === 'Thumbs.db' ||
        filename === 'desktop.ini' ||
        normalized.startsWith('.git/') ||
        normalized.includes('/.git/')
      ) {
        junkCount++;
        continue;
      }

      if (normalized.startsWith('node_modules/') || normalized.includes('/node_modules/')) {
        nodeModulesCount++;
        if (skipNodeModules) {
          continue;
        }
      }

      let cleanPath = normalized;
      if (rootPrefix && cleanPath.startsWith(rootPrefix)) {
        cleanPath = cleanPath.substring(rootPrefix.length);
      }

      cleanPath = sanitizeGitPath(cleanPath);
      if (!cleanPath || seenPaths.has(cleanPath)) continue;
      seenPaths.add(cleanPath);

      fileList.push({
        path: cleanPath,
        size: entry.content.byteLength,
        isDir: false,
        content: entry.content
      });
    }

    if (autoInjectPagesAction) {
      const workflowPath = '.github/workflows/deploy-pages.yml';
      if (!seenPaths.has(workflowPath)) {
        const pagesWorkflowYaml = `name: Deploy site to GitHub Pages

on:
  push:
    branches: ['main', 'master']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js environment
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies & Build project
        run: |
          if [ -f package.json ]; then
            echo "Installing dependencies..."
            npm install || npm install --legacy-peer-deps
            echo "Building static site..."
            if grep -q '"build"' package.json; then
              npm run build || true
            fi
          fi

          # Locate target static export directory
          if [ -d "dist" ]; then
            echo "FOUND_DIST=./dist" >> $GITHUB_ENV
          elif [ -d "build" ]; then
            echo "FOUND_DIST=./build" >> $GITHUB_ENV
          elif [ -d "out" ]; then
            echo "FOUND_DIST=./out" >> $GITHUB_ENV
          else
            echo "No build folder detected. Preparing root files for static hosting..."
            mkdir -p _site
            cp -r ./* _site/ 2>/dev/null || true
            rm -rf _site/_site 2>/dev/null || true
            echo "FOUND_DIST=./_site" >> $GITHUB_ENV
          fi

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v4

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: \${{ env.FOUND_DIST }}

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

        const bytes = new TextEncoder().encode(pagesWorkflowYaml);
        fileList.push({
          path: workflowPath,
          size: bytes.byteLength,
          isDir: false,
          content: bytes
        });
      }
    }

    setFilterStats({ junkCount, nodeModulesCount });
    setExtractedFiles(fileList);
  };

  const processFolderFiles = async (files: File[], skipNodeModules = ignoreNodeModules) => {
    setIsUnzipping(true);
    setUnzipError(null);
    try {
      const entries: { path: string; content: Uint8Array }[] = [];
      let totalSize = 0;
      let folderName = '本地文件夹';

      for (const f of files) {
        const rel = (f as any).webkitRelativePath || f.name;
        if (entries.length === 0 && rel.includes('/')) {
          folderName = rel.split('/')[0];
        }
        const buf = await f.arrayBuffer();
        totalSize += buf.byteLength;
        entries.push({ path: rel, content: new Uint8Array(buf) });
      }

      if (entries.length === 0) {
        throw new Error('所选文件夹为空');
      }

      applyRawEntriesToWorkspace(
        entries,
        { name: folderName, totalSize, kind: 'folder' },
        skipNodeModules,
        true
      );
    } catch (err: any) {
      setUnzipError(`文件夹读取失败: ${err.message || '请重试'}`);
    } finally {
      setIsUnzipping(false);
    }
  };

  const processZipFile = async (file: File, skipNodeModules = ignoreNodeModules) => {
    setIsUnzipping(true);
    setUnzipError(null);

    try {
      const decodeZipFileName = (bytes: Uint8Array): string => {
        try {
          return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch {
          try {
            return new TextDecoder('gbk').decode(bytes);
          } catch {
            return new TextDecoder().decode(bytes);
          }
        }
      };

      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file, { decodeFileName: decodeZipFileName });
      const rawEntries: { path: string; content: Uint8Array }[] = [];

      for (const relativePath of Object.keys(zipContent.files)) {
        const zipEntry = zipContent.files[relativePath];
        if (zipEntry.dir || relativePath.endsWith('/')) continue;
        try {
          const contentUint8 = await zipEntry.async('uint8array');
          rawEntries.push({ path: relativePath, content: contentUint8 });
        } catch (entryErr) {
          console.warn(`跳过无法解压读取的文件 [${relativePath}]:`, entryErr);
        }
      }

      applyRawEntriesToWorkspace(
        rawEntries,
        { name: file.name, totalSize: file.size, kind: 'zip' },
        skipNodeModules,
        true
      );
    } catch (err: any) {
      console.error(err);
      setUnzipError(`压缩包解析失败: ${err.message || '文件损坏或非标准 ZIP 格式'}`);
    } finally {
      setIsUnzipping(false);
    }
  };

  const handleToggleNodeModules = (skip: boolean) => {
    setIgnoreNodeModules(skip);
    if (rawLoadedEntriesRef.current && sourceInfo) {
      applyRawEntriesToWorkspace(rawLoadedEntriesRef.current, sourceInfo, skip, false);
    }
  };

  const handleToggleExcludeFile = (path: string) => {
    setExcludedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleExcludeAllLargeFiles = () => {
    setExcludedPaths((prev) => {
      const next = new Set(prev);
      for (const f of extractedFiles) {
        if (f.size >= LARGE_FILE_WARN_BYTES) {
          next.add(f.path);
        }
      }
      return next;
    });
  };

  const handleRestoreAllExcluded = () => {
    setExcludedPaths(new Set());
  };

  const blobShaCacheRef = useRef<Map<string, string>>(new Map());

  const formatApiError = (errData: any, fallbackMessage: string): string => {
    if (errData && errData.errors && Array.isArray(errData.errors) && errData.errors.length > 0) {
      const details = errData.errors
        .map((e: any) => {
          if (typeof e === 'string') return e;
          if (e.message) return e.message;
          if (e.field) return `${e.field}: ${e.code || 'invalid'}`;
          return JSON.stringify(e);
        })
        .join(', ');
      return `${errData.message || fallbackMessage} (${details})`;
    }
    if (errData && errData.message) {
      return errData.message;
    }
    return fallbackMessage;
  };

  // Resilient fetch with retries, timeout, and rate-limit callback
  const robustFetch = async (
    url: string,
    options: RequestInit,
    maxRetries = 4,
    timeoutMs = 35000,
    onRateLimitHit?: () => void
  ): Promise<Response> => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 429 || (response.status === 403 && !response.ok)) {
          const clone = response.clone();
          const errJson = await clone.json().catch(() => ({}));
          const isRateLimit =
            errJson?.message?.toLowerCase().includes('rate limit') ||
            errJson?.message?.toLowerCase().includes('abuse') ||
            errJson?.message?.toLowerCase().includes('secondary');

          if (isRateLimit && attempt < maxRetries) {
            onRateLimitHit?.();
            const retryAfter = Number(response.headers.get('retry-after')) || attempt * 2 + 1;
            addLog(`触发 GitHub API 频率保护，自动降速并等待 ${retryAfter} 秒后重试...`, 'info');
            await new Promise((r) => setTimeout(r, retryAfter * 1000));
            continue;
          }
        }

        if ([500, 502, 503, 504].includes(response.status) && attempt < maxRetries) {
          addLog(`GitHub 服务端返回 ${response.status}，等待 2 秒后第 ${attempt} 次自动重试...`, 'info');
          await new Promise((r) => setTimeout(r, 2000 * attempt));
          continue;
        }

        return response;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        const isAbort = err.name === 'AbortError';
        const msg = isAbort ? '请求超时 (35s)' : err.message || '网络连接波动';

        if (attempt < maxRetries) {
          const delay = attempt * 1500;
          addLog(`网络连接波动 (${msg})，${(delay / 1000).toFixed(1)} 秒后第 ${attempt} 次自动重试...`, 'info');
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw lastError || new Error('网络请求多次重试失败，请检查网络或 GitHub 服务状态');
  };

  // Compute remote Diff Preview before pushing
  const computeRemoteDiff = async () => {
    const cleanToken = token.trim();
    const cleanU = username.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/^\/+/, '').split('/')[0];
    const cleanR = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+/, '');
    const cleanB = branch.trim() || 'main';
    const cleanSubdir = sanitizeGitPath(targetSubdir);
    const activeFiles = extractedFiles.filter((f) => !excludedPaths.has(f.path));

    if (!cleanToken) {
      setDiffError('请先填写 GitHub Personal Access Token (PAT) 后再对比差异。');
      setDiffResult(null);
      return;
    }
    if (!cleanU || cleanU === 'your-username' || !cleanR || cleanR === 'your-repository') {
      setDiffError('请先填写有效的 GitHub 用户名和仓库名。');
      setDiffResult(null);
      return;
    }
    if (activeFiles.length === 0) {
      setDiffError('当前没有选中任何可对比的文件。');
      setDiffResult(null);
      return;
    }

    setIsComputingDiff(true);
    setDiffError(null);

    const headers = {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github+json'
    };

    try {
      const refRes = await fetch(
        `https://api.github.com/repos/${cleanU}/${cleanR}/git/ref/heads/${encodeURIComponent(cleanB)}`,
        { headers }
      );

      const remoteTreeShaMap = new Map<string, string>();
      let isNewRepoOrBranch = false;

      if (refRes.status === 404 || refRes.status === 409) {
        isNewRepoOrBranch = true;
      } else if (!refRes.ok) {
        const errData = await refRes.json().catch(() => ({}));
        throw new Error(formatApiError(errData, `读取远端分支失败 (${refRes.status})`));
      } else {
        const refData = await refRes.json();
        const headSha = refData?.object?.sha;
        if (headSha) {
          const treeRes = await fetch(
            `https://api.github.com/repos/${cleanU}/${cleanR}/git/trees/${headSha}?recursive=1`,
            { headers }
          );
          if (treeRes.ok) {
            const treeData = await treeRes.json();
            if (Array.isArray(treeData?.tree)) {
              for (const node of treeData.tree) {
                if (node.type === 'blob' && node.path && node.sha) {
                  remoteTreeShaMap.set(node.path, node.sha);
                }
              }
            }
          }
        }
      }

      const added: DiffEntry[] = [];
      const modified: DiffEntry[] = [];
      const deleted: DiffEntry[] = [];
      let unchangedCount = 0;

      const localTargetPaths = new Set<string>();

      for (const file of activeFiles) {
        const relativeNormalized = sanitizeGitPath(file.path);
        if (!relativeNormalized) continue;
        const fullRepoPath = cleanSubdir ? `${cleanSubdir}/${relativeNormalized}` : relativeNormalized;
        localTargetPaths.add(fullRepoPath);

        const remoteSha = remoteTreeShaMap.get(fullRepoPath);
        if (!remoteSha) {
          added.push({ path: fullRepoPath, status: 'added', localSize: file.size });
        } else {
          const localSha = await computeGitBlobSha(file.content);
          if (localSha === remoteSha) {
            unchangedCount++;
          } else {
            modified.push({ path: fullRepoPath, status: 'modified', localSize: file.size });
          }
        }
      }

      if (forcePush && !cleanSubdir && !isNewRepoOrBranch) {
        for (const remotePath of remoteTreeShaMap.keys()) {
          if (!localTargetPaths.has(remotePath)) {
            deleted.push({ path: remotePath, status: 'deleted' });
          }
        }
      }

      setDiffResult({
        targetLabel: `${cleanU}/${cleanR} (${cleanB}${cleanSubdir ? ` · ${cleanSubdir}/` : ''})`,
        isNewRepoOrBranch,
        forcePush,
        targetSubdir: cleanSubdir,
        added,
        modified,
        deleted,
        unchangedCount
      });
    } catch (err: any) {
      setDiffError(err.message || '拉取远端树并比对差异失败');
      setDiffResult(null);
    } finally {
      setIsComputingDiff(false);
    }
  };

  const handleOpenDiffPreview = () => {
    setDiffModalOpen(true);
    computeRemoteDiff();
  };

  // Pre-upload entry point: runs secret scan first, asks confirmation if findings exist
  const handleInitiateUpload = () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setUploadError('请先填入您的 GitHub Personal Access Token (PAT) 密钥');
      return;
    }

    let cleanUsername = username.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/^\/+/, '').split('/')[0];
    let cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+/, '');
    if (cleanRepo.includes('/')) {
      const parts = cleanRepo.split('/');
      cleanUsername = parts[0];
      cleanRepo = parts[1];
    }

    if (!cleanUsername || cleanUsername === 'your-username' || !cleanRepo || cleanRepo === 'your-repository') {
      setUploadError('请在配置栏填写您实际的 GitHub 用户名与仓库名称');
      return;
    }
    const activeFiles = extractedFiles.filter((f) => !excludedPaths.has(f.path));
    if (activeFiles.length === 0) {
      setUploadError('尚未选中任何待上传文件，请先上传压缩包或取消排除文件');
      return;
    }

    const findings = scanFilesForSecrets(activeFiles);
    if (findings.length > 0) {
      setSecurityFindings(findings);
      return;
    }

    executeUploadToGithub();
  };

  // Core concurrent upload pipeline
  const executeUploadToGithub = async (overrides?: { overrideUsername?: string; overrideRepo?: string }) => {
    setSecurityFindings([]);
    const uploadStartTime = performance.now();
    const cleanToken = token.trim();
    const activeFiles = extractedFiles.filter((f) => !excludedPaths.has(f.path));

    const rawUser = overrides?.overrideUsername ?? username;
    const rawRepo = overrides?.overrideRepo ?? repo;
    let cleanUsername = rawUser.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/^\/+/, '').split('/')[0];
    let cleanRepo = rawRepo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+/, '');
    if (cleanRepo.includes('/')) {
      const parts = cleanRepo.split('/');
      cleanUsername = parts[0];
      cleanRepo = parts[1];
    }
    const cleanBranch = branch.trim() || 'main';
    const cleanSubdir = sanitizeGitPath(targetSubdir);

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);
    setErrorDiagnostics(null);
    setLatestActionRun(null);
    setUploadProgress(5);

    const headers = {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    try {
      addLog(
        `开始连接 GitHub 目标仓库: ${cleanUsername}/${cleanRepo} (${cleanBranch} 分支${
          cleanSubdir ? ` · 子目录 ${cleanSubdir}/` : ''
        })`,
        'info'
      );

      setCurrentStepText('正在预检 GitHub 目标仓库访问权限...');
      const repoUrl = `https://api.github.com/repos/${cleanUsername}/${cleanRepo}`;
      const repoCheckRes = await robustFetch(repoUrl, { headers }, 2, 8000);

      if (!repoCheckRes.ok) {
        if (repoCheckRes.status === 401) {
          throw new Error('GitHub PAT Token 无效或已被撤销，请检查 Token 并重新输入');
        } else if (repoCheckRes.status === 404) {
          throw new Error(
            `未找到目标仓库 [${cleanUsername}/${cleanRepo}]。请检查：1. 用户名与仓库名拼写 2. 若为私有仓库，需确保 PAT Token 勾选了 repo 权限`
          );
        } else if (repoCheckRes.status === 403) {
          throw new Error('PAT Token 权限不足或被 GitHub 限流，请确认创建 Token 时勾选了 repo 读写权限');
        }
      } else {
        const repoData = await repoCheckRes.json().catch(() => ({}));
        if (repoData.private) {
          addLog('目标仓库为私有仓库 (Private Repo)，已确认 Access Token 权限有效', 'info');
        }
      }

      const oversized = activeFiles.filter((f) => f.size > 50 * 1024 * 1024);
      if (oversized.length > 0) {
        const names = oversized.map((f) => f.path).join(', ');
        addLog(`警告: 检测到大文件超过 50MB [${names}]，GitHub REST API 传输此类大文件可能失败`, 'info');
      }

      setCurrentStepText('正在读取 GitHub 仓库分支 HEAD 状态...');
      const refUrl = `https://api.github.com/repos/${cleanUsername}/${cleanRepo}/git/ref/heads/${cleanBranch}`;

      let parentCommitSha: string | null = null;
      try {
        const refRes = await robustFetch(refUrl, { headers }, 2, 10000);
        if (refRes.ok) {
          const refData = await refRes.json();
          parentCommitSha = refData.object.sha;
          addLog(`成功获取 HEAD 提交: ${parentCommitSha?.substring(0, 7)}`, 'success');
        } else if (refRes.status === 404 || refRes.status === 409) {
          addLog(`目标分支 ${cleanBranch} 不存在或仓库为空，准备自动创建初始节点...`, 'info');
        }
      } catch (err: any) {
        addLog(`检查分支状态跳过 (将作为新提交处理): ${err.message || ''}`, 'info');
      }

      if (!parentCommitSha) {
        addLog('检测到目标仓库无基准提交，正在自动初始化首个 Commit 节点...', 'info');
        setCurrentStepText('正在建立仓库初始提交...');

        const initUrl = `https://api.github.com/repos/${cleanUsername}/${cleanRepo}/contents/.gitkeep`;
        const initRes = await robustFetch(
          initUrl,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: commitMessage.trim() || 'initial commit',
              content: btoa('# Initialized by ZipDeploy'),
              branch: cleanBranch
            })
          },
          3
        );

        if (!initRes.ok && initRes.status !== 422) {
          const errData = await initRes.json().catch(() => ({}));
          throw new Error(`初始化空仓库失败: ${formatApiError(errData, initRes.statusText)}`);
        }

        try {
          const newRefRes = await robustFetch(refUrl, { headers }, 2, 10000);
          if (newRefRes.ok) {
            const newRefData = await newRefRes.json();
            parentCommitSha = newRefData.object.sha;
            addLog(`空仓库自动初始化成功！已获得基准 Commit: ${parentCommitSha?.substring(0, 7)}`, 'success');
          }
        } catch {
          // ignore
        }
      }

      setUploadProgress(12);

      // Fetch remote tree SHA map for zero-upload deduplication when parent commit exists
      const remoteTreeShaMap = new Map<string, string>();
      if (parentCommitSha) {
        try {
          setCurrentStepText('正在比对远端文件指纹以跳过未变动文件...');
          const remoteTreeRes = await robustFetch(
            `https://api.github.com/repos/${cleanUsername}/${cleanRepo}/git/trees/${parentCommitSha}?recursive=1`,
            { headers },
            2,
            12000
          );
          if (remoteTreeRes.ok) {
            const remoteTreeData = await remoteTreeRes.json();
            if (Array.isArray(remoteTreeData?.tree)) {
              for (const node of remoteTreeData.tree) {
                if (node.type === 'blob' && node.path && node.sha) {
                  remoteTreeShaMap.set(node.path, node.sha);
                }
              }
            }
          }
        } catch {
          // Non-fatal: continue without remote tree diff
        }
      }

      setUploadProgress(15);

      // Build upload target list with optional subdirectory prefix
      const uploadTargets = activeFiles
        .map((file) => {
          const relativeNormalized = sanitizeGitPath(file.path);
          if (!relativeNormalized) return null;
          const fullRepoPath = cleanSubdir ? `${cleanSubdir}/${relativeNormalized}` : relativeNormalized;
          return { file, fullRepoPath };
        })
        .filter((x): x is { file: ExtractedFile; fullRepoPath: string } => x !== null);

      let lastUploadedStats = { total: uploadTargets.length, uploaded: uploadTargets.length, reused: 0 };

      const uploadAllBlobs = async (useCacheAndRemoteDiff = true) => {
        const items: ({ path: string; mode: string; type: string; sha: string } | null)[] = new Array(
          uploadTargets.length
        ).fill(null);

        let completedCount = 0;
        let cacheOrRemoteHits = 0;
        let maxActiveWorkers = 5;
        let throttledFlag = false;

        const onRateLimitHit = () => {
          if (!throttledFlag) {
            throttledFlag = true;
            maxActiveWorkers = 2;
          }
        };

        let nextIndex = 0;

        const worker = async () => {
          while (true) {
            // Dynamic concurrency throttling check
            const myIndex = nextIndex++;
            if (myIndex >= uploadTargets.length) break;

            const { file, fullRepoPath } = uploadTargets[myIndex];
            const cacheKey = `${cleanUsername}/${cleanRepo}:${fullRepoPath}_${file.size}`;
            let blobSha: string | undefined = useCacheAndRemoteDiff
              ? blobShaCacheRef.current.get(cacheKey)
              : undefined;

            // Lossless SHA-1 comparison against remote repository blob SHA
            if (!blobSha && useCacheAndRemoteDiff && remoteTreeShaMap.has(fullRepoPath)) {
              try {
                const localGitSha = await computeGitBlobSha(file.content);
                if (remoteTreeShaMap.get(fullRepoPath) === localGitSha) {
                  blobSha = localGitSha;
                  blobShaCacheRef.current.set(cacheKey, blobSha);
                }
              } catch {
                // fallback to uploading if crypto.subtle unavailable
              }
            }

            if (blobSha) {
              cacheOrRemoteHits++;
            } else {
              // Slight pacing if throttled
              if (throttledFlag) {
                await new Promise((r) => setTimeout(r, 150));
              }

              const base64Content = await uint8ToBase64Fast(file.content);
              const blobUrl = `https://api.github.com/repos/${cleanUsername}/${cleanRepo}/git/blobs`;

              const blobRes = await robustFetch(
                blobUrl,
                {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    content: base64Content,
                    encoding: 'base64'
                  })
                },
                4,
                30000,
                onRateLimitHit
              );

              if (!blobRes.ok) {
                const errData = await blobRes.json().catch(() => ({}));
                throw new Error(
                  `文件 [${fullRepoPath}] 上传失败 (${blobRes.status}): ${formatApiError(errData, blobRes.statusText)}`
                );
              }

              const blobData = await blobRes.json();
              blobSha = blobData.sha as string;
              blobShaCacheRef.current.set(cacheKey, blobSha);
            }

            items[myIndex] = {
              path: fullRepoPath,
              mode: '100644',
              type: 'blob',
              sha: blobSha
            };

            completedCount++;
            const progressPercent = Math.floor(15 + (completedCount / uploadTargets.length) * 60);
            setUploadProgress(progressPercent);
            setCurrentStepText(`并发同步进度 (${completedCount}/${uploadTargets.length}): ${fullRepoPath}`);
          }
        };

        setCurrentStepText(`正在以受控并发队列处理 ${uploadTargets.length} 个文件...`);
        const initialWorkers = Array.from({ length: Math.min(maxActiveWorkers, uploadTargets.length) }, () => worker());
        await Promise.all(initialWorkers);

        const validItems = items.filter(
          (item): item is { path: string; mode: string; type: string; sha: string } => item !== null
        );

        lastUploadedStats = {
          total: uploadTargets.length,
          uploaded: uploadTargets.length - cacheOrRemoteHits,
          reused: cacheOrRemoteHits
        };

        if (cacheOrRemoteHits > 0) {
          addLog(
            `已完成全部 ${uploadTargets.length} 个文件处理 (零流量跳过未修改/缓存文件 ${cacheOrRemoteHits} 个，实际上传 ${
              uploadTargets.length - cacheOrRemoteHits
            } 个)`,
            'success'
          );
        } else {
          addLog(`已完成全部 ${uploadTargets.length} 个文件的并发 Git Blob 构建`, 'success');
        }
        return validItems;
      };

      let treeItems = await uploadAllBlobs(true);
      setUploadProgress(80);

      // 3. Create Git Tree
      setCurrentStepText('正在生成 Git Tree 目录对象...');
      const treeUrl = `https://api.github.com/repos/${cleanUsername}/${cleanRepo}/git/trees`;

      // In subfolder deploy mode, preserve base_tree so files outside targetSubdir aren't deleted!
      const useBaseTree = Boolean(cleanSubdir) || (!forcePush && Boolean(parentCommitSha));
      const treeBody: any = { tree: treeItems };
      if (useBaseTree && parentCommitSha) {
        treeBody.base_tree = parentCommitSha;
      }

      let treeRes = await robustFetch(
        treeUrl,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(treeBody)
        },
        3
      );

      if (!treeRes.ok) {
        const errData = await treeRes.json().catch(() => ({}));
        const errDetail = formatApiError(errData, treeRes.statusText);

        if (errDetail.includes('is not a valid blob') || errDetail.includes('invalid blob')) {
          addLog('检测到部分缓存 Blob 节点失效，正在自动清除无效缓存并全量重新传输...', 'info');
          blobShaCacheRef.current.clear();

          treeItems = await uploadAllBlobs(false);
          treeBody.tree = treeItems;

          treeRes = await robustFetch(
            treeUrl,
            {
              method: 'POST',
              headers,
              body: JSON.stringify(treeBody)
            },
            3
          );
        }

        if (!treeRes.ok) {
          const finalErrData = await treeRes.json().catch(() => ({}));
          throw new Error(`创建 Git Tree 目录节点失败: ${formatApiError(finalErrData, treeRes.statusText)}`);
        }
      }

      const treeData = await treeRes.json();
      addLog(`Git Tree 对象构建成功 (SHA: ${treeData.sha.substring(0, 7)})`, 'success');
      setUploadProgress(90);

      // 4. Create Commit
      setCurrentStepText('正在生成 Commit 提交对象...');
      const commitUrl = `https://api.github.com/repos/${cleanUsername}/${cleanRepo}/git/commits`;

      const cleanEmail =
        email && email.trim().includes('@') ? email.trim() : `${cleanUsername}@users.noreply.github.com`;
      const cleanName = cleanUsername || 'ZipDeploy User';

      const commitBody: any = {
        message: commitMessage.trim() || 'refactor: auto deploy unzipped contents',
        tree: treeData.sha,
        parents: parentCommitSha ? [parentCommitSha] : [],
        author: {
          name: cleanName,
          email: cleanEmail,
          date: new Date().toISOString()
        }
      };

      let commitRes = await robustFetch(
        commitUrl,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(commitBody)
        },
        3
      );

      if (!commitRes.ok && commitRes.status === 422) {
        addLog('提交触发 GitHub 422 校验，正在自动重试 (省略自定义 Author)...', 'info');
        delete commitBody.author;
        commitRes = await robustFetch(
          commitUrl,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(commitBody)
          },
          2
        );

        if (!commitRes.ok && commitRes.status === 422 && commitBody.parents && commitBody.parents.length > 0) {
          addLog('尝试切换为独立 Root Commit 节点重试...', 'info');
          commitBody.parents = [];
          commitRes = await robustFetch(
            commitUrl,
            {
              method: 'POST',
              headers,
              body: JSON.stringify(commitBody)
            },
            2
          );
        }
      }

      if (!commitRes.ok) {
        const errData = await commitRes.json().catch(() => ({}));
        throw new Error(`创建 Commit 记录失败: ${formatApiError(errData, commitRes.statusText)}`);
      }

      const commitData = await commitRes.json();
      addLog(`Commit 记录已生成 (SHA: ${commitData.sha.substring(0, 7)})`, 'success');
      setUploadProgress(95);

      // 5. Update Branch Ref
      setCurrentStepText(`正在将 ${cleanBranch} 分支更新指向至新提交...`);
      const updateRefUrl = `https://api.github.com/repos/${cleanUsername}/${cleanRepo}/git/refs/heads/${cleanBranch}`;
      const updateRefRes = await robustFetch(
        updateRefUrl,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            sha: commitData.sha,
            force: forcePush
          })
        },
        3
      );

      if (!updateRefRes.ok) {
        if (updateRefRes.status === 404 || updateRefRes.status === 409 || updateRefRes.status === 422) {
          const createRefUrl = `https://api.github.com/repos/${cleanUsername}/${cleanRepo}/git/refs`;
          const createRefRes = await robustFetch(
            createRefUrl,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                ref: `refs/heads/${cleanBranch}`,
                sha: commitData.sha
              })
            },
            3
          );
          if (!createRefRes.ok) {
            const errData = await createRefRes.json().catch(() => ({}));
            throw new Error(`创建新分支 ${cleanBranch} 失败: ${formatApiError(errData, createRefRes.statusText)}`);
          }
        } else {
          const errData = await updateRefRes.json().catch(() => ({}));
          throw new Error(`更新分支 ${cleanBranch} 引用失败: ${formatApiError(errData, updateRefRes.statusText)}`);
        }
      }

      setUploadProgress(100);
      setIsUploading(false);
      setUploadSuccess(true);
      addLog('部署成功！远端 GitHub 仓库文件已更新。', 'success');

      const newRecord: DeployHistoryRecord = {
        id: `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        username: cleanUsername,
        repo: cleanRepo,
        branch: cleanBranch,
        targetSubdir: cleanSubdir,
        commitMessage: commitMessage.trim() || 'refactor: auto deploy unzipped contents',
        commitSha: commitData.sha,
        commitUrl: commitData.html_url || `https://github.com/${cleanUsername}/${cleanRepo}/commit/${commitData.sha}`,
        sourceName: sourceInfo?.name || 'package.zip',
        sourceKind: sourceInfo?.kind || 'zip',
        totalFiles: lastUploadedStats.total,
        uploadedFiles: lastUploadedStats.uploaded,
        reusedFiles: lastUploadedStats.reused,
        durationMs: Math.round(performance.now() - uploadStartTime),
        forcePush
      };
      setDeployHistory((prev) => [newRecord, ...prev].slice(0, 50));

      triggerPagesAutoSetup();
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);

      const rawError = err.message || '网络连接中断或 API 授权失效';
      const diag = analyzeError(rawError, cleanUsername, cleanRepo, cleanBranch);

      if (diag.code === 'ERR_CACHE_BLOB_EXPIRED') {
        blobShaCacheRef.current.clear();
      }

      setErrorDiagnostics(diag);
      setUploadError(diag.reason);
      addLog(`部署中断 [${diag.code}]: ${diag.title} - ${diag.reason}`, 'error');
    }
  };

  const handleApplyHistoryConfig = (record: DeployHistoryRecord) => {
    setUsername(record.username);
    setRepo(record.repo);
    setBranch(record.branch);
    setTargetSubdir(record.targetSubdir);
    setForcePush(record.forcePush);
    setActiveProfileId('');
    setActiveView('deploy');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasConfiguredRepo =
    username !== 'your-username' && repo !== 'your-repository' && username.trim() && repo.trim();

  return (
    <div className="min-h-screen flex bg-[#ECEDEF] dark:bg-[#0C0D0F] text-[#141414] dark:text-[#F4F4F5] transition-colors duration-150 overflow-x-hidden">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        theme={theme}
        onToggleTheme={toggleTheme}
        isRefreshingSite={isRefreshingSite}
        onForceUpdateSite={handleForceUpdateSite}
        onOpenSecurityNotice={() => setWelcomeModalOpen(true)}
        deployHistoryCount={deployHistory.length}
        onOpenDeployHistory={() => setHistoryModalOpen(true)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Right Main Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Top Contextual Header */}
        <header className="h-[68px] sm:h-[72px] px-4 sm:px-8 lg:px-10 border-b border-black/[0.06] dark:border-white/[0.07] bg-[#ECEDEF]/85 dark:bg-[#0C0D0F]/85 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-white/10 transition-colors shrink-0"
              aria-label="打开导航菜单"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs min-w-0">
              <span className="font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap hidden sm:inline">
                zipdeploy
              </span>
              <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-[#141414] dark:text-white truncate">
                {VIEW_TITLES[activeView]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="lg:hidden p-2 rounded-full text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#17181C] border border-black/[0.05] dark:border-white/[0.08] transition-colors shrink-0"
              aria-label="切换明暗主题"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => openQuickDrawer('guide')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-medium text-[#141414] dark:text-white bg-white dark:bg-[#17181C] border border-black/[0.05] dark:border-white/[0.08] hover:shadow-sm transition-all shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>
                速查<span className="hidden sm:inline">抽屉</span>
              </span>
            </button>

            {hasConfiguredRepo && (
              <a
                href={`https://github.com/${username}/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity shadow-[0_4px_14px_-2px_rgba(0,0,0,0.2)] whitespace-nowrap shrink-0"
              >
                <Github className="w-3.5 h-3.5" />
                <span>
                  <span className="hidden sm:inline">目标</span>仓库
                </span>
                <ArrowUpRight className="w-3 h-3 opacity-75" />
              </a>
            )}
          </div>
        </header>

        {/* Active View Viewport */}
        <main className="flex-1 px-4 sm:px-8 lg:px-10 py-6 sm:py-8 max-w-[1300px] w-full mx-auto min-w-0">
          {activeView === 'deploy' && (
            <DeployWorkspace
              token={token}
              setToken={setToken}
              showToken={showToken}
              setShowToken={setShowToken}
              username={username}
              setUsername={setUsername}
              repo={repo}
              setRepo={setRepo}
              email={email}
              setEmail={setEmail}
              branch={branch}
              setBranch={setBranch}
              targetSubdir={targetSubdir}
              setTargetSubdir={setTargetSubdir}
              commitMessage={commitMessage}
              setCommitMessage={setCommitMessage}
              forcePush={forcePush}
              setForcePush={setForcePush}
              autoInjectPagesAction={autoInjectPagesAction}
              setAutoInjectPagesAction={setAutoInjectPagesAction}
              saveLocally={saveLocally}
              setSaveLocally={setSaveLocally}
              onClearSaved={handleClearSaved}
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSelectProfile={handleSelectProfile}
              onSaveProfile={handleSaveProfile}
              onDeleteProfile={handleDeleteProfile}
              isCheckingToken={isCheckingToken}
              tokenCheckResult={tokenCheckResult}
              onCheckToken={handleCheckToken}
              onOpenRollback={handleOpenRollback}
              onOpenCreateRepo={handleOpenCreateRepo}
              onOpenDiffPreview={handleOpenDiffPreview}
              fileInputRef={fileInputRef}
              folderInputRef={folderInputRef}
              sourceInfo={sourceInfo}
              extractedFiles={extractedFiles}
              excludedPaths={excludedPaths}
              onToggleExcludeFile={handleToggleExcludeFile}
              onExcludeAllLargeFiles={handleExcludeAllLargeFiles}
              onRestoreAllExcluded={handleRestoreAllExcluded}
              isUnzipping={isUnzipping}
              unzipError={unzipError}
              fileSearch={fileSearch}
              setFileSearch={setFileSearch}
              visibleFileCount={visibleFileCount}
              setVisibleFileCount={setVisibleFileCount}
              ignoreNodeModules={ignoreNodeModules}
              filterStats={filterStats}
              onFileChange={handleFileChange}
              onFolderChange={handleFolderChange}
              onDrop={handleDrop}
              onGenerateSampleZip={handleGenerateSampleZip}
              onToggleNodeModules={handleToggleNodeModules}
              onPreviewFile={setPreviewFile}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              currentStepText={currentStepText}
              logs={logs}
              uploadSuccess={uploadSuccess}
              uploadError={uploadError}
              errorDiagnostics={errorDiagnostics}
              pagesStatus={pagesStatus}
              isTriggeringPages={isTriggeringPages}
              onUploadToGithub={handleInitiateUpload}
              onTriggerPagesAutoSetup={triggerPagesAutoSetup}
              latestActionRun={latestActionRun}
              isPollingActions={isPollingActions}
              onRefreshActionRun={fetchLatestActionRun}
              onOpenQuickDrawer={openQuickDrawer}
            />
          )}

          {activeView === 'guide' && <GuideView onNavigateView={setActiveView} />}

          {activeView === 'scripts' && (
            <ScriptsView
              username={username}
              repo={repo}
              email={email}
              branch={branch}
              token={token}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />
          )}

          {activeView === 'faq' && <FaqView />}
        </main>
      </div>

      {/* Slide-Over Quick Reference Drawer */}
      <QuickDrawer
        activeTab={quickDrawerTab}
        onChangeTab={(tab) => setQuickDrawerTab(tab)}
        onClose={() => setQuickDrawerTab(null)}
        onNavigateFullView={setActiveView}
        initialQuery={quickDrawerQuery}
      />

      {/* First-Visit Safety & Privacy Notice Modal */}
      <WelcomeModal
        open={welcomeModalOpen}
        isFirstVisit={!hasAcceptedWelcome}
        onAccept={handleAcceptWelcome}
        onClose={() => setWelcomeModalOpen(false)}
      />

      {/* Pre-Push Secret Detection Confirmation Modal */}
      <SecurityWarningModal
        findings={securityFindings}
        onCancel={() => setSecurityFindings([])}
        onConfirmProceed={executeUploadToGithub}
      />

      {/* Instant Extracted File Preview Modal */}
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

      {/* Commit History & Instant Rollback Modal */}
      <RollbackModal
        open={rollbackModalOpen}
        onClose={() => setRollbackModalOpen(false)}
        username={username}
        repo={repo}
        branch={branch}
        commits={rollbackCommits}
        isLoading={isLoadingCommits}
        error={rollbackError}
        isRollingBack={isRollingBack}
        rollbackSuccessSha={rollbackSuccessSha}
        onRefresh={fetchCommitHistory}
        onRollbackToSha={handleRollbackToSha}
      />

      {/* One-Click Create Repository Modal */}
      <CreateRepoModal
        open={createRepoModalOpen}
        onClose={() => setCreateRepoModalOpen(false)}
        defaultRepoName={repo}
        hasExtractedFiles={extractedFiles.length - excludedPaths.size > 0}
        isCreating={isCreatingRepo}
        error={createRepoError}
        createdSuccessName={createdRepoSuccessName}
        onCreateRepo={handleCreateRepo}
      />

      {/* Pre-Push Diff Preview Modal */}
      <DiffPreviewModal
        open={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        isLoading={isComputingDiff}
        error={diffError}
        result={diffResult}
        onRefresh={computeRemoteDiff}
        onConfirmPush={() => {
          setDiffModalOpen(false);
          handleInitiateUpload();
        }}
      />

      {/* Local Deploy History Modal */}
      <DeployHistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        records={deployHistory}
        onApplyConfig={handleApplyHistoryConfig}
        onClearHistory={() => setDeployHistory([])}
      />
    </div>
  );
}
