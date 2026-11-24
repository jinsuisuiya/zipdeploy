import React, { useEffect, useMemo, useState } from 'react';
import { X, Copy, Check, FileCode, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import type { ExtractedFile } from '../data/knowledgeBase';
import { isImageFile, isTextFile } from '../utils/deployHelpers';

interface FilePreviewModalProps {
  file: ExtractedFile | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [file, onClose]);

  const isImg = useMemo(() => (file ? isImageFile(file.path) : false), [file]);
  const isTxt = useMemo(() => (file ? isTextFile(file.path) : false), [file]);

  const imageUrl = useMemo(() => {
    if (!file || !isImg) return null;
    const ext = file.path.split('.').pop()?.toLowerCase();
    const mime =
      ext === 'svg'
        ? 'image/svg+xml'
        : ext === 'png'
        ? 'image/png'
        : ext === 'gif'
        ? 'image/gif'
        : ext === 'webp'
        ? 'image/webp'
        : 'image/jpeg';
    return URL.createObjectURL(new Blob([new Uint8Array(file.content)], { type: mime }));
  }, [file, isImg]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const textContent = useMemo(() => {
    if (!file || !isTxt) return null;
    const maxPreviewBytes = 300 * 1024;
    const slice = file.content.byteLength > maxPreviewBytes ? file.content.subarray(0, maxPreviewBytes) : file.content;
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(slice);
    return {
      text: decoded,
      truncated: file.content.byteLength > maxPreviewBytes
    };
  }, [file, isTxt]);

  if (!file) return null;

  const lines = textContent ? textContent.text.split('\n') : [];

  const handleCopy = () => {
    if (!textContent) return;
    navigator.clipboard.writeText(textContent.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="文件即时预览"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-[#17181C] border border-black/[0.05] dark:border-white/[0.08] rounded-[24px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center shrink-0">
              {isImg ? (
                <ImageIcon className="w-3.5 h-3.5" />
              ) : isTxt ? (
                <FileCode className="w-3.5 h-3.5" />
              ) : (
                <FileIcon className="w-3.5 h-3.5" />
              )}
            </span>
            <span className="font-mono text-xs font-semibold text-[#141414] dark:text-white truncate">
              {file.path}
            </span>
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0 tabular-nums">
              · {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {textContent && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#F2F3F5] dark:bg-[#23252C] text-[#141414] dark:text-zinc-200 hover:bg-[#E5E7EB] dark:hover:bg-[#2E303A] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制内容'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F3F5] dark:hover:bg-[#23252C] transition-colors"
              aria-label="关闭预览"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#ECEDEF] dark:bg-[#0C0D0F]">
          {isImg && imageUrl ? (
            <div className="p-8 flex flex-col items-center justify-center min-h-[280px] gap-4">
              <img
                src={imageUrl}
                alt={file.path}
                className="max-w-full max-h-[55vh] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm object-contain bg-white dark:bg-[#17181C]"
              />
            </div>
          ) : textContent ? (
            <div className="p-5 font-mono text-xs leading-relaxed text-[#141414] dark:text-zinc-200">
              {textContent.truncated && (
                <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px]">
                  文件较大，仅展示前 300 KB 内容供快速核对。
                </div>
              )}
              <table className="w-full border-collapse">
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                      <td className="select-none pr-4 text-right text-[11px] text-zinc-400 dark:text-zinc-600 align-top w-10 tabular-nums">
                        {i + 1}
                      </td>
                      <td className="whitespace-pre-wrap break-all">{line || ' '}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-2">
              <FileIcon className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-xs font-medium text-[#141414] dark:text-zinc-300">
                二进制文件暂不支持纯文本预览
              </p>
              <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                文件大小：{(file.size / 1024).toFixed(2)} KB ({file.size} bytes)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
