/**
 * LeftSidebar Component
 * Enhanced left navigation sidebar with features and white background
 */

'use client';

import { useState } from 'react';

interface LeftSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  totalFiles?: number;
  totalDuplicates?: number;
  onScanClick?: () => void;
  onRefresh?: () => void;
}

export default function LeftSidebar({ 
  activeView, 
  onViewChange,
  totalFiles = 0,
  totalDuplicates = 0,
  onScanClick,
  onRefresh
}: LeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      description: 'Scan folders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'duplicates',
      label: 'Duplicates',
      description: 'Manage files',
      badge: totalDuplicates > 0 ? totalDuplicates : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Statistics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside 
      className={`bg-white dark:bg-gray-950 border-r-2 border-black dark:border-white flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b-2 border-black dark:border-white">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-bold text-black dark:text-white uppercase tracking-widest">
              Menu
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border-2 border-transparent hover:border-black dark:hover:border-white"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-4 h-4 text-black dark:text-white transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {!isCollapsed && totalFiles > 0 && (
        <div className="p-4 border-b-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400">
                Total Files
              </span>
              <span className="text-sm font-bold text-black dark:text-white">
                {totalFiles}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400">
                Duplicates
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {totalDuplicates}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scan Button */}
      {!isCollapsed && onScanClick && totalFiles > 0 && (
        <div className="p-4 border-b-2 border-black dark:border-white">
          <button
            onClick={onScanClick}
            className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all border-2 border-black dark:border-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
            aria-label="Scan new directory"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Scan Directory</span>
            </div>
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all border-2 relative
                  ${
                    activeView === item.id
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 border-transparent hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                aria-label={item.label}
                aria-current={activeView === item.id ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <span>{item.label}</span>
                      <span className="text-[10px] font-normal normal-case tracking-normal opacity-60">
                        {item.description}
                      </span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-2 py-1 bg-red-600 dark:bg-red-400 text-white dark:text-black text-xs font-bold rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t-2 border-black dark:border-white">
          <div className="space-y-2">
            <button
              onClick={async () => {
                if (onRefresh && !isRefreshing) {
                  setIsRefreshing(true);
                  try {
                    await onRefresh();
                  } finally {
                    setIsRefreshing(false);
                  }
                }
              }}
              disabled={isRefreshing || !onRefresh}
              className="w-full px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white border-2 border-transparent hover:border-black dark:hover:border-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh data"
            >
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </div>
            </button>
            <button
              className="w-full px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white border-2 border-transparent hover:border-black dark:hover:border-white transition-all"
              aria-label="Help and documentation"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Help</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="p-6 border-t-2 border-black dark:border-white">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-widest">
            <p className="mb-1">Version 1.0.0</p>
            <p>© 2026 File Manager</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-8 h-8 bg-black dark:bg-white mx-auto"></div>
          </div>
        )}
      </div>
    </aside>
  );
}
