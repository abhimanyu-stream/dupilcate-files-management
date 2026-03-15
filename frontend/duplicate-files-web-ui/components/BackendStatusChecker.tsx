/**
 * BackendStatusChecker Component
 * Displays backend connection status
 */

'use client';

import { useState, useEffect } from 'react';

export default function BackendStatusChecker() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkBackend();
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/health');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'UP') {
          setStatus('online');
          setError('');
        } else {
          setStatus('offline');
          setError('Backend returned unexpected status');
        }
      } else {
        setStatus('offline');
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setStatus('offline');
      setError('Cannot connect to backend. Is it running on port 8080?');
      console.error('Backend health check failed:', err);
    }
  };

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Checking backend...
          </span>
        </div>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 rounded-lg p-3 shadow-lg z-50 max-w-sm">
        <div className="flex items-start gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="text-xs font-bold text-red-900 dark:text-red-200 mb-1">
              Backend Offline
            </div>
            <div className="text-xs text-red-800 dark:text-red-300 mb-2">
              {error}
            </div>
            <button
              onClick={checkBackend}
              className="text-xs bg-red-600 dark:bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 dark:hover:bg-red-600 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-700 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-xs font-semibold text-green-900 dark:text-green-200">
          Backend Online
        </span>
      </div>
    </div>
  );
}
