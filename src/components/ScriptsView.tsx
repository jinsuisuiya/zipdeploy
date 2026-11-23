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
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          自动化脚本 · 实时关联当前仓库参数 ({username}/{repo})
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Termux 终端脚本与 GitHub Actions 工作流
        </h2>
      </div>

      {/* 1. Termux 1-liner */}
      <section className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Termux 手机一键自动补救命令（无需找 Save 键）</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              如果在 GitHub 网页找不到开启 Pages 或 Actions 的按钮，在 Termux 粘贴运行此命令即可通过 API 自动开启并触发构建。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(termuxOneLiner, 'termux-one-liner')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            {copiedKey === 'termux-one-liner' ? <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'termux-one-liner' ? '已复制命令' : '复制单行命令'}</span>
          </button>
        </div>

        <div className="bg-[#111113] dark:bg-[#09090B] text-neutral-200 p-4 rounded-lg border border-neutral-800 font-mono text-xs overflow-x-auto select-all leading-relaxed">
          <code>{termuxOneLiner}</code>
        </div>
      </section>

      {/* 2. Complete deploy.sh */}
      <section className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span>deploy.sh（Termux 全自动解压强推 + API 开启 Pages）</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              可在手机 Termux 中保存为 deploy.sh 运行，包含本地 Git 重置历史强推与自动开启 Pages 流程。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(deployShContent, 'deploy-sh')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            {copiedKey === 'deploy-sh' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'deploy-sh' ? '已复制' : '复制 deploy.sh'}</span>
          </button>
        </div>

        <div className="bg-[#111113] dark:bg-[#09090B] text-neutral-200 p-4 rounded-lg border border-neutral-800 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{deployShContent}</pre>
        </div>
      </section>

      {/* 3. GitHub Actions Workflow */}
      <section className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span className="font-mono">.github/workflows/unzip-and-deploy.yml</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              存入仓库后，未来直接在 GitHub 网页上传 .zip，Actions 将自动在云端解压并覆盖替换文件。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(actionYamlContent, 'action-yml')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            {copiedKey === 'action-yml' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'action-yml' ? '已复制' : '复制 YML 代码'}</span>
          </button>
        </div>

        <div className="bg-[#111113] dark:bg-[#09090B] text-neutral-200 p-4 rounded-lg border border-neutral-800 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{actionYamlContent}</pre>
        </div>
      </section>
    </div>
  );
};
