import React from 'react';
import { ArrowUpRight, ArrowRight, ShieldCheck, Layers, Sparkles } from 'lucide-react';
import type { ActiveView } from './Sidebar';

interface GuideViewProps {
  onNavigateView: (view: ActiveView) => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onNavigateView }) => {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            上手指南 · 3 分钟完成首次发布
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            零基础三步将 ZIP 代码部署到 GitHub
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onNavigateView('deploy')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <span>前往部署工作台</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">01.</span>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              获取 GitHub Token (密钥)
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              打开 GitHub → Settings → Developer Settings → Personal Access Tokens (classic) → 新建 Token，务必勾选{' '}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono">
                repo
              </code>{' '}
              选项，生成的字符串就是 Token。
            </p>
          </div>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=ZipDeploy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:opacity-75 pt-2"
          >
            <span>直接前往 GitHub 创建 Token</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
          <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">02.</span>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            填入账号与目标仓库
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            在工作台参数区填入 Token、GitHub 用户名与目标仓库名称。勾选「强制清空重置」会自动清理此前误传的冗余历史文件；空白新建仓库也会自动初始化首个节点。
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
          <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">03.</span>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            拖入 ZIP 一键覆盖上传
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            将电脑或手机里的{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono">
              .zip
            </code>{' '}
            压缩包拖入上传区，网页将在浏览器内存中瞬间完成清洗与解压，通过官方 REST API 直推仓库。
          </p>
        </div>
      </div>

      {/* Design & Architecture Guarantees */}
      <div className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          为什么推荐用 zipdeploy 进行部署？
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200/70 dark:divide-neutral-800/80">
          <div className="pt-4 md:pt-0 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              <ShieldCheck className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span>纯前端零服务器中转</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              解压与 API 请求全部发生在你的浏览器本地，Token 不会离开你的设备。
            </p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-6 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              <Layers className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span>自动打平嵌套目录</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              若压缩包外层套了一层总文件夹，程序会自动剥离外层并对齐根目录结构。
            </p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-6 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              <Sparkles className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span>智能清洗与 Pages 注入</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              自动屏蔽 .DS_Store / __MACOSX / node_modules，并支持一键拉起 GitHub Pages 云端打包。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
