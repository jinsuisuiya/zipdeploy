import React from 'react';
import { Terminal, FileCode, Copy, Check, Zap } from 'lucide-react';
import {
  buildActionYamlContent,
  buildDeployShContent,
  buildTermuxOneLiner
} from '../data/knowledgeBase';

interface ScriptsViewProps {
  username: string;
  repo: string;
  email: string;
  branch: string;
  token: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({
  username,
  repo,
  email,
  branch,
  token,
  copiedKey,
  onCopy
}) => {
  const termuxOneLiner = buildTermuxOneLiner(username, repo, branch, token);
  const deployShContent = buildDeployShContent(username, repo, email, branch, token);
  const actionYamlContent = buildActionYamlContent(username, email, branch);

  return (
    <div className="w-full max-w-4xl min-w-0 space-y-7">
      {/* Header */}
      <div className="pb-5 border-b border-black/[0.07] dark:border-white/[0.08] space-y-1.5">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          自动化脚本 · 实时关联当前仓库参数 ({username}/{repo})
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-[#141414] dark:text-white">
          Termux 终端脚本与 GitHub Actions 工作流
        </h2>
      </div>

      {/* 1. Termux 1-liner */}
      <section className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#141414] dark:text-white flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </span>
              <span>Termux 手机一键自动补救命令（无需找 Save 键）</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-9.5">
              如果在 GitHub 网页找不到开启 Pages 或 Actions 的按钮，在 Termux 粘贴运行此命令即可通过 API 自动开启并触发构建。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(termuxOneLiner, 'termux-one-liner')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            {copiedKey === 'termux-one-liner' ? <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'termux-one-liner' ? '已复制命令' : '复制单行命令'}</span>
          </button>
        </div>

        <div className="bg-[#141414] dark:bg-[#0B0C0F] text-zinc-100 p-4 rounded-2xl border border-black/10 dark:border-white/[0.06] font-mono text-xs overflow-x-auto select-all leading-relaxed">
          <code>{termuxOneLiner}</code>
        </div>
      </section>

      {/* 2. Complete deploy.sh */}
      <section className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#141414] dark:text-white flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
                <Terminal className="w-3.5 h-3.5" />
              </span>
              <span>deploy.sh（Termux 全自动解压强推 + API 开启 Pages）</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-9.5">
              可在手机 Termux 中保存为 deploy.sh 运行，包含本地 Git 重置历史强推与自动开启 Pages 流程。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(deployShContent, 'deploy-sh')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-[#2E313A] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            {copiedKey === 'deploy-sh' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'deploy-sh' ? '已复制' : '复制 deploy.sh'}</span>
          </button>
        </div>

        <div className="bg-[#141414] dark:bg-[#0B0C0F] text-zinc-100 p-4 rounded-2xl border border-black/10 dark:border-white/[0.06] font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{deployShContent}</pre>
        </div>
      </section>

      {/* 3. GitHub Actions Workflow */}
      <section className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#141414] dark:text-white flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
                <FileCode className="w-3.5 h-3.5" />
              </span>
              <span className="font-mono">.github/workflows/unzip-and-deploy.yml</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-9.5">
              存入仓库后，未来直接在 GitHub 网页上传 .zip，Actions 将自动在云端解压并覆盖替换文件。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(actionYamlContent, 'action-yml')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-[#2E313A] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            {copiedKey === 'action-yml' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'action-yml' ? '已复制' : '复制 YML 代码'}</span>
          </button>
        </div>

        <div className="bg-[#141414] dark:bg-[#0B0C0F] text-zinc-100 p-4 rounded-2xl border border-black/10 dark:border-white/[0.06] font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{actionYamlContent}</pre>
        </div>
      </section>
    </div>
  );
};
