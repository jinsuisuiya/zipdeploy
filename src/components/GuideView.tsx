import React from 'react';
import { ArrowUpRight, ArrowRight, ShieldCheck, Layers, Sparkles } from 'lucide-react';
import type { ActiveView } from './Sidebar';

interface GuideViewProps {
  onNavigateView: (view: ActiveView) => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onNavigateView }) => {
  return (
    <div className="w-full min-w-0 max-w-4xl space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-black/[0.07] dark:border-white/[0.08]">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            上手指南 · 3 分钟完成首次发布
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-[#141414] dark:text-white">
            零基础三步将 ZIP 代码部署到 GitHub
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onNavigateView('deploy')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity shadow-[0_6px_16px_-4px_rgba(0,0,0,0.2)] whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <span>前往部署工作台</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] font-mono text-[11px] font-semibold inline-flex items-center justify-center">
              01
            </span>
            <h3 className="text-sm font-semibold text-[#141414] dark:text-white">
              获取 GitHub Token (密钥)
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              打开 GitHub → Settings → Developer Settings → Personal Access Tokens (classic) → 新建 Token，务必勾选{' '}
              <code className="px-1.5 py-0.5 rounded-md bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-white font-mono">
                repo
              </code>{' '}
              选项，生成的字符串就是 Token。
            </p>
          </div>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=ZipDeploy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#141414] dark:text-white underline underline-offset-4 hover:opacity-75 pt-1"
          >
            <span>直接前往 GitHub 创建 Token</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] space-y-3">
          <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] font-mono text-[11px] font-semibold inline-flex items-center justify-center">
            02
          </span>
          <h3 className="text-sm font-semibold text-[#141414] dark:text-white">
            填入账号与目标仓库
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            在工作台参数区填入 Token、用户名与目标仓库名（若尚无仓库可点「一键新建」）。展开高级设置中的「强制清空重置」可自动清理此前误传的冗余历史文件。
          </p>
        </div>

        <div className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] space-y-3">
          <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] font-mono text-[11px] font-semibold inline-flex items-center justify-center">
            03
          </span>
          <h3 className="text-sm font-semibold text-[#141414] dark:text-white">
            拖入 ZIP 一键并发上传
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            将电脑或手机里的{' '}
            <code className="px-1.5 py-0.5 rounded-md bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-white font-mono">
              .zip
            </code>{' '}
            压缩包拖入上传区，网页将在本地瞬间完成清洗、安全体检与 5 路并发无损直推。
          </p>
        </div>
      </div>

      {/* Design & Architecture Guarantees */}
      <div className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-semibold text-[#141414] dark:text-white mb-5">
          为什么推荐用 zipdeploy 进行部署？
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-black/[0.06] dark:divide-white/[0.07]">
          <div className="pt-4 md:pt-0 space-y-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#141414] dark:text-white">
              <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <span>纯前端零服务器中转</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              解压、密钥扫描与 API 请求全部发生在你的浏览器本地，Token 不会离开你的设备。
            </p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#141414] dark:text-white">
              <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span>自动打平嵌套目录</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              若压缩包外层套了一层总文件夹，程序会自动剥离外层并对齐根目录结构。
            </p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#141414] dark:text-white">
              <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span>SHA-1 去重与并发加速</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              自动比对远端指纹跳过未修改文件，其余文件通过 5 路并发无损直推，并实时追踪云端打包进度。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
