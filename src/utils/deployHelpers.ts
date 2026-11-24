import type { ExtractedFile } from '../data/knowledgeBase';

export interface WorkspaceProfile {
  id: string;
  name: string;
  username: string;
  repo: string;
  email: string;
  branch: string;
  targetSubdir: string;
  commitMessage: string;
  forcePush: boolean;
  autoInjectPagesAction: boolean;
}

export interface SecurityFinding {
  path: string;
  rule: string;
  preview: string;
}

export interface TokenCheckResult {
  status: 'ok' | 'warning' | 'error';
  login?: string;
  scopes?: string;
  rateRemaining?: number;
  rateLimit?: number;
  repoWritable?: boolean | null;
  repoNotFound?: boolean;
  message: string;
}

export interface ActionRunInfo {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | string;
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null | string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface CommitHistoryItem {
  sha: string;
  message: string;
  authorName: string;
  date: string;
  htmlUrl: string;
}

export interface DiffEntry {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  localSize?: number;
}

export interface DiffPreviewResult {
  targetLabel: string;
  isNewRepoOrBranch: boolean;
  forcePush: boolean;
  targetSubdir: string;
  added: DiffEntry[];
  modified: DiffEntry[];
  deleted: DiffEntry[];
  unchangedCount: number;
}

export interface DeployHistoryRecord {
  id: string;
  timestamp: string;
  username: string;
  repo: string;
  branch: string;
  targetSubdir: string;
  commitMessage: string;
  commitSha: string;
  commitUrl: string;
  sourceName: string;
  sourceKind: 'zip' | 'folder';
  totalFiles: number;
  uploadedFiles: number;
  reusedFiles: number;
  durationMs: number;
  forcePush: boolean;
}

export const LARGE_FILE_WARN_BYTES = 25 * 1024 * 1024;
export const LARGE_FILE_CRITICAL_BYTES = 95 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Lossless fast conversion from Uint8Array to Base64 using native FileReader for larger buffers.
 */
export async function uint8ToBase64Fast(uint8: Uint8Array): Promise<string> {
  if (uint8.byteLength <= 16 * 1024) {
    let binary = '';
    const len = uint8.length;
    const chunkSize = 1024;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = uint8.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    return btoa(binary);
  }

  return new Promise<string>((resolve, reject) => {
    const safeBytes = new Uint8Array(uint8);
    const blob = new Blob([safeBytes], { type: 'application/octet-stream' });
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      } else {
        reject(new Error('Base64 转换结果异常'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader Base64 转换失败'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Computes exact Git Blob SHA-1 ("blob <byteLength>\0<bytes>") in the browser.
 * Enables 100% lossless zero-upload deduplication against remote Git tree SHAs.
 */
export async function computeGitBlobSha(uint8: Uint8Array): Promise<string> {
  const header = new TextEncoder().encode(`blob ${uint8.byteLength}\0`);
  const combined = new Uint8Array(header.byteLength + uint8.byteLength);
  combined.set(header, 0);
  combined.set(uint8, header.byteLength);

  const hashBuffer = await crypto.subtle.digest('SHA-1', combined.buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'avif', 'svg']);
const TEXT_EXTENSIONS = new Set([
  'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'mjs', 'cjs',
  'ts', 'tsx', 'json', 'jsonc', 'md', 'markdown', 'mdx', 'txt', 'yml', 'yaml',
  'xml', 'svg', 'sh', 'bash', 'zsh', 'env', 'gitignore', 'gitattributes',
  'npmrc', 'nvmrc', 'toml', 'ini', 'conf', 'cfg', 'sql', 'py', 'rb', 'go',
  'rs', 'java', 'kt', 'swift', 'c', 'cpp', 'h', 'hpp', 'vue', 'svelte',
  'astro', 'prisma', 'graphql', 'gql', 'lock', 'csv', 'tsv', 'dockerfile'
]);

export function getFileExtension(path: string): string {
  const base = path.split('/').pop() || '';
  if (!base.includes('.')) {
    return base.toLowerCase();
  }
  return base.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(path: string): boolean {
  return IMAGE_EXTENSIONS.has(getFileExtension(path));
}

export function isTextFile(path: string): boolean {
  const base = (path.split('/').pop() || '').toLowerCase();
  if (
    base === 'dockerfile' ||
    base === 'makefile' ||
    base === 'cname' ||
    base === 'license' ||
    base === 'readme' ||
    base.startsWith('.env') ||
    base === '.gitignore' ||
    base === '.nojekyll'
  ) {
    return true;
  }
  return TEXT_EXTENSIONS.has(getFileExtension(path));
}

function maskSecret(raw: string): string {
  if (raw.length <= 10) return '••••••••';
  return `${raw.slice(0, 5)}••••${raw.slice(-4)}`;
}

const SECRET_RULES: { name: string; regex: RegExp }[] = [
  { name: 'GitHub Classic Token (ghp_)', regex: /\bghp_[A-Za-z0-9]{20,}\b/ },
  { name: 'GitHub Fine-grained PAT', regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: 'GitHub OAuth / App Token', regex: /\b(gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/ },
  { name: '私钥证书 (Private Key)', regex: /-----BEGIN (RSA|OPENSSH|EC|DSA|PGP|PRIVATE) PRIVATE KEY-----/ },
  { name: 'OpenAI / sk- 密钥', regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API Key (AIza)', regex: /\bAIza[0-9A-Za-z\-_]{35}\b/ }
];

export function scanFilesForSecrets(files: ExtractedFile[]): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const decoder = new TextDecoder('utf-8', { fatal: false });

  for (const file of files) {
    const base = (file.path.split('/').pop() || '').toLowerCase();

    // Flag non-example .env files that contain non-empty values
    if (
      (base === '.env' || base.startsWith('.env.')) &&
      !base.includes('example') &&
      !base.includes('sample') &&
      !base.includes('template')
    ) {
      findings.push({
        path: file.path,
        rule: '环境变量配置文件 (.env)',
        preview: '可能包含本地敏感环境变量或 API 密钥'
      });
      continue;
    }

    // Only scan reasonable-sized text files
    if (!isTextFile(file.path) || file.size > 512 * 1024) continue;

    const text = decoder.decode(file.content);
    for (const rule of SECRET_RULES) {
      const match = text.match(rule.regex);
      if (match) {
        findings.push({
          path: file.path,
          rule: rule.name,
          preview: maskSecret(match[0])
        });
        break;
      }
    }
  }

  return findings;
}
