import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearStorageAndReset = () => {
    localStorage.clear();
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f7f6] flex items-center justify-center p-4 font-sans text-neutral-800">
          <div className="bg-white border border-neutral-200 rounded-[28px] p-6 md:p-8 max-w-xl w-full shadow-[0_12px_40px_rgb(0,0,0,0.06)] space-y-5">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">页面渲染拦截与自动防护</h2>
                <p className="text-xs text-neutral-500 mt-0.5">捕获到了运行时错误，已成功阻止白屏问题崩溃</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-950 space-y-2">
              <div className="font-bold text-rose-900">错误日志详情：</div>
              <p className="font-mono bg-white/80 p-2.5 rounded-xl border border-rose-200 text-[11px] overflow-x-auto text-rose-900">
                {this.state.error?.toString() || '未知渲染异常'}
              </p>
            </div>

            <div className="text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800">💡 如何解决：</p>
              <p>1. 点击下方「刷新恢复页面」尝试恢复应用运行。</p>
              <p>2. 若仍然报错，可点击「清空本地缓存并恢复」，重置本地保存的配置与状态。</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-neutral-100">
              <button
                onClick={this.handleClearStorageAndReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
                <span>清空本地缓存并重置</span>
              </button>

              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>刷新恢复页面</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
