import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  Upload, 
  FileArchive, 
  CheckCircle2, 
  XCircle, 
  Key, 
  User, 
  Github, 
  Mail, 
  GitBranch, 
  FileText, 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  FolderTree, 
  ExternalLink,
  Code2,
  FileCode,
  Eye,
  EyeOff,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Search,
  Trash2,
  Play,
  Save,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

interface ExtractedFile {
  path: string;
  size: number;
  isDir: boolean;
  contentPromise: () => Promise<Uint8Array>;
}

interface UploadLog {
  id: string;
  time: string;
  message: string;
  status: 'pending' | 'success' | 'error' | 'info';
}

export default function App() {
  // Config States (Persisted locally for user convenience)
  const [token, setToken] = useState<string>(() => localStorage.getItem('zd_token') || '');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(() => localStorage.getItem('zd_username') || 'your-username');
  const [repo, setRepo] = useState<string>(() => localStorage.getItem('zd_repo') || 'your-repository');
  const [email, setEmail] = useState<string>(() => localStorage.getItem('zd_email') || 'user@example.com');
  const [branch, setBranch] = useState<string>(() => localStorage.getItem('zd_branch') || 'main');
  const [commitMessage, setCommitMessage] = useState<string>('refactor: auto deploy unzipped contents');
  const [forcePush, setForcePush] = useState<boolean>(true);
  const [saveLocally, setSaveLocally] = useState<boolean>(true);

  // Save settings to localStorage
  useEffect(() => {
    if (saveLocally) {
      if (token) localStorage.setItem('zd_token', token);
      if (username) localStorage.setItem('zd_username', username);
      if (repo) localStorage.setItem('zd_repo', repo);
      if (email) localStorage.setItem('zd_email', email);
      if (branch) localStorage.setItem('zd_branch', branch);
    }
  }, [token, username, repo, email, branch, saveLocally]);

  // File Extraction States
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [isUnzipping, setIsUnzipping] = useState<boolean>(false);
  const [unzipError, setUnzipError] = useState<string | null>(null);
  const [fileSearch, setFileSearch] = useState<string>('');

  // Upload Progress States
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'browser-upload' | 'termux-script' | 'github-action' | 'faq'>('browser-upload');
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string, status: 'pending' | 'success' | 'error' | 'info' = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { id: Math.random().toString(), time: timeStr, message, status }]);
  };

  const handleClearSaved = () => {
    localStorage.removeItem('zd_token');
    localStorage.removeItem('zd_username');
    localStorage.removeItem('zd_repo');
    localStorage.removeItem('zd_email');
    localStorage.removeItem('zd_branch');
    setToken('');
    setUsername('your-username');
    setRepo('your-repository');
    setEmail('user@example.com');
    setBranch('main');
  };

  // Generate a sample ZIP in memory for testing
  const handleGenerateSampleZip = async () => {
    setIsUnzipping(true);
    setUnzipError(null);
    setUploadSuccess(false);
    setUploadError(null);
    setLogs([]);

    try {
      const zip = new JSZip();
      zip.file("index.html", "<!DOCTYPE html>\n<html>\n<head>\n  <title>Sample Site</title>\n</head>\n<body>\n  <h1>Hello from ZipDeploy!</h1>\n</body>\n</html>");
      zip.file("css/style.css", "body { background: #f7f7f6; font-family: sans-serif; }");
      zip.file("README.md", "# Sample Project\nDeployed via ZipDeploy Studio.");

      const blob = await zip.generateAsync({ type: "blob" });
      const sampleFile = new File([blob], "demo-sample-project.zip", { type: "application/zip" });
      await processZipFile(sampleFile);
    } catch (err: any) {
      setIsUnzipping(false);
      setUnzipError(`生成示例包失败: ${err.message}`);
    }
  };

  // Handle ZIP selection & extraction
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processZipFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.zip') || file.type.includes('zip'))) {
      await processZipFile(file);
    } else {
      setUnzipError('请上传标准的 .zip 格式压缩包');
    }
  };

  const processZipFile = async (file: File) => {
    setZipFile(file);
    setIsUnzipping(true);
    setUnzipError(null);
    setUploadSuccess(false);
    setUploadError(null);
    setLogs([]);

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const fileList: ExtractedFile[] = [];

      const paths = Object.keys(zipContent.files);
      const nonDirPaths = paths.filter(p => !zipContent.files[p].dir);

      // Detect if all files are inside a single outer folder wrapper
      let rootPrefix = '';
      if (nonDirPaths.length > 0) {
        const firstParts = nonDirPaths[0].split('/');
        if (firstParts.length > 1) {
          const potentialPrefix = firstParts[0] + '/';
          const allSharePrefix = nonDirPaths.every(p => p.startsWith(potentialPrefix));
          if (allSharePrefix) {
            rootPrefix = potentialPrefix;
          }
        }
      }

      zipContent.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;

        // Ignore macOS and system meta files
        if (relativePath.includes('__MACOSX/') || relativePath.endsWith('.DS_Store')) return;

        let cleanPath = relativePath;
        if (rootPrefix && cleanPath.startsWith(rootPrefix)) {
          cleanPath = cleanPath.substring(rootPrefix.length);
        }

        if (!cleanPath) return;

        fileList.push({
          path: cleanPath,
          size: (zipEntry as any)._data?.uncompressedSize || 0,
          isDir: false,
          contentPromise: () => zipEntry.async('uint8array')
        });
      });

      setExtractedFiles(fileList);
      setIsUnzipping(false);
    } catch (err: any) {
      console.error(err);
      setIsUnzipping(false);
      setUnzipError(`压缩包解析失败: ${err.message || '文件损坏或非标准 ZIP 格式'}`);
    }
  };

  // Convert Uint8Array to Base64
  const uint8ToBase64 = (uint8: Uint8Array): string => {
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  };

  // Direct GitHub REST API Deployment
  const handleUploadToGithub = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setUploadError('请先填入您的 GitHub Personal Access Token (PAT) 密钥');
      return;
    }
    if (username === 'your-username' || repo === 'your-repository' || !username.trim() || !repo.trim()) {
      setUploadError('请在上方填写您实际的 GitHub 用户名与仓库名称');
      return;
    }
    if (extractedFiles.length === 0) {
      setUploadError('尚未提取压缩包文件，请先上传 ZIP 包');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);
    setLogs([]);
    setUploadProgress(5);

    const headers = {
      'Authorization': `Bearer ${cleanToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    try {
      addLog(`连接 GitHub 目标仓库: ${username}/${repo} (${branch} 分支)`, 'info');

      // 1. Get HEAD ref
      setCurrentStepText('正在读取 GitHub 仓库分支 HEAD 状态...');
      const refUrl = `https://api.github.com/repos/${username}/${repo}/git/ref/heads/${branch}`;
      const refRes = await fetch(refUrl, { headers });

      let parentCommitSha: string | null = null;
      if (refRes.ok) {
        const refData = await refRes.json();
        parentCommitSha = refData.object.sha;
        addLog(`成功获取 HEAD 提交: ${parentCommitSha?.substring(0, 7)}`, 'success');
      } else {
        addLog(`未找到现存 ${branch} 分支，将建立全新初始提交`, 'info');
      }

      setUploadProgress(15);

      // 2. Upload Blobs
      setCurrentStepText(`正在依次构建并上传 ${extractedFiles.length} 个文件数据...`);
      const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];

      for (let i = 0; i < extractedFiles.length; i++) {
        const file = extractedFiles[i];
        const contentUint8 = await file.contentPromise();
        const base64Content = uint8ToBase64(contentUint8);

        const blobUrl = `https://api.github.com/repos/${username}/${repo}/git/blobs`;
        const blobRes = await fetch(blobUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: base64Content,
            encoding: 'base64'
          })
        });

        if (!blobRes.ok) {
          const errData = await blobRes.json().catch(() => ({}));
          throw new Error(`文件 [${file.path}] Blob 上传失败: ${errData.message || blobRes.statusText}`);
        }

        const blobData = await blobRes.json();
        treeItems.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        });

        const progressPercent = Math.floor(15 + ((i + 1) / extractedFiles.length) * 60);
        setUploadProgress(progressPercent);
        setCurrentStepText(`已处理 (${i + 1}/${extractedFiles.length}): ${file.path}`);
      }

      addLog(`已完成全部 ${extractedFiles.length} 个文件的 Git Blob 构建`, 'success');
      setUploadProgress(80);

      // 3. Create Git Tree
      setCurrentStepText('正在生成 Git Tree 目录对象...');
      const treeUrl = `https://api.github.com/repos/${username}/${repo}/git/trees`;
      
      const treeBody: any = { tree: treeItems };
      if (!forcePush && parentCommitSha) {
        treeBody.base_tree = parentCommitSha;
      }

      const treeRes = await fetch(treeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(treeBody)
      });

      if (!treeRes.ok) {
        const errData = await treeRes.json().catch(() => ({}));
        throw new Error(`创建 Git Tree 目录节点失败: ${errData.message || treeRes.statusText}`);
      }

      const treeData = await treeRes.json();
      addLog(`Git Tree 对象构建成功 (SHA: ${treeData.sha.substring(0, 7)})`, 'success');
      setUploadProgress(90);

      // 4. Create Commit
      setCurrentStepText('正在生成 Commit 提交对象...');
      const commitUrl = `https://api.github.com/repos/${username}/${repo}/git/commits`;
      const commitBody = {
        message: commitMessage || 'refactor: auto deploy unzipped contents',
        tree: treeData.sha,
        parents: parentCommitSha ? [parentCommitSha] : [],
        author: {
          name: username,
          email: email,
          date: new Date().toISOString()
        }
      };

      const commitRes = await fetch(commitUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(commitBody)
      });

      if (!commitRes.ok) {
        const errData = await commitRes.json().catch(() => ({}));
        throw new Error(`创建 Commit 记录失败: ${errData.message || commitRes.statusText}`);
      }

      const commitData = await commitRes.json();
      addLog(`Commit 记录已生成 (SHA: ${commitData.sha.substring(0, 7)})`, 'success');
      setUploadProgress(95);

      // 5. Update Branch Ref
      setCurrentStepText(`正在将 ${branch} 分支更新指向至新提交...`);
      const updateRefUrl = `https://api.github.com/repos/${username}/${repo}/git/refs/heads/${branch}`;
      const updateRefRes = await fetch(updateRefUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: commitData.sha,
          force: forcePush
        })
      });

      if (!updateRefRes.ok) {
        if (updateRefRes.status === 404) {
          const createRefUrl = `https://api.github.com/repos/${username}/${repo}/git/refs`;
          const createRefRes = await fetch(createRefUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              ref: `refs/heads/${branch}`,
              sha: commitData.sha
            })
          });
          if (!createRefRes.ok) {
            const errData = await createRefRes.json().catch(() => ({}));
            throw new Error(`创建新分支 ${branch} 失败: ${errData.message || createRefRes.statusText}`);
          }
        } else {
          const errData = await updateRefRes.json().catch(() => ({}));
          throw new Error(`更新分支 ${branch} 引用失败: ${errData.message || updateRefRes.statusText}`);
        }
      }

      setUploadProgress(100);
      setIsUploading(false);
      setUploadSuccess(true);
      addLog(`🎉 部署成功！远端 GitHub 仓库文件已被彻底覆写更新！`, 'success');

    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setUploadError(err.message || '网络连接中断或 API 授权失效');
      addLog(`❌ 部署中断: ${err.message}`, 'error');
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredFiles = extractedFiles.filter(f => 
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const actionYamlContent = `# .github/workflows/unzip-and-deploy.yml
# GitHub Actions 自动化解压与覆盖上传工作流

name: Auto Unzip and Deploy

on:
  push:
    paths: ['**.zip']
  workflow_dispatch:

jobs:
  unzip-and-commit:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: 📥 检出仓库分支
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.GH_PAT || secrets.GITHUB_TOKEN }}

      - name: 📦 查找并解压 ZIP 压缩包
        run: |
          ZIP_FILE=$(find . -maxdepth 2 -name "*.zip" | head -n 1)
          if [ -z "$ZIP_FILE" ]; then
            echo "未找到 ZIP 压缩包文件"
            exit 1
          fi
          echo "找到压缩包: $ZIP_FILE"

          mkdir -p temp_extracted
          unzip -q -o "$ZIP_FILE" -d temp_extracted
          rm "$ZIP_FILE"

          if [ $(ls -1 temp_extracted | wc -l) -eq 1 ] && [ -d temp_extracted/* ]; then
            echo "提取嵌套子文件夹层级..."
            cp -r temp_extracted/*/* . 2>/dev/null || true
            cp -r temp_extracted/*/.?* . 2>/dev/null || true
          else
            cp -r temp_extracted/* . 2>/dev/null || true
            cp -r temp_extracted/.?* . 2>/dev/null || true
          fi
          rm -rf temp_extracted

      - name: 🚀 提交并更新仓库全量文件
        run: |
          git config user.name "${username}"
          git config user.email "${email}"
          git add -A
          if git diff --staged --quiet; then
            echo "无需更新的变动"
          else
            git commit -m "refactor: auto unzip and replace workspace contents"
            git push origin ${branch}
          fi`;

  const deployShContent = `#!/bin/bash
# Termux 本地一键解压并强推覆写 GitHub 仓库脚本

USERNAME="${username}"
REPO="${repo}"
EMAIL="${email}"
BRANCH="${branch}"
TOKEN="\${1:-${token || 'YOUR_GITHUB_TOKEN'}}";
ZIP_PATH="\${2:-/sdcard/project.zip}"

WORK_DIR="/sdcard/termux_zip_deploy_temp"
rm -rf "$WORK_DIR" && mkdir -p "$WORK_DIR"

echo "📦 正在解压 $ZIP_PATH 到临时工作区..."
unzip -q -o "$ZIP_PATH" -d "$WORK_DIR"
cd "$WORK_DIR" || exit 1

ITEM_COUNT=$(ls -1 | wc -l)
if [ "$ITEM_COUNT" -eq 1 ] && [ -d * ]; then
    cd * || exit 1
fi

echo "⚙️ 初始化 Git 并重置提交历史..."
rm -rf .git && git init
git config user.name "$USERNAME"
git config user.email "$EMAIL"
git add .
git commit -m "Upload unzipped files from $ZIP_PATH"
git branch -M "$BRANCH"

git remote add origin "https://\${TOKEN}@github.com/\${USERNAME}/\${REPO}.git"
echo "⬆️ 强制推送到 GitHub 远端..."
git push -u origin "$BRANCH" --force
rm -rf "$WORK_DIR"`;

  return (
    <div className="min-h-screen bg-[#f7f7f6] text-[#1c1c1c] font-sans antialiased selection:bg-neutral-200">
      
      {/* Top Navbar */}
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <FileArchive className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-neutral-900 tracking-tight">
                  ZipDeploy Studio
                </h1>
                <span className="text-[10px] font-mono font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                  Monochrome Edition
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-800" />
              <span>小白教程</span>
              {showGuide ? <ChevronUp className="w-3 h-3 text-neutral-400" /> : <ChevronDown className="w-3 h-3 text-neutral-400" />}
            </button>

            {username !== 'your-username' && repo !== 'your-repository' && (
              <a
                href={`https://github.com/${username}/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-white bg-black hover:bg-neutral-800 px-3.5 py-1.5 rounded-full transition shadow-sm"
              >
                <Github className="w-3.5 h-3.5" />
                <span>目标仓库</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Collapsible Beginner Guide Box */}
        {showGuide && (
          <div className="bg-white rounded-[28px] border border-neutral-200/80 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-800">
                  💡
                </span>
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                  零基础小白 3 分钟极速上手教程
                </h2>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="text-xs text-neutral-400 hover:text-neutral-700"
              >
                收起教程
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="bg-[#f9f9f8] border border-neutral-200/60 rounded-2xl p-4 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                    <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] shrink-0">1</span>
                    获取 GitHub Token (密钥)
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  打开 GitHub -&gt; Settings -&gt; Developer Settings -&gt; Personal Access Tokens (classic) -&gt; 新建 Token，务必勾选 <code className="bg-white px-1 py-0.5 border rounded text-neutral-800 font-mono">repo</code> 选项，生成的字符串就是 Token。
                </p>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=ZipDeploy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-800 hover:underline pt-1"
                >
                  直接前往 GitHub 创建 Token <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              {/* Step 2 */}
              <div className="bg-[#f9f9f8] border border-neutral-200/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] shrink-0">2</span>
                  填入账号与目标仓库
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  在下方设置区域填入 Token、你的 GitHub 用户名以及要覆盖的目标仓库名字。勾选“强制清空重置”会自动把以前传错的各种杂乱文件清理干净！
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#f9f9f8] border border-neutral-200/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] shrink-0">3</span>
                  拖入 ZIP 一键覆盖上传
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  将电脑或手机里的 <code className="bg-white px-1 py-0.5 border rounded text-neutral-800 font-mono">.zip</code> 文件拖入下方上传区，网页会在内存中秒速解压并直接发布覆盖 GitHub 仓库！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Card */}
        <section className="bg-white rounded-[28px] border border-neutral-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-neutral-800" /> 仓库参数配置
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSaved}
                className="text-[11px] text-neutral-400 hover:text-rose-600 flex items-center gap-1 transition"
                title="清空已保存的表单配置"
              >
                <Trash2 className="w-3 h-3" />
                <span>重置表单</span>
              </button>
              <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> REST API Direct Mode
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
            {/* Token */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-700 flex items-center gap-1.5 text-xs">
                  <Key className="w-3.5 h-3.5 text-neutral-800" /> GitHub Personal Access Token (PAT)
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 flex items-center gap-1 transition"
                >
                  {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showToken ? '隐藏' : '显示'}</span>
                </button>
              </div>

              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="在此粘贴 ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#f4f4f3] border border-neutral-200 focus:border-neutral-900 focus:bg-white rounded-2xl px-4 py-2.5 text-neutral-900 font-mono text-xs focus:outline-none transition"
              />
            </div>

            {/* Commit message */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-700 flex items-center gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-neutral-800" /> Commit 提交描述
              </label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="提交信息"
                className="w-full bg-[#f4f4f3] border border-neutral-200 focus:border-neutral-900 focus:bg-white rounded-2xl px-4 py-2.5 text-neutral-900 text-xs focus:outline-none transition"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-700 flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-neutral-800" /> GitHub 用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                className="w-full bg-[#f4f4f3] border border-neutral-200 focus:border-neutral-900 focus:bg-white rounded-2xl px-4 py-2.5 text-neutral-900 font-mono text-xs focus:outline-none transition"
              />
            </div>

            {/* Repo */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-700 flex items-center gap-1.5 text-xs">
                <Github className="w-3.5 h-3.5 text-neutral-800" /> 仓库名 (Repo)
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="your-repository"
                className="w-full bg-[#f4f4f3] border border-neutral-200 focus:border-neutral-900 focus:bg-white rounded-2xl px-4 py-2.5 text-neutral-900 font-mono text-xs focus:outline-none transition"
              />
            </div>

            {/* Email & Branch */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 flex items-center gap-1 text-xs">
                  <Mail className="w-3.5 h-3.5 text-neutral-800" /> 邮箱
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#f4f4f3] border border-neutral-200 focus:border-neutral-900 focus:bg-white rounded-2xl px-3.5 py-2.5 text-neutral-900 font-mono text-xs focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 flex items-center gap-1 text-xs">
                  <GitBranch className="w-3.5 h-3.5 text-neutral-800" /> 分支
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-[#f4f4f3] border border-neutral-200 focus:border-neutral-900 focus:bg-white rounded-2xl px-3.5 py-2.5 text-neutral-900 font-mono text-xs focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={forcePush}
                  onChange={(e) => setForcePush(e.target.checked)}
                  className="w-4 h-4 accent-neutral-900 rounded border-neutral-300"
                />
                <span className="font-bold text-neutral-900">
                  强制清空重置远端仓库 (--force overwrite)
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-neutral-500">
                <input
                  type="checkbox"
                  checked={saveLocally}
                  onChange={(e) => setSaveLocally(e.target.checked)}
                  className="w-3.5 h-3.5 accent-neutral-900 rounded border-neutral-300"
                />
                <span className="text-[11px]">记住配置（仅保存在浏览器）</span>
              </label>
            </div>

            <span className="text-neutral-400 text-[11px]">
              {forcePush ? '彻底清洗远端历史多余文件，以解压代码为准' : '增量合并：保留已有旧文件'}
            </span>
          </div>
        </section>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-200 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('browser-upload')}
            className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-xs md:text-sm transition border-b-2 -mb-px shrink-0 rounded-t-2xl ${
              activeTab === 'browser-upload'
                ? 'border-neutral-900 text-neutral-900 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Upload className="w-4 h-4 text-neutral-800" /> 1. 网页直接解压上传
          </button>

          <button
            onClick={() => setActiveTab('termux-script')}
            className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-xs md:text-sm transition border-b-2 -mb-px shrink-0 rounded-t-2xl ${
              activeTab === 'termux-script'
                ? 'border-neutral-900 text-neutral-900 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-neutral-800" /> 2. Termux 脚本 (deploy.sh)
          </button>

          <button
            onClick={() => setActiveTab('github-action')}
            className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-xs md:text-sm transition border-b-2 -mb-px shrink-0 rounded-t-2xl ${
              activeTab === 'github-action'
                ? 'border-neutral-900 text-neutral-900 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileCode className="w-4 h-4 text-neutral-800" /> 3. GitHub Actions 工作流 (.yml)
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-xs md:text-sm transition border-b-2 -mb-px shrink-0 rounded-t-2xl ${
              activeTab === 'faq'
                ? 'border-neutral-900 text-neutral-900 bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-neutral-800" /> 4. 常见问题 FAQ
          </button>
        </div>

        {/* TAB 1: Direct Browser Unzip & API Upload */}
        {activeTab === 'browser-upload' && (
          <div className="space-y-6">
            
            {/* Drag & Drop File Select Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-[28px] p-8 md:p-12 text-center bg-white hover:bg-[#fafaf9] cursor-pointer transition duration-200 space-y-3 group shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-neutral-100 group-hover:bg-black group-hover:text-white flex items-center justify-center mx-auto text-neutral-800 transition duration-300 shadow-sm">
                <FileArchive className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-bold text-neutral-900 text-base">
                  {zipFile ? zipFile.name : '点击或拖拽上传你的 .zip 格式压缩包'}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {zipFile 
                    ? `压缩包体积: ${(zipFile.size / 1024).toFixed(1)} KB` 
                    : '无需手机 Termux 终端，网页自动在浏览器解压并全量上传至 GitHub 目标仓库'}
                </p>
              </div>

              {/* Demo zip test button */}
              {!zipFile && !isUnzipping && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateSampleZip();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-full font-medium transition"
                  >
                    <Play className="w-3 h-3 fill-neutral-700" />
                    <span>无 ZIP？点击生成测试示范包 (Demo Sample)</span>
                  </button>
                </div>
              )}

              {isUnzipping && (
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-neutral-100 px-4 py-2 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-900" />
                  <span>正在内存中解压分析 ZIP 结构...</span>
                </div>
              )}
            </div>

            {unzipError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-800">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{unzipError}</span>
              </div>
            )}

            {/* Extracted File Tree Preview */}
            {extractedFiles.length > 0 && (
              <div className="bg-white rounded-[28px] border border-neutral-200/80 p-6 md:p-8 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-neutral-800" /> 已解析解压目录 ({extractedFiles.length} 个文件)
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">将以此结构全量提交覆盖至 GitHub 仓库</p>
                  </div>

                  <button
                    onClick={handleUploadToGithub}
                    disabled={isUploading}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition shadow-sm ${
                      isUploading 
                        ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
                        : 'bg-black hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploading ? '正在同步至 GitHub...' : '确认解压并直接覆盖推送到 GitHub'}
                  </button>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs font-mono text-neutral-600 font-medium">
                      <span>{currentStepText}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                      <div 
                        className="bg-black h-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {uploadSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4.5 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      <span>代码已成功推送！远端 GitHub 仓库文件已被彻底覆写更新！</span>
                    </div>
                    <a
                      href={`https://github.com/${username}/${repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold hover:text-emerald-950 flex items-center gap-1"
                    >
                      前往查看仓库 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Error Banner */}
                {uploadError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* File Search Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      placeholder="搜索解压出的文件路径..."
                      className="w-full bg-[#f8f8f7] border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-800 transition"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    显示 {filteredFiles.length} / {extractedFiles.length} 项
                  </span>
                </div>

                {/* File Tree List */}
                <div className="bg-[#f8f8f7] border border-neutral-200/80 rounded-2xl p-3 max-h-56 overflow-y-auto font-mono text-xs text-neutral-700 divide-y divide-neutral-200/50">
                  {filteredFiles.map((file, idx) => (
                    <div key={idx} className="py-1.5 px-2 flex items-center justify-between hover:bg-white rounded-xl transition">
                      <span className="truncate pr-4 text-neutral-800">{file.path}</span>
                      <span className="text-[11px] text-neutral-400 shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                  {filteredFiles.length === 0 && (
                    <div className="py-4 text-center text-neutral-400 text-xs">
                      未找到符合条件的文件
                    </div>
                  )}
                </div>

                {/* Activity Log */}
                {logs.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">交互执行日志</span>
                    <div className="bg-black text-neutral-100 p-4 rounded-2xl font-mono text-[11px] max-h-40 overflow-y-auto space-y-1 shadow-inner">
                      {logs.map((log) => (
                        <div key={log.id} className="flex gap-2">
                          <span className="text-neutral-500 shrink-0">[{log.time}]</span>
                          <span className={
                            log.status === 'success' ? 'text-emerald-400' :
                            log.status === 'error' ? 'text-rose-400' : 'text-neutral-300'
                          }>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TAB 2: Termux Script (.sh) */}
        {activeTab === 'termux-script' && (
          <div className="bg-white rounded-[28px] border border-neutral-200/80 p-6 md:p-8 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-neutral-800" /> deploy.sh (Termux 手机本地强推脚本)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">适合直接在手机终端使用此 Shell 脚本解压与覆盖远端仓库</p>
              </div>

              <button
                onClick={() => handleCopy(deployShContent, 'deploy-sh')}
                className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs px-4 py-2 rounded-full font-semibold transition"
              >
                {copiedKey === 'deploy-sh' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'deploy-sh' ? '已复制' : '复制 .sh 脚本'}</span>
              </button>
            </div>

            <div className="bg-black text-neutral-100 p-4.5 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
              <pre>{deployShContent}</pre>
            </div>
          </div>
        )}

        {/* TAB 3: GitHub Actions (.yml) */}
        {activeTab === 'github-action' && (
          <div className="bg-white rounded-[28px] border border-neutral-200/80 p-6 md:p-8 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-neutral-800" /> .github/workflows/unzip-and-deploy.yml
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">存入仓库后，以后直接在 GitHub 网页上传 zip，Actions 会自动在云端解压并覆盖替换</p>
              </div>

              <button
                onClick={() => handleCopy(actionYamlContent, 'action-yml')}
                className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs px-4 py-2 rounded-full font-semibold transition"
              >
                {copiedKey === 'action-yml' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'action-yml' ? '已复制' : '复制 YML 代码'}</span>
              </button>
            </div>

            <div className="bg-black text-neutral-100 p-4.5 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
              <pre>{actionYamlContent}</pre>
            </div>
          </div>
        )}

        {/* TAB 4: FAQ */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-[28px] border border-neutral-200/80 p-6 md:p-8 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-xs md:text-sm text-neutral-700">
            <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              常见问题与避坑提示
            </h3>

            <div className="space-y-4">
              <div className="bg-[#f9f9f8] p-4 rounded-2xl border border-neutral-200/60 space-y-1">
                <h4 className="font-bold text-neutral-900 text-xs md:text-sm">1. 为什么用这个网页可以解决以前传错文件夹的问题？</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  因为开启了“强制清空重置”选项后，程序在构造 Git 节点树时不会继承以前远端的旧文件节点，而是把当前 ZIP 文件树作为**唯一的源码全集**提交覆写，以前传错的各种多余路径和乱七八糟文件都会被一次性清除干干净净！
                </p>
              </div>

              <div className="bg-[#f9f9f8] p-4 rounded-2xl border border-neutral-200/60 space-y-1">
                <h4 className="font-bold text-neutral-900 text-xs md:text-sm">2. 压缩包里面有一层总文件夹怎么办？</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  不用担心！本工具内部集成了自动嵌套提取算法，如果检测到你的 ZIP 压缩包内部只有一层总文件夹（例如 <code className="bg-white border px-1 py-0.5 rounded font-mono">my-project/index.html</code>），会自动帮你提炼出内部文件（自动打平变成根目录下的 <code className="bg-white border px-1 py-0.5 rounded font-mono">index.html</code>）。
                </p>
              </div>

              <div className="bg-[#f9f9f8] p-4 rounded-2xl border border-neutral-200/60 space-y-1">
                <h4 className="font-bold text-neutral-900 text-xs md:text-sm">3. 以后开源代码需要注意什么？</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  本网页完全由纯前端运行（基于 GitHub 官方公开 REST API），你的 Token 只存在于你自己的浏览器内存中，绝对不会上传到任何中间服务器，你可以非常放心、安全地把本项目仓库开源或者分享给朋友使用！
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
