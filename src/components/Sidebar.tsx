import React from 'react';
import {
  Upload,
  BookOpen,
  Terminal,
  ShieldAlert,
  Sun,
  Moon,
  RefreshCw,
  FileArchive,
  X,
  ShieldCheck,
  Clock
} from 'lucide-react';

export type ActiveView = 'deploy' | 'guide' | 'scripts' | 'faq';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isRefreshingSite: boolean;
  onForceUpdateSite: () => void;
  onOpenSecurityNotice: () => void;
  deployHistoryCount: number;
  onOpenDeployHistory: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: ActiveView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'deploy', label: '部署工作台', icon: Upload },
  { id: 'guide', label: '三分钟教程', icon: BookOpen },
  { id: 'scripts', label: '脚本与 Actions', icon: Terminal },
  { id: 'faq', label: '排障百科', icon: ShieldAlert }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  theme,
  onToggleTheme,
  isRefreshingSite,
  onForceUpdateSite,
  onOpenSecurityNotice,
  deployHistoryCount,
  onOpenDeployHistory,
  mobileOpen,
  onCloseMobile
}) => {
  const handleNavClick = (view: ActiveView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarBody = (
    <div className="flex flex-col h-full bg-[#ECEDEF] dark:bg-[#0C0D0F] border-r border-black/[0.06] dark:border-white/[0.07] select-none">
      {/* Brand Header */}
      <div className="h-[72px] px-5 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => handleNavClick('deploy')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <span className="w-8 h-8 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-transform duration-150 group-hover:scale-[1.04]">
            <FileArchive className="w-3.5 h-3.5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[#141414] dark:text-white whitespace-nowrap shrink-0">
            zipdeploy
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
          aria-label="关闭导航菜单"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-3 space-y-2 overflow-y-auto" aria-label="主导航">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-[13px] transition-all duration-150 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#141414] dark:bg-white text-white dark:text-[#141414] font-semibold shadow-[0_6px_16px_-4px_rgba(0,0,0,0.22)]'
                  : 'bg-white/75 dark:bg-[#17181C] text-zinc-700 dark:text-zinc-300 font-medium border border-black/[0.04] dark:border-white/[0.06] hover:bg-white dark:hover:bg-[#1E2026] hover:text-[#141414] dark:hover:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Controls */}
      <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.07] space-y-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-medium text-[#141414] dark:text-zinc-200 bg-white dark:bg-[#17181C] border border-black/[0.05] dark:border-white/[0.07] hover:shadow-sm transition-all whitespace-nowrap"
        >
          <span className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-white" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#141414]" />
            )}
            <span>{theme === 'dark' ? '深色模式' : '浅色模式'}</span>
          </span>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenDeployHistory();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-4 py-2 rounded-full text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#141414] dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap"
        >
          <span className="flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>本地部署记录</span>
          </span>
          {deployHistoryCount > 0 && (
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
              {deployHistoryCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenSecurityNotice();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap"
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>隐私与安全须知</span>
        </button>

        <button
          type="button"
          onClick={onForceUpdateSite}
          disabled={isRefreshingSite}
          className="w-full flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap disabled:opacity-50"
          title="清除浏览器离线缓存并拉取最新页面"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isRefreshingSite ? 'animate-spin text-[#141414] dark:text-white' : ''}`} />
          <span>{isRefreshingSite ? '正在更新缓存...' : '清除缓存并刷新'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-60 shrink-0 h-screen sticky top-0 z-30">
        {sidebarBody}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/25 dark:bg-black/65 backdrop-blur-[2px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[82vw] h-full shadow-2xl z-10">
            {sidebarBody}
          </aside>
        </div>
      )}
    </>
  );
};
