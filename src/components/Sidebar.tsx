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
  ShieldCheck
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
  mobileOpen,
  onCloseMobile
}) => {
  const handleNavClick = (view: ActiveView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarBody = (
    <div className="flex flex-col h-full bg-[#FFFFFF] dark:bg-[#111113] border-r border-neutral-200/80 dark:border-neutral-800/90 select-none">
      {/* Brand Header - Single clean line per design contract */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-200/70 dark:border-neutral-800/80 shrink-0">
        <button
          type="button"
          onClick={() => handleNavClick('deploy')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <span className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-transform duration-150 group-hover:scale-[1.03]">
            <FileArchive className="w-3.5 h-3.5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0">
            zipdeploy
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="关闭导航菜单"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="主导航">
        <p className="px-3 pb-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 tracking-wide">
          工作区导航
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'opacity-100' : 'opacity-75'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Controls */}
      <div className="p-3 border-t border-neutral-200/70 dark:border-neutral-800/80 space-y-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100/70 dark:bg-neutral-800/60 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-neutral-300" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-neutral-700" />
            )}
            <span>{theme === 'dark' ? '深色外观' : '浅色外观'}</span>
          </span>
          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenSecurityNotice();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 transition-colors whitespace-nowrap"
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>隐私与安全须知</span>
        </button>

        <button
          type="button"
          onClick={onForceUpdateSite}
          disabled={isRefreshingSite}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 transition-colors whitespace-nowrap disabled:opacity-50"
          title="清除浏览器离线缓存并拉取最新页面"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isRefreshingSite ? 'animate-spin text-neutral-900 dark:text-white' : ''}`} />
          <span>{isRefreshingSite ? '正在更新缓存...' : '清除缓存并刷新'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Rail */}
      <aside className="hidden lg:block w-60 shrink-0 h-screen sticky top-0 z-30">
        {sidebarBody}
      </aside>

      {/* Mobile Slide-Over Rail */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[82vw] h-full shadow-xl z-10">
            {sidebarBody}
          </aside>
        </div>
      )}
    </>
  );
};
