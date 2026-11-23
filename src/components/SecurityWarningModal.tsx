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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sec-warn-title"
    >
      <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <h2 id="sec-warn-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                推送前安全检测提醒
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                检测到待上传压缩包内包含 {findings.length} 处疑似敏感文件或密钥
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="取消上传"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-xs">
          <div className="bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/60 rounded-lg p-3.5 flex items-start gap-2.5 text-amber-950 dark:text-amber-200 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              如果目标仓库是<strong>公开仓库 (Public Repo)</strong>，上传环境变量或真实密钥可能会导致账号或 API 额度被盗用。请核对以下检测命中项：
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto border border-neutral-200/80 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200/70 dark:divide-neutral-800/80 bg-[#F8F8F7] dark:bg-[#0D0D0F]">
            {findings.map((item, idx) => (
              <div key={idx} className="p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {item.path}
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 shrink-0">
                    {item.rule}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  匹配片段：{item.preview}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50/80 dark:bg-[#111113] border-t border-neutral-200/80 dark:border-neutral-800 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            取消上传，回去检查
          </button>
          <button
            type="button"
            onClick={onConfirmProceed}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            <span>我已知晓风险，确认继续上传</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
