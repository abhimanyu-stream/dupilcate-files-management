/**
 * TwoColumnLayout Component
 * Responsive layout container for unique and duplicate file columns
 * Validates Requirements: 1.2, 1.3, 2.1, 2.6, 10.3, 10.4
 */

import React, { useState } from 'react';
import { FileInfo } from '@/types';
import ColumnHeader from './ColumnHeader';
import FileCard from './FileCard';
import DuplicateGroup from './DuplicateGroup';

interface TwoColumnLayoutProps {
  uniqueFiles: FileInfo[];
  duplicateGroups: Record<string, FileInfo[]>;
  selectedFiles: Set<string>;
  onFileSelect: (path: string) => void;
  onFileDelete: (path: string) => Promise<void>;
  onSelectAll: () => void;
  onDeleteSelected: () => Promise<void>;
}

/**
 * TwoColumnLayout component renders unique files in the left column
 * and duplicate files grouped by hash in the right column.
 * Implements responsive layout and bidirectional hover highlighting.
 */
export default function TwoColumnLayout({
  uniqueFiles,
  duplicateGroups,
  selectedFiles,
  onFileSelect,
  onFileDelete,
  onSelectAll,
  onDeleteSelected,
}: TwoColumnLayoutProps) {
  // State for hover-based highlighting
  const [hoveredHash, setHoveredHash] = useState<string | null>(null);

  // Calculate total duplicate count
  const totalDuplicates = Object.values(duplicateGroups).reduce(
    (sum, duplicates) => sum + duplicates.length,
    0
  );

  // Calculate selected count
  const selectedCount = selectedFiles.size;

  // Create a map of hash to unique file for quick lookup
  const hashToUniqueFile = new Map<string, FileInfo>();
  uniqueFiles.forEach((file) => {
    hashToUniqueFile.set(file.hash, file);
  });

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      data-testid="two-column-layout"
    >
      {/* Left Column: Unique Files */}
      <div
        className="border-r-0 lg:border-r-2 border-gray-200 dark:border-gray-800 pr-0 lg:pr-8"
        data-testid="unique-files-column"
      >
        <ColumnHeader
          title="Unique Files"
          count={uniqueFiles.length}
          showSelectAll={false}
          showDeleteSelected={false}
        />

        {/* Unique Files List */}
        <div className="space-y-4">
          {uniqueFiles.map((file) => (
            <div
              key={file.path}
              onMouseEnter={() => setHoveredHash(file.hash)}
              onMouseLeave={() => setHoveredHash(null)}
            >
              <FileCard
                file={file}
                isUnique={true}
                highlightGroup={hoveredHash === file.hash ? file.hash : undefined}
              />
            </div>
          ))}

          {/* Empty State */}
          {uniqueFiles.length === 0 && (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                No unique files found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Duplicate Files */}
      <div
        className="pl-0 lg:pl-8"
        data-testid="duplicate-files-column"
      >
        <ColumnHeader
          title="Duplicate Files"
          count={totalDuplicates}
          showSelectAll={true}
          showDeleteSelected={true}
          selectedCount={selectedCount}
          onSelectAll={onSelectAll}
          onDeleteSelected={onDeleteSelected}
        />

        {/* Duplicate Groups List */}
        <div className="space-y-6">
          {Object.entries(duplicateGroups).map(([hash, duplicates]) => {
            const uniqueFile = hashToUniqueFile.get(hash);
            
            // Skip if no corresponding unique file found
            if (!uniqueFile) {
              return null;
            }

            return (
              <div
                key={hash}
                onMouseEnter={() => setHoveredHash(hash)}
                onMouseLeave={() => setHoveredHash(null)}
              >
                <DuplicateGroup
                  hash={hash}
                  uniqueFile={uniqueFile}
                  duplicates={duplicates}
                  selectedFiles={selectedFiles}
                  onFileSelect={onFileSelect}
                  onFileDelete={onFileDelete}
                  isHighlighted={hoveredHash === hash}
                />
              </div>
            );
          })}

          {/* Empty State */}
          {Object.keys(duplicateGroups).length === 0 && (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                No duplicate files found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
