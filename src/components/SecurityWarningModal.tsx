import React from 'react';
import { ShieldAlert, X, AlertTriangle, ArrowRight } from 'lucide-react';
import type { SecurityFinding } from '../utils/deployHelpers';

interface SecurityWarningModalProps {
  findings: SecurityFinding[];
  onCancel: () => void;
  onConfirmProceed: () => void;
}

export const SecurityWarningModal: React.FC<SecurityWarningModalProps> = ({
  findings,
  onCancel,
  onConfirmProceed
}) => {
  if (findings.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sec-warn-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#17181C] border border-black/[0.05] dark:border-white/[0.08] rounded-[24px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <h2 id="sec-warn-title" className="text-sm font-semibold text-[#141414] dark:text-white">
                推送前安全检测提醒
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                检测到待上传压缩包内包含 {findings.length} 处疑似敏感文件或密钥
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors"
            aria-label="取消上传"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-xs">
          <div className="bg-amber-50/75 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-950 dark:text-amber-200 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              如果目标仓库是<strong>公开仓库 (Public Repo)</strong>，上传环境变量或真实密钥可能会导致账号或 API 额度被盗用。请核对以下检测命中项：
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto border border-black/[0.06] dark:border-white/[0.07] rounded-2xl divide-y divide-black/[0.04] dark:divide-white/[0.05] bg-[#F2F3F5] dark:bg-[#23252C]">
            {findings.map((item, idx) => (
              <div key={idx} className="p-3.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[#141414] dark:text-white truncate">
                    {item.path}
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 shrink-0">
                    {item.rule}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  匹配片段：{item.preview}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F2F3F5] dark:bg-[#111216] border-t border-black/[0.05] dark:border-white/[0.06] flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#141414] dark:text-zinc-200 bg-white dark:bg-[#17181C] border border-black/[0.06] dark:border-white/[0.08] hover:shadow-sm transition-all"
          >
            取消上传，回去检查
          </button>
          <button
            type="button"
            onClick={onConfirmProceed}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#141414] dark:bg-white text-white dark:text-[#141414] hover:opacity-90 transition-opacity"
          >
            <span>我已知晓风险，确认继续上传</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
