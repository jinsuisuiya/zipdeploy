import React, { useState } from 'react';
import { Search, ShieldAlert, BookOpen } from 'lucide-react';
import { FAQ_ERRORS, CORE_FAQS } from '../data/knowledgeBase';

export const FaqView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredErrors = FAQ_ERRORS.filter(
    (item) =>
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.solution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-w-0 max-w-4xl space-y-7">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-black/[0.07] dark:border-white/[0.08]">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            故障排查全集 · {FAQ_ERRORS.length} 项高频报错对照表
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-[#141414] dark:text-white">
            常见报错代码与自助排障百科
          </h2>
        </div>

        <div className="relative w-full md:w-76 shrink-0 flex items-center">
          <span className="w-8 h-8 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center absolute left-1 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索报错码或关键字 (如 403 / Pages)"
            className="w-full bg-white dark:bg-[#17181C] border border-black/[0.06] dark:border-white/[0.08] focus:border-[#141414] dark:focus:border-white rounded-full pl-11 pr-4 py-2.5 text-xs text-[#141414] dark:text-white placeholder:text-zinc-400 focus:outline-none transition-colors shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]"
          />
        </div>
      </div>

      {/* Error Encyclopedia List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#141414] dark:text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
            <span>错误代码速查列表</span>
          </h3>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
            显示 {filteredErrors.length} / {FAQ_ERRORS.length} 项
          </span>
        </div>

        <div className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] divide-y divide-black/[0.05] dark:divide-white/[0.06] overflow-hidden">
          {filteredErrors.map((item) => (
            <div
              key={item.id}
              className={`p-5 sm:p-6 space-y-2 ${
                item.highlighted ? 'bg-rose-50/40 dark:bg-rose-950/15' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-[#141414] dark:text-white">
                  {String(item.id).padStart(2, '0')}. {item.title}
                </h4>
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                  {item.code}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <span className="font-medium text-[#141414] dark:text-zinc-200">原因：</span>
                {item.reason}
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pt-0.5">
                <span className="font-medium text-[#141414] dark:text-white">解决办法：</span>
                {item.solution}
              </p>
            </div>
          ))}

          {filteredErrors.length === 0 && (
            <div className="p-12 text-center text-xs text-zinc-400">
              未找到包含「{searchQuery}」的报错条目，请尝试其他关键字。
            </div>
          )}
        </div>
      </section>

      {/* Core FAQ Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-[#141414] dark:text-white flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-[#141414] dark:bg-white text-white dark:text-[#141414] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          <span>机制说明与常见问答</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CORE_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#17181C] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] p-6 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.06)] space-y-2"
            >
              <h4 className="text-xs font-semibold text-[#141414] dark:text-white">
                {faq.question}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
