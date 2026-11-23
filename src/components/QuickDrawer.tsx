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
        className="fixed inset-0 bg-black/25 dark:bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-[#FFFFFF] dark:bg-[#141416] border-l border-neutral-200 dark:border-neutral-800 h-full shadow-[-12px_0_40px_rgba(0,0,0,0.08)] dark:shadow-[-12px_0_40px_rgba(0,0,0,0.45)] flex flex-col z-10">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg">
            <button
              type="button"
              onClick={() => onChangeTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>三分钟教程</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTab('faq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'faq'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>排障速查</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="关闭速查抽屉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'guide' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                  三分钟极速部署指南
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  不离开当前部署台，随时核对 Token 申请与仓库覆写步骤。
                </p>
              </div>

              <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/80 border-y border-neutral-200/70 dark:border-neutral-800/80">
                <div className="py-4 space-y-2">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    01. 获取 GitHub Token (密钥)
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    打开 GitHub → Settings → Developer Settings → Personal Access Tokens (classic) → 新建 Token，务必勾选 <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono">repo</code> 权限。
                  </p>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=ZipDeploy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:opacity-75 pt-0.5"
                  >
                    <span>直接前往 GitHub 创建 Token</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="py-4 space-y-2">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    02. 填入账号与目标仓库
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    在左侧配置栏填入 Token、用户名以及仓库名。勾选「强制清空重置」会自动把此前传错的多余路径清理干净，只保留本次压缩包内容。
                  </p>
                </div>

                <div className="py-4 space-y-2">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    03. 拖入 ZIP 一键覆盖上传
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    将 <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono">.zip</code> 文件拖入上传区，网页在本地内存中解压并自动打平单层嵌套目录后直接推送至 GitHub。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索错误码或关键词 (例如 403 / blob / Pages)..."
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/80 border-t border-neutral-200/70 dark:border-neutral-800/80">
                {filteredErrors.map((item) => (
                  <div key={item.id} className="py-3.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                        {String(item.id).padStart(2, '0')}. {item.title}
                      </h4>
                      <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
                        {item.code}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      原因：{item.reason}
                    </p>
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      解决：{item.solution}
                    </p>
                  </div>
                ))}

                {filteredErrors.length === 0 && (
                  <div className="py-10 text-center text-xs text-neutral-400 dark:text-neutral-500">
                    未找到匹配的报错条目
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            需要完整视图对照或关键词检索？
          </span>
          <button
            type="button"
            onClick={() => {
              onNavigateFullView(activeTab === 'guide' ? 'guide' : 'faq');
              onClose();
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-4 whitespace-nowrap"
          >
            <span>打开完整页面</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
