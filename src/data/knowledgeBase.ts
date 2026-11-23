export interface ExtractedFile {
  path: string;
  size: number;
  isDir: boolean;
  content: Uint8Array;
}

export interface UploadLog {
  id: string;
  time: string;
  message: string;
  status: 'pending' | 'success' | 'error' | 'info';
}

export interface SolutionStep {
  text: string;
  linkText?: string;
  linkUrl?: string;
}

export interface ErrorDiagnostics {
  code: string;
  title: string;
  reason: string;
  steps: SolutionStep[];
  retryHint?: string;
}

export interface FaqErrorEntry {
  id: number;
  code: string;
  title: string;
  reason: string;
  solution: string;
  highlighted?: boolean;
}

export interface CoreFaqEntry {
  question: string;
  answer: string;
}

export function analyzeError(rawError: string, username: string, repo: string, branch: string): ErrorDiagnostics {
  const lower = rawError.toLowerCase();

  // 1. Invalid Blob / Cache Expired
  if (lower.includes('is not a valid blob') || lower.includes('invalid blob')) {
    return {
      code: 'ERR_CACHE_BLOB_EXPIRED',
      title: '缓存文件索引失效',
      reason: '由于网络中断或断点记录过期，GitHub 端的缓存索引失效。已为您自动清空过期缓存。',
      steps: [
        { text: '点击下方「断点继续上传」按钮，系统会自动跳过已验证块，全量重发无效缓存文件。' },
        { text: '传输过程中请尽量保持页面在前台，避免手机息屏挂起网络。' }
      ],
      retryHint: '直接点击下方「断点继续上传」即可自动清除并恢复部署。'
    };
  }

  // 2. Protected Branch
  if (lower.includes('protected branch') || lower.includes('branch is protected') || lower.includes('push is restricted')) {
    return {
      code: 'ERR_BRANCH_PROTECTION',
      title: `分支 [${branch || 'main'}] 启用了分支保护规则 (Protected Branch)`,
      reason: 'GitHub 仓库默认启用了分支保护规则（例如禁止 Force Push 或强制要求 Pull Request），导致强制全量提交被拒绝。',
      steps: [
        {
          text: '解法 ①（推荐）：前往 GitHub 仓库设置暂时关闭保护规则',
          linkText: `管理 ${username || 'repo'}/${repo || 'name'} 的 Branches 设置`,
          linkUrl: `https://github.com/${username}/${repo}/settings/branches`
        },
        { text: '在 Branch protection rules 中找到对应的规则，点击 Edit 按钮，暂时取消勾选规则，或勾选「Allow force pushes」。' },
        { text: '解法 ②：将左侧配置的「目标分支名」修改为 gh-pages 后重新提交，部署到一个独立的分支。' }
      ]
    };
  }

  // 3. Fine-grained PAT / Token permissions 403
  if (lower.includes('resource not accessible by integration') || (lower.includes('403') && !lower.includes('rate limit'))) {
    return {
      code: 'ERR_TOKEN_403_PERMISSION',
      title: 'GitHub Access Token 权限不足 (403 Forbidden)',
      reason: '使用的 GitHub Access Token 缺少对仓库代码写入的权限，或者使用了新版 Fine-grained Token 但未勾选 Contents 读写支持。',
      steps: [
        {
          text: '若使用 Fine-grained Token (细粒度 Token)，请去 GitHub 个人 Token 管理设置',
          linkText: '查看 Fine-grained Tokens',
          linkUrl: 'https://github.com/settings/tokens?type=beta'
        },
        { text: '编辑该 Token，在 Repository permissions 中将「Contents」选项改为 Read and write (读与写)。' },
        {
          text: '若使用 Classic Token (经典 Token)，请前往经典 Token 列表',
          linkText: '查看 Classic Tokens',
          linkUrl: 'https://github.com/settings/tokens'
        },
        { text: '确保勾选了最顶部的 「repo」(完整仓库控制权限)。' }
      ]
    };
  }

  // 4. Bad Credentials / 401
  if (lower.includes('401') || lower.includes('bad credentials')) {
    return {
      code: 'ERR_TOKEN_401_INVALID',
      title: 'GitHub Access Token 无效或已过期 (401 Unauthorized)',
      reason: '填写的 Token 复制错误、遗漏了前缀 `ghp_`，或者该 Token 已被撤销或到了设定的过期时间。',
      steps: [
        { text: '请检查「GitHub Personal Access Token」文本框，确保复制粘贴完整无多余空格。' },
        {
          text: '若 Token 已失效，点击右侧链接重新生成全新 Token',
          linkText: '生成包含 repo 权限的新 Token',
          linkUrl: 'https://github.com/settings/tokens/new?scopes=repo&description=deploy-tool'
        }
      ]
    };
  }

  // 5. 404 Repo Not Found
  if (lower.includes('404')) {
    return {
      code: 'ERR_REPO_404_NOT_FOUND',
      title: '未找到目标仓库 (404 Not Found)',
      reason: `无法找到目标仓库 [${username}/${repo}]。可能原因：1. 用户名或仓库名拼写大小写有误；2. 这是私有仓库 (Private Repo)，但 Token 没勾选 repo 读写权限。`,
      steps: [
        { text: `核对目标用户名是否为 [${username}]，仓库名是否为 [${repo}]（严禁多填斜杠或空格）。` },
        { text: '在浏览器中测试仓库链接是否可访问：', linkText: `打开 https://github.com/${username}/${repo}`, linkUrl: `https://github.com/${username}/${repo}` },
        { text: '若确认是私有仓库，请重新生成勾选了 repo 权限的 Token 后在网页重试。' }
      ]
    };
  }

  // 6. Rate Limit / 429
  if (lower.includes('rate limit') || lower.includes('secondary rate') || lower.includes('429')) {
    return {
      code: 'ERR_API_RATE_LIMIT',
      title: '触发 GitHub API 频次风控 (API Rate Limit)',
      reason: '短时间内发送了较多 API 请求，触发了 GitHub 的防刷保护机制。',
      steps: [
        { text: '不用担心，本系统内置了自动平滑退避机制。' },
        { text: '请静置等待 30 秒至 1 分钟，然后直接点击下方「断点继续上传」即可接续完成。' }
      ]
    };
  }

  // Default fallback
  return {
    code: 'ERR_UNKNOWN_DEPLOY',
    title: '网络传输中断或提交异常',
    reason: rawError,
    steps: [
      { text: '检查网络连接，避免移动端锁屏或切换 App 导致网络挂起。' },
      { text: '检查 GitHub Token 读写权限与仓库名拼写是否完全匹配。' },
      { text: '点击下方「断点继续上传」按钮重试，系统会从上一次中断处秒级恢复。' }
    ]
  };
}

export const FAQ_ERRORS: FaqErrorEntry[] = [
  {
    id: 1,
    code: 'ERR_CACHE_BLOB_EXPIRED',
    title: '提示 tree.sha ... is not a valid blob（断点索引失效）',
    reason: '传输中途网络掉线或手机切后台挂起，导致 GitHub 端的临时 Blob 块未正常持久化。',
    solution: '无需重新拖入 ZIP 包，直接点击排错框中的「断点继续上传」按钮。网页会自动清除无效缓存并全量同步，秒级恢复！',
    highlighted: true
  },
  {
    id: 2,
    code: 'ERR_TOKEN_401_INVALID',
    title: '提示 401 Bad Credentials 或 Token 无效',
    reason: 'GitHub Token 复制错误、末尾包含了空格或换行，或者 Token 已过期/在 GitHub 端被删除了。',
    solution: '重新在 GitHub 生成新 Token（开启 repo 权限），然后粘贴到配置区的 Token 输入框中。'
  },
  {
    id: 3,
    code: 'ERR_REPO_404_NOT_FOUND',
    title: '提示 404 Not Found 找不到仓库',
    reason: '1. GitHub 用户名或仓库名拼写错误（区分大小写）；2. 仓库是私有仓库 (Private Repo)，但 Token 没勾选 repo 读写权限导致无法访问。',
    solution: '确认用户名和仓库名无空格拼错，并在重新生成 Token 时勾选完整的 repo 读写权限。'
  },
  {
    id: 4,
    code: 'ERR_TOKEN_403_PERMISSION',
    title: '提示 403 Forbidden 或 Resource not accessible',
    reason: '使用了 GitHub 新版细粒度 Token (Fine-grained PAT)，但未给予 Repository contents 写入支持。',
    solution: '前往 GitHub Token 设置，将 Repository permissions -> Contents 设置为 Read and write (读与写)。'
  },
  {
    id: 5,
    code: 'ERR_BRANCH_PROTECTION',
    title: '提示 Protected branch（分支保护限制）',
    reason: '仓库的分支（如 main）开启了分支保护规则（Branch protection rule），禁止直接强制覆写。',
    solution: '前往仓库 Settings -> Branches 暂时解禁保护规则，或者将配置中的「目标分支名」修改为 gh-pages 部署到新分支。'
  },
  {
    id: 6,
    code: 'ERR_API_RATE_LIMIT',
    title: '提示 429 Rate Limit Exceeded（接口限流）',
    reason: '项目小文件过多或短期内发送 API 较多，触发了 GitHub 的平滑防刷限制。',
    solution: '静置等待 30 秒，然后点击「断点继续上传」即可继续，网页已内置自动缓释和降频重试机制。'
  },
  {
    id: 7,
    code: 'PAGES_NO_SAVE_BUTTON',
    title: 'GitHub Pages 页面找不到 Save 按钮或开启后白屏',
    reason: '当将 Build and deployment 切换为 GitHub Actions 时，配置是自动保存生效的，所以不会出现 Save 按钮；网页白屏通常是项目资源路径使用了绝对路径。',
    solution: '上传成功后直接点击成功面板里的「网页 API 一键开启 Pages & 启动 Actions」即可自动拉起打包；同时静态项目打包时请保持相对路径（如 base: "./"）。'
  },
  {
    id: 8,
    code: 'ERR_TREE_EMPTY',
    title: '提示 422 Tree cannot be empty（文件树为空）',
    reason: 'ZIP 压缩包内只有系统垃圾文件（如 .DS_Store）或者为空压缩包，净化过滤后没有剩余有效代码文件。',
    solution: '重新打包代码 ZIP，确保压缩包内包含正常的源码文件或 index.html。'
  },
  {
    id: 9,
    code: 'ERR_NETWORK_ABORT',
    title: '手机上传提示 Failed to fetch / NetworkError',
    reason: '手机端切去微信回复消息或屏幕休眠锁屏，浏览器暂停了后台 JS 脚本与网络请求。',
    solution: '返回浏览器，点击「断点继续上传」，系统会自动续传未完成部分。传输期间保持手机亮屏在前台即可。'
  },
  {
    id: 10,
    code: 'ERR_WORKFLOW_FAILED',
    title: 'GitHub Actions 运行报错 Process completed with exit code 1',
    reason: 'GitHub 仓库默认的 Actions 工作流权限受限（只读模式），导致部署构建被拒。',
    solution: '进入 GitHub 仓库 Settings -> Actions -> General，下拉到最底部的 Workflow permissions，勾选 Read and write permissions，然后保存！'
  },
  {
    id: 11,
    code: 'CACHE_STALE_PAGE',
    title: '浏览器存在旧缓存，导致看到的还是旧版网页',
    reason: '浏览器默认对静态网页资源（JS/CSS）有长时间强缓存或 ServiceWorker 离线缓存，导致代码更新后浏览器仍在使用本地旧文件。',
    solution: '点击左侧导航栏底部的「清除缓存并刷新」按钮，系统会自动擦除离线缓存并带时间戳强制拉取最新网页。'
  }
];

export const CORE_FAQS: CoreFaqEntry[] = [
  {
    question: '为什么用这个网页可以解决以前传错文件夹的问题？',
    answer: '因为开启了“强制清空重置”选项后，程序在构造 Git 节点树时不会继承以前远端的旧文件节点，而是把当前 ZIP 文件树作为唯一的源码全集提交覆写，以前传错的多余路径和杂乱文件都会被一次性清除干净。'
  },
  {
    question: '压缩包里面有一层总文件夹怎么办？',
    answer: '不用担心！本工具内部集成了自动嵌套提取算法，如果检测到你的 ZIP 压缩包内部只有一层总文件夹（例如 my-project/index.html），会自动帮你提炼出内部文件（自动打平变成根目录下的 index.html）。'
  },
  {
    question: '提示 "Git Repository is empty" 是什么意思？',
    answer: '这意味着你在 GitHub 上新建的仓库是完全空白的（没有勾选 "Add a README file"，里面 0 个 commit，连 main 默认分支都还没建立）。不用担心，直接拖入 ZIP 点击全量上传，系统会自动帮你建立初始提交并创建好 main 分支！'
  },
  {
    question: '安全保障与隐私声明',
    answer: '本网页完全由纯前端运行（基于 GitHub 官方公开 REST API），你的 Token 只存在于你自己的浏览器内存与本地存储中，绝对不会上传到任何中间服务器，可安心部署私有与公开仓库。'
  }
];

export function buildActionYamlContent(username: string, email: string, branch: string): string {
  return `# .github/workflows/unzip-and-deploy.yml
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
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.GH_PAT || secrets.GITHUB_TOKEN }}

      - name: Find and extract ZIP archive
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

      - name: Commit and replace repository contents
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
}

export function buildDeployShContent(username: string, repo: string, email: string, branch: string, token: string): string {
  return `#!/bin/bash
# Termux 本地一键解压强推覆写仓库 + API 自动开启 Pages 脚本

USERNAME="${username}"
REPO="${repo}"
EMAIL="${email}"
BRANCH="${branch}"
TOKEN="\${1:-${token || 'YOUR_GITHUB_TOKEN'}}";
ZIP_PATH="\${2:-/sdcard/project.zip}"

WORK_DIR="/sdcard/termux_zip_deploy_temp"
rm -rf "$WORK_DIR" && mkdir -p "$WORK_DIR"

echo "正在解压 $ZIP_PATH 到临时工作区..."
unzip -q -o "$ZIP_PATH" -d "$WORK_DIR"
cd "$WORK_DIR" || exit 1

ITEM_COUNT=$(ls -1 | wc -l)
if [ "$ITEM_COUNT" -eq 1 ] && [ -d * ]; then
    cd * || exit 1
fi

echo "初始化 Git 并重置提交历史..."
rm -rf .git && git init
git config user.name "$USERNAME"
git config user.email "$EMAIL"
git add .
git commit -m "Upload unzipped files from $ZIP_PATH"
git branch -M "$BRANCH"

git remote add origin "https://\${TOKEN}@github.com/\${USERNAME}/\${REPO}.git"
echo "强制推送到 GitHub 远端..."
git push -u origin "$BRANCH" --force
rm -rf "$WORK_DIR"

echo "正在通过 API 全自动开启 GitHub Pages (Actions 模式)..."
curl -s -X POST -H "Authorization: Bearer \${TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/\${USERNAME}/\${REPO}/pages" -d '{"build_type":"workflow"}' > /dev/null || true
curl -s -X PUT -H "Authorization: Bearer \${TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/\${USERNAME}/\${REPO}/pages" -d '{"build_type":"workflow"}' > /dev/null || true

echo "正在通过 API 自动触发 GitHub Actions 云端构建打包..."
curl -s -X POST -H "Authorization: Bearer \${TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/\${USERNAME}/\${REPO}/actions/workflows/deploy-pages.yml/dispatches" -d "{\\"ref\\":\\"\${BRANCH}\\"}" > /dev/null || true

echo "全套自动化处理完毕！大约 1 分钟后即可访问你的在线网站："
echo "https://\${USERNAME}.github.io/\${REPO}/"`;
}

export function buildTermuxOneLiner(username: string, repo: string, branch: string, token: string): string {
  return `pkg install -y curl && curl -s -X POST -H "Authorization: Bearer ${token || 'YOUR_TOKEN'}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${username}/${repo}/pages" -d '{"build_type":"workflow"}' && curl -s -X PUT -H "Authorization: Bearer ${token || 'YOUR_TOKEN'}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${username}/${repo}/pages" -d '{"build_type":"workflow"}' && curl -s -X POST -H "Authorization: Bearer ${token || 'YOUR_TOKEN'}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${username}/${repo}/actions/workflows/deploy-pages.yml/dispatches" -d '{"ref":"${branch}"}' && echo "Termux 已成功为你自动开启 GitHub Pages 并触发打包上线！"`;
}
