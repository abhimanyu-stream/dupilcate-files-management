/**
 * FolderSelector Component
 * Allows users to input a folder path and scan for duplicates
 */

'use client';

import { useState, useEffect } from 'react';

interface FolderSelectorProps {
  onScan: (path: string) => void;
  isScanning: boolean;
}

export default function FolderSelector({ onScan, isScanning }: FolderSelectorProps) {
  const [folderPath, setFolderPath] = useState('');
  const [recentPaths, setRecentPaths] = useState<string[]>([]);
  const [showBrowseInfo, setShowBrowseInfo] = useState(false);
  const [showPathInput, setShowPathInput] = useState(false);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [userAcknowledged, setUserAcknowledged] = useState(false);

  // Load recent paths on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentPaths');
      if (saved) {
        try {
          setRecentPaths(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load recent paths', e);
        }
      }
    }
  }, []);

  const handleBrowse = async () => {
    try {
      // Try to use File System Access API (Chrome/Edge)
      // @ts-ignore - showDirectoryPicker is not in all TypeScript types yet
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        
        // Get folder name
        setSelectedFolderName(dirHandle.name);
        
        // Try to get some path information from the first file
        try {
          // @ts-ignore
          for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              // Try to extract path information
              if (file.webkitRelativePath) {
                const pathParts = file.webkitRelativePath.split('/');
                if (pathParts.length > 1) {
                  setSelectedFolderName(pathParts[0]);
                }
              }
              break; // Only need first file
            }
          }
        } catch (e) {
          console.log('Could not read directory contents');
        }
        
        setShowPathInput(true);
      } else {
        // Fallback for browsers that don't support File System Access API
        const input = document.createElement('input');
        input.type = 'file';
        // @ts-ignore
        input.webkitdirectory = true;
        // @ts-ignore
        input.directory = true;
        input.multiple = true;
        
        input.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            const file = target.files[0];
            const fullPath = file.webkitRelativePath || file.name;
            const pathParts = fullPath.split('/');
            
            if (pathParts.length > 1) {
              setSelectedFolderName(pathParts[0]);
            }
          }
          setShowPathInput(true);
        };
        
        input.click();
      }
    } catch (err) {
      console.error('Error selecting directory:', err);
      // User cancelled or error occurred
    }
  };

  const handlePathConfirm = () => {
    const input = document.getElementById('full-path-input') as HTMLInputElement;
    if (input && input.value.trim() && userAcknowledged) {
      const path = input.value.trim();
      
      // Validate that it's not just the folder name
      if (path === selectedFolderName) {
        alert('Please enter the complete path, not just the folder name.\n\nExample: C:\\Users\\YourName\\' + selectedFolderName);
        return;
      }
      
      // Check if path looks like a valid Windows path
      if (!path.includes('\\') && !path.includes('/') && !path.includes(':')) {
        alert('Please enter a complete path.\n\nExample: C:\\Users\\YourName\\' + selectedFolderName);
        return;
      }
      
      setFolderPath(path);
      setShowPathInput(false);
      setUserAcknowledged(false); // Reset for next time
    } else if (!input.value.trim()) {
      alert('Please enter a folder path');
    }
  };

  const handleHelp = () => {
    setShowBrowseInfo(true);
  };

  const handleScan = () => {
    if (folderPath.trim()) {
      // Add to recent paths (client-side only)
      if (typeof window !== 'undefined' && !recentPaths.includes(folderPath)) {
        const updated = [folderPath, ...recentPaths.slice(0, 4)];
        setRecentPaths(updated);
        localStorage.setItem('recentPaths', JSON.stringify(updated));
      }
      onScan(folderPath);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isScanning) {
      handleScan();
    }
  };

  const selectRecentPath = (path: string) => {
    setFolderPath(path);
  };

  const removeRecentPath = (pathToRemove: string) => {
    const updated = recentPaths.filter(path => path !== pathToRemove);
    setRecentPaths(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentPaths', JSON.stringify(updated));
    }
  };

  const commonPaths = [
    { label: 'Documents', path: 'C:/Users/Public/Documents' },
    { label: 'Downloads', path: 'C:/Users/Public/Downloads' },
    { label: 'Pictures', path: 'C:/Users/Public/Pictures' },
    { label: 'Desktop', path: 'C:/Users/Public/Desktop' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Path Input Modal */}
      {showPathInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full p-6 border border-gray-300 dark:border-gray-700">
            <div className="mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Enter Complete Folder Path
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected folder: <span className="font-semibold text-gray-900 dark:text-white">{selectedFolderName}</span>
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 text-base">
                      Browser Security Limitation
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                      Web browsers cannot automatically retrieve complete file system paths (including drive letters) due to security restrictions. 
                      You selected: <span className="font-bold">{selectedFolderName}</span>
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                      Please provide the complete path manually. For example, if you selected "god songs" from "D:\Additional-C\", 
                      enter: <span className="font-mono font-bold">D:\Additional-C\god songs</span>
                    </p>
                    
                    {/* User Acknowledgment Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded border border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-all">
                      <input
                        type="checkbox"
                        checked={userAcknowledged}
                        onChange={(e) => setUserAcknowledged(e.target.checked)}
                        className="w-5 h-5 mt-0.5 border-2 border-yellow-600 dark:border-yellow-500 rounded focus:ring-2 focus:ring-yellow-500 accent-yellow-600 flex-shrink-0"
                      />
                      <span className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                        I understand and will provide the complete path including the drive letter (e.g., D:\Additional-C\god songs)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Complete Folder Path: <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="full-path-input"
                  placeholder={`C:\\Users\\YourName\\${selectedFolderName}`}
                  defaultValue=""
                  disabled={!userAcknowledged}
                  className={`w-full px-4 py-3 border rounded-lg text-base font-mono transition-all
                    ${userAcknowledged 
                      ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }
                    placeholder-gray-400 dark:placeholder-gray-500
                  `}
                  autoFocus={userAcknowledged}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && userAcknowledged) {
                      handlePathConfirm();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {userAcknowledged 
                    ? 'Enter the complete path (e.g., C:\\Users\\YourName\\FolderName) or use quick suggestions below' 
                    : 'Please acknowledge the security limitation above to enable this field'
                  }
                </p>
              </div>

              {/* Quick Path Suggestions */}
              {userAcknowledged && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Quick Path Suggestions (click to use):
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => {
                        const input = document.getElementById('full-path-input') as HTMLInputElement;
                        if (input) input.value = `C:\\Users\\Public\\${selectedFolderName}`;
                      }}
                      className="px-3 py-2 text-left text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-all"
                    >
                      <span className="font-mono">C:\Users\Public\{selectedFolderName}</span>
                    </button>
                    <button
                      onClick={() => {
                        const input = document.getElementById('full-path-input') as HTMLInputElement;
                        if (input) input.value = `C:\\Users\\${window.navigator.userAgent.includes('Windows') ? 'YourName' : 'Public'}\\${selectedFolderName}`;
                      }}
                      className="px-3 py-2 text-left text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-all"
                    >
                      <span className="font-mono">C:\Users\YourName\{selectedFolderName}</span>
                    </button>
                    <button
                      onClick={() => {
                        const input = document.getElementById('full-path-input') as HTMLInputElement;
                        if (input) input.value = `D:\\${selectedFolderName}`;
                      }}
                      className="px-3 py-2 text-left text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-all"
                    >
                      <span className="font-mono">D:\{selectedFolderName}</span>
                    </button>
                    <button
                      onClick={() => {
                        const input = document.getElementById('full-path-input') as HTMLInputElement;
                        if (input) input.value = `D:\\Additional-C\\${selectedFolderName}`;
                      }}
                      className="px-3 py-2 text-left text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-all"
                    >
                      <span className="font-mono">D:\Additional-C\{selectedFolderName}</span>
                    </button>
                    <button
                      onClick={() => {
                        const input = document.getElementById('full-path-input') as HTMLInputElement;
                        if (input) input.value = `C:\\${selectedFolderName}`;
                      }}
                      className="px-3 py-2 text-left text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-all"
                    >
                      <span className="font-mono">C:\{selectedFolderName}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* How to Get Path Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to get the complete folder path:
                </p>
                <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-2 list-decimal list-inside ml-2">
                  <li>Open File Explorer (Windows + E)</li>
                  <li>Navigate to the folder you just selected: <span className="font-bold">{selectedFolderName}</span></li>
                  <li>Click the address bar at the top (it will highlight the full path)</li>
                  <li>Copy the complete path (Ctrl + C)</li>
                  <li>Paste it in the input field above (Ctrl + V)</li>
                </ol>
                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-300 dark:border-blue-700">
                  <p className="text-xs text-blue-900 dark:text-blue-200 font-semibold mb-1">Example:</p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-mono">
                    If you selected "god songs" from D:\Additional-C\<br/>
                    The complete path is: <span className="font-bold">D:\Additional-C\god songs</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPathInput(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePathConfirm}
                disabled={!userAcknowledged}
                className={`px-6 py-2 text-white text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${userAcknowledged
                    ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                  }
                `}
                title={!userAcknowledged ? 'Please acknowledge the security limitation first' : 'Confirm and use this path'}
              >
                Confirm Path
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse Info Modal */}
      {showBrowseInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-300 dark:border-gray-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  How to Browse for Folders
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                  <p>
                    Due to browser security restrictions, you need to manually enter the folder path.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Windows:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Open File Explorer</li>
                      <li>Navigate to your folder</li>
                      <li>Click the address bar</li>
                      <li>Copy the path (Ctrl+C)</li>
                      <li>Paste it in the input field</li>
                    </ol>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Example paths:</p>
                    <ul className="text-xs space-y-1 font-mono">
                      <li>C:/Users/YourName/Documents</li>
                      <li>C:/Users/YourName/Downloads</li>
                      <li>D:/Projects</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBrowseInfo(false)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 mb-6 rounded-lg">
          <svg 
            className="w-16 h-16 text-gray-700 dark:text-gray-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-4">
          Find Duplicate Files
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Scan any directory to identify duplicate files and free up disk space. 
          Enter a folder path below to get started.
        </p>
      </div>

      {/* Main Input Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-8 mb-8">
        <label 
          htmlFor="folder-path" 
          className="block text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4"
        >
          Folder Path
        </label>
        <div className="flex gap-3">
          <input
            id="folder-path"
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="C:/Users/YourName/Documents"
            disabled={isScanning}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
            aria-label="Enter folder path to scan"
          />
          <button
            onClick={handleBrowse}
            disabled={isScanning}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Browse for folder"
            title="Select a folder from your computer"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Browse</span>
            </div>
          </button>
          <button
            onClick={handleHelp}
            disabled={isScanning}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="How to browse for folder"
            title="Click for instructions on how to get folder path"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help</span>
            </div>
          </button>
          <button
            onClick={handleScan}
            disabled={!folderPath.trim() || isScanning}
            className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Start scanning for duplicates"
          >
            {isScanning ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                <span>Scanning...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Scan</span>
              </div>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Enter the full path manually or click Browse to select a folder. Click Help for detailed instructions.
        </p>
      </div>

      {/* Common Paths */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {commonPaths.map((item) => (
            <button
              key={item.path}
              onClick={() => selectRecentPath(item.path)}
              disabled={isScanning}
              className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left shadow-sm"
              aria-label={`Select ${item.label} folder`}
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.path}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Paths */}
      {recentPaths.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
              Recent Scans
            </h2>
            <button
              onClick={() => {
                setRecentPaths([]);
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('recentPaths');
                }
              }}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold uppercase tracking-wider transition-colors"
              aria-label="Clear all recent scans"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {recentPaths.map((path, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all shadow-sm group"
              >
                <button
                  onClick={() => selectRecentPath(path)}
                  disabled={isScanning}
                  className="flex-1 flex items-center gap-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Select recent path: ${path}`}
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-900 dark:text-white truncate flex-1">
                    {path}
                  </span>
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentPath(path);
                  }}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                  aria-label={`Remove ${path} from recent scans`}
                  title="Remove from recent scans"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-bold rounded-full">
                1
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Enter Path
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Type or select a folder path to scan for duplicate files
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-bold rounded-full">
                2
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Scan Files
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              The system analyzes files using SHA-256 hash comparison
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-bold rounded-full">
                3
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Manage Files
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Review duplicates and delete unwanted files to free up space
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
