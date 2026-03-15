/**
 * DuplicateGroup Component
 * Groups duplicate files that share the same hash with visual relationship indicators
 * Validates Requirements: 1.6, 10.1, 10.2, 10.5
 */

import React from 'react';
import { FileInfo } from '@/types';
import FileCard from './FileCard';

interface DuplicateGroupProps {
  hash: string;
  uniqueFile: FileInfo;
  duplicates: FileInfo[];
  selectedFiles: Set<string>;
  onFileSelect: (path: string) => void;
  onFileDelete: (path: string) => Promise<void>;
  isHighlighted: boolean;
}

/**
 * DuplicateGroup component displays a group of duplicate files
 * with visual indicators connecting them to their unique file
 */
export default function DuplicateGroup({
  hash,
  uniqueFile,
  duplicates,
  selectedFiles,
  onFileSelect,
  onFileDelete,
  isHighlighted,
}: DuplicateGroupProps) {
  return (
    <div
      className={`
        border-l-4 pl-6 mb-6 transition-all duration-200
        ${isHighlighted 
          ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900 -ml-2 pl-8' 
          : 'border-gray-300 dark:border-gray-700'
        }
      `}
      data-group-hash={hash}
      data-unique-file-path={uniqueFile.path}
    >
      {/* Group Header */}
      <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">
              Duplicates of
            </p>
            <h3 className="text-sm font-semibold text-black dark:text-white">
              {uniqueFile.filename}
            </h3>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Duplicate Files */}
      <div className="space-y-3">
        {duplicates.map((file) => (
          <FileCard
            key={file.path}
            file={file}
            isUnique={false}
            isSelected={selectedFiles.has(file.path)}
            onSelect={onFileSelect}
            onDelete={onFileDelete}
            highlightGroup={isHighlighted ? hash : undefined}
          />
        ))}
      </div>
    </div>
  );
}
