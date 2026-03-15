/**
 * ColumnHeader Component
 * Header for file columns with metadata and bulk action controls
 * Validates Requirements: 2.2, 2.3, 2.4, 2.5, 4.3, 4.6, 5.1
 */

import React from 'react';

interface ColumnHeaderProps {
  title: string;
  count: number;
  showSelectAll?: boolean;
  showDeleteSelected?: boolean;
  selectedCount?: number;
  onSelectAll?: () => void;
  onDeleteSelected?: () => Promise<void>;
}

/**
 * ColumnHeader component displays column title, file count, and bulk action controls
 * - For unique files column: displays title and count only
 * - For duplicate files column: includes "Select All" checkbox and "Delete Selected" button
 */
export default function ColumnHeader({
  title,
  count,
  showSelectAll = false,
  showDeleteSelected = false,
  selectedCount = 0,
  onSelectAll,
  onDeleteSelected,
}: ColumnHeaderProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleSelectAllChange = () => {
    if (onSelectAll && !isDeleting) {
      onSelectAll();
    }
  };

  const handleDeleteSelectedClick = async () => {
    if (onDeleteSelected && !isDeleting) {
      setIsDeleting(true);
      try {
        await onDeleteSelected();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="border-2 border-black dark:border-white pb-8 mb-10">
      {/* Column Title and Count */}
      <div className="flex items-center justify-between mb-6 bg-black dark:bg-white px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-white dark:text-black uppercase tracking-widest">
            {title}
          </h2>
          <p className="text-xs text-gray-300 dark:text-gray-700 mt-1 uppercase tracking-widest">
            {count} {count !== 1 ? 'Files' : 'File'}
          </p>
        </div>

        {/* Delete Selected Button - Only visible when selections exist */}
        {showDeleteSelected && selectedCount > 0 && (
          <button
            onClick={handleDeleteSelectedClick}
            disabled={isDeleting}
            className={`
              px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-2
              ${
                isDeleting
                  ? 'bg-gray-700 dark:bg-gray-300 text-gray-400 dark:text-gray-600 border-gray-700 dark:border-gray-300 cursor-not-allowed'
                  : 'bg-white dark:bg-black text-black dark:text-white border-white dark:border-black hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-white dark:focus:ring-black'
              }
            `}
            aria-label="Delete selected files"
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
              `Delete (${selectedCount})`
            )}
          </button>
        )}
      </div>

      {/* Select All Checkbox - Only for duplicate column */}
      {showSelectAll && (
        <div className="flex items-center justify-between px-6 pt-6 border-t-2 border-black dark:border-white">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input
              type="checkbox"
              onChange={handleSelectAllChange}
              disabled={isDeleting}
              checked={selectedCount > 0 && selectedCount === count}
              className="w-5 h-5 border-2 border-black dark:border-white rounded-none focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed accent-black dark:accent-white"
              aria-label="Select all duplicate files"
            />
            <span className="text-xs font-bold text-black dark:text-white uppercase tracking-widest group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              Select All
            </span>
          </label>

          {/* Selected Count Display */}
          {selectedCount > 0 && (
            <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-widest font-medium">
              {selectedCount} Selected
            </span>
          )}
        </div>
      )}
    </div>
  );
}
