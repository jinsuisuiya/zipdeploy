import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, Search, BookOpen, ShieldAlert, ArrowRight } from 'lucide-react';
import { FAQ_ERRORS } from '../data/knowledgeBase';
import type { ActiveView } from './Sidebar';

export type QuickDrawerTab = 'guide' | 'faq' | null;

interface QuickDrawerProps {
  activeTab: QuickDrawerTab;
  onChangeTab: (tab: 'guide' | 'faq') => void;
  onClose: () => void;
  onNavigateFullView: (view: ActiveView) => void;
  initialQuery?: string;
}

export const QuickDrawer: React.FC<QuickDrawerProps> = ({
  activeTab,
  onChangeTab,
  onClose,
  onNavigateFullView,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery, activeTab]);

  useEffect(() => {
    if (!activeTab) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onClose]);

  if (!activeTab) return null;

  const filteredErrors = FAQ_ERRORS.filter(
    (item) =>
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.code.toLowerCase().includes(query.toLowerCase()) ||
      item.reason.toLowerCase().includes(query.toLowerCase()) ||
      item.solution.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="速查手册">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 dark:bg-black/65 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#17181C] border-l border-black/[0.06] dark:border-white/[0.08] h-full shadow-[-12px_0_40px_rgba(0,0,0,0.12)] dark:shadow-[-12px_0_40px_rgba(0,0,0,0.5)] flex flex-col z-10">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-[#F2F3F5] dark:bg-[#23252C] rounded-full">
            <button
              type="button"
              onClick={() => onChangeTab('guide')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'guide'
                  ? 'bg-[#141414] dark:bg-white text-white dark:text-[#141414] shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>三分钟教程</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTab('faq')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'faq'
                  ? 'bg-[#141414] dark:bg-white text-white dark:text-[#141414] shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>排障速查</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors"
            aria-label="关闭速查抽屉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'guide' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#141414] dark:text-white tracking-tight">
                  三分钟极速部署指南
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  不离开当前部署台，随时核对 Token 申请与仓库覆写步骤。
                </p>
              </div>

              <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06] border-y border-black/[0.05] dark:border-white/[0.06]">
                <div className="py-4 space-y-2">
                  <div className="text-xs font-semibold text-[#141414] dark:text-white">
                    01. 获取 GitHub Token (密钥)
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    打开 GitHub → Settings → Developer Settings → Personal Access Tokens (classic) → 新建 Token，务必勾选{' '}
                    <code className="px-1.5 py-0.5 rounded-md bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-white font-mono">
                      repo
                    </code>{' '}
                    权限。
                  </p>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=ZipDeploy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#141414] dark:text-white underline underline-offset-4 hover:opacity-75 pt-0.5"
                  >
                    <span>直接前往 GitHub 创建 Token</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="py-4 space-y-2">
                  <div className="text-xs font-semibold text-[#141414] dark:text-white">
                    02. 填入账号与目标仓库
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    在左侧配置栏填入 Token、用户名以及仓库名。可在「高级设置与部署策略」中开启「强制清空重置」，自动把此前传错的多余路径清理干净。
                  </p>
                </div>

                <div className="py-4 space-y-2">
                  <div className="text-xs font-semibold text-[#141414] dark:text-white">
                    03. 拖入 ZIP 一键覆盖上传
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    将{' '}
                    <code className="px-1.5 py-0.5 rounded-md bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-white font-mono">
                      .zip
                    </code>{' '}
                    文件拖入上传区，网页在本地内存中解压并自动打平单层嵌套目录后直接推送至 GitHub。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative flex items-center">
                <span className="w-7 h-7 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center absolute left-1 pointer-events-none">
                  <Search className="w-3 h-3" />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索错误码或关键词 (例如 403 / blob / Pages)..."
                  className="w-full bg-[#F2F3F5] dark:bg-[#23252C] border border-transparent focus:border-[#141414] dark:focus:border-white focus:bg-white dark:focus:bg-[#1E2028] rounded-full pl-10 pr-4 py-2 text-xs text-[#141414] dark:text-white placeholder:text-zinc-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06] border-t border-black/[0.05] dark:border-white/[0.06]">
                {filteredErrors.map((item) => (
                  <div key={item.id} className="py-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-semibold text-[#141414] dark:text-white leading-snug">
                        {String(item.id).padStart(2, '0')}. {item.title}
                      </h4>
                      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                        {item.code}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      原因：{item.reason}
                    </p>
                    <p className="text-xs text-[#141414] dark:text-zinc-200 leading-relaxed">
                      解决：{item.solution}
                    </p>
                  </div>
                ))}

                {filteredErrors.length === 0 && (
                  <div className="py-10 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    未找到匹配的报错条目
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-black/[0.05] dark:border-white/[0.06] bg-[#F2F3F5] dark:bg-[#111216] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            需要完整视图对照或关键词检索？
          </span>
          <button
            type="button"
            onClick={() => {
              onNavigateFullView(activeTab === 'guide' ? 'guide' : 'faq');
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <span>打开完整页面</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
