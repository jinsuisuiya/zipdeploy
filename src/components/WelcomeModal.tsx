import React, { useState } from 'react';
import { ShieldCheck, Lock, HardDrive, Key, CheckCircle2, X } from 'lucide-react';

interface WelcomeModalProps {
  open: boolean;
  isFirstVisit: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  open,
  isFirstVisit,
  onAccept,
  onClose
}) => {
  const [confirmed, setConfirmed] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.16)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="welcome-modal-title"
                className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
              >
                欢迎使用 zipdeploy · 使用前安全须知
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                请花 10 秒阅读以下隐私与密钥安全说明后继续
              </p>
            </div>
          </div>

          {!isFirstVisit && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 divide-y divide-neutral-200/70 dark:divide-neutral-800/80 text-xs">
          <div className="space-y-1.5">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span>这是一个什么样的网站？</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed pl-5">
              zipdeploy 是一个面向开发者与零基础用户的极简浏览器端部署工作台：无需配置 Git 命令行或终端环境，即可直接在网页中解压 <code className="font-mono">.zip</code> 源码包，并通过官方 GitHub REST API 一键推送覆写至目标仓库与 GitHub Pages。
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span>所有数据均保存在本地，绝不上传至云端</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed pl-5">
              本工具采用纯前端本地运行架构：你的压缩包解压、文件扫描、GitHub Token 以及仓库配置参数均<strong>只保存在你自己的浏览器内存与本地存储（localStorage）中</strong>，不会经过或上传至任何第三方中间服务器。
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>GitHub Token 安全保管提示</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed pl-5">
              GitHub Personal Access Token 拥有操作你代码仓库的高级权限，非常重要！请妥善保管、切勿截图或泄露给他人；在公共设备使用后请点击「重置表单」清空本地缓存，并建议<strong>定期前往 GitHub 吊销旧 Token 并更新新密钥</strong>。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50/80 dark:bg-[#111113] border-t border-neutral-200/80 dark:border-neutral-800 space-y-3">
          {isFirstVisit ? (
            <>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 accent-neutral-900 dark:accent-white rounded border-neutral-300 dark:border-neutral-700"
                />
                <span>我已仔细阅读并理解本地运行机制与 GitHub Token 安全保管规范</span>
              </label>

              <button
                type="button"
                disabled={!confirmed}
                onClick={onAccept}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>确认并进入 zipdeploy 工作台</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              我已了解，关闭须知
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
