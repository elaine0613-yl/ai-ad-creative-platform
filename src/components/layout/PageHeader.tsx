"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Bell, Search } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** 页面自带搜索时可隐藏顶栏全局搜索，避免重复占位 */
  hideGlobalSearch?: boolean;
  /** 二级工具栏，渲染在标题行下方（如分类切换、筛选） */
  toolbar?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  hideGlobalSearch = false,
  toolbar,
}: PageHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white">
      <div className="flex flex-col gap-4 px-6 py-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          {actions}
          {!hideGlobalSearch && (
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="搜索素材、模板..."
                className="w-52 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 xl:w-60"
              />
            </div>
          )}
          <button
            type="button"
            className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="通知"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
            <span className="text-xs text-gray-500">额度</span>
            <span className="text-sm font-semibold tabular-nums text-brand-700">
              {user?.credits ?? "--"}/{user?.totalCredits ?? "--"}
            </span>
          </div>
        </div>
      </div>

      {toolbar && <div className="border-t border-gray-100 px-6 py-3">{toolbar}</div>}
    </header>
  );
}
