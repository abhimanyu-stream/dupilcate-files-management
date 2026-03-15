/**
 * FileCard Component
 * Displays individual file information with actions and image preview
 * Validates Requirements: 1.4, 1.5, 3.1, 4.1, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState } from 'react';
import { FileInfo, formatFileSize, formatModificationDate } from '@/types';

interface FileCardProps {
  file: FileInfo;
  isUnique: boolean;
  isSelected?: boolean;
  isDeleting?: boolean;
  onSelect?: (path: string) => void;
  onDelete?: (path: string) => Promise<void>;
  highlightGroup?: string;
}

export default function FileCard({
  file,
  isUnique,
  isSelected = false,
  isDeleting = false,
  onSelect,
  onDelete,
  highlightGroup,
}: FileCardProps) {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const url = getFilePreviewUrl();
    console.error('=== IMAGE LOAD FAILED ===');
    console.error('File path:', file.path);
    console.error('Image URL:', url);
    
    // Try to fetch and log the actual error
    try {
      const response = await fetch(url);
      console.error('HTTP Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text.substring(0, 500));
      } else {
        console.error('Response was OK but image still failed to load - possible CORS or content type issue');
      }
    } catch (fetchError) {
      console.error('Network/Fetch error:', fetchError);
      console.error('This usually means:');
      console.error('1. Backend is not running on http://localhost:8080');
      console.error('2. CORS is blocking the request');
      console.error('3. Network connectivity issue');
    }
    console.error('=== END IMAGE ERROR ===');
    
    setImageError(true);
  };

  const handleCheckboxChange = () => {
    if (onSelect && !isDeleting) {
      onSelect(file.path);
    }
  };

  const handleDeleteClick = async () => {
    if (onDelete && !isDeleting) {
      await onDelete(file.path);
    }
  };

  const isImage = () => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
    return imageExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
  };

  const getFilePreviewUrl = () => {
    // Use backend API to serve the file
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    const url = `${apiBaseUrl}/file/preview?path=${encodeURIComponent(file.path)}`;
    return url;
  };

  const isHighlighted = highlightGroup === file.hash;

  const getFileTypeBadgeColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      images: 'bg-blue-600 dark:bg-blue-500',
      documents: 'bg-gray-700 dark:bg-gray-400',
      videos: 'bg-purple-600 dark:bg-purple-500',
      audio: 'bg-green-600 dark:bg-green-500',
      archives: 'bg-orange-600 dark:bg-orange-500',
      other: 'bg-gray-500 dark:bg-gray-500',
    };
    return colorMap[category.toLowerCase()] || colorMap.other;
  };

  return (
    <>
      <div
        className={`
          border-2 transition-all duration-200 p-6 rounded-lg
          ${isHighlighted 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950 shadow-lg' 
            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'
          }
          ${isDeleting ? 'opacity-50' : ''}
          hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md
        `}
        data-file-path={file.path}
        data-file-hash={file.hash}
        data-is-unique={isUnique}
      >
        {isImage() && (
          <div className="mb-4">
            <button
              onClick={() => setShowImagePreview(true)}
              className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
            >
              {!imageError ? (
                <>
                  <img
                    src={getFilePreviewUrl()}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    onLoad={() => {
                      console.log('✓ Image loaded:', file.filename);
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Preview unavailable</p>
                  </div>
                </div>
              )}
            </button>
          </div>
        )}

        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white break-all">
            {file.filename}
          </h3>
          
          <span
            className={`
              ml-4 px-3 py-1 text-xs font-semibold text-white rounded whitespace-nowrap
              ${getFileTypeBadgeColor(file.fileTypeCategory)}
            `}
          >
            {file.fileTypeCategory}
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 break-all font-mono">
          {file.path}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Size</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatFileSize(file.size)}</span>
          </div>

          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Modified</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatModificationDate(file.modificationDate)}</span>
          </div>
        </div>

        {!isUnique && (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
                disabled={isDeleting}
                className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed accent-blue-600"
                aria-label={`Select ${file.filename}`}
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {isSelected ? 'Selected' : 'Select'}
              </span>
            </label>

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={`
                px-6 py-2 text-xs font-semibold rounded-lg transition-all
                ${
                  isDeleting
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500'
                }
              `}
              aria-label={`Delete ${file.filename}`}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting
                </span>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        )}
      </div>

      {showImagePreview && isImage() && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-10"
              aria-label="Close preview"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-4">
              {!imageError ? (
                <img
                  src={getFilePreviewUrl()}
                  alt={file.filename}
                  className="max-w-full max-h-[80vh] object-contain mx-auto"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">Unable to load image preview</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{file.filename}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{file.path}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Size: <span className="font-semibold">{formatFileSize(file.size)}</span>
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Modified: <span className="font-semibold">{formatModificationDate(file.modificationDate)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
