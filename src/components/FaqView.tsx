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
    <div className="max-w-4xl space-y-8">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            故障排查全集 · {FAQ_ERRORS.length} 项高频报错对照表
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            常见报错代码与自助排障百科
          </h2>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索报错码或关键字 (如 403 / Pages)"
            className="w-full bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-400 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
        </div>
      </div>

      {/* Error Encyclopedia List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span>错误代码速查列表</span>
          </h3>
          <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
            显示 {filteredErrors.length} / {FAQ_ERRORS.length} 项
          </span>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] divide-y divide-neutral-200/70 dark:divide-neutral-800/80">
          {filteredErrors.map((item) => (
            <div
              key={item.id}
              className={`p-5 space-y-2 ${
                item.highlighted ? 'bg-rose-50/40 dark:bg-rose-950/15' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {String(item.id).padStart(2, '0')}. {item.title}
                </h4>
                <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
                  {item.code}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">原因：</span>
                {item.reason}
              </p>
              <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed pt-0.5">
                <span className="font-medium text-neutral-900 dark:text-white">解决办法：</span>
                {item.solution}
              </p>
            </div>
          ))}

          {filteredErrors.length === 0 && (
            <div className="p-10 text-center text-xs text-neutral-400 dark:text-neutral-500">
              未找到包含「{searchQuery}」的报错条目，请尝试其他关键字。
            </div>
          )}
        </div>
      </section>

      {/* Core FAQ Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <span>机制说明与常见问答</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CORE_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2"
            >
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {faq.question}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
