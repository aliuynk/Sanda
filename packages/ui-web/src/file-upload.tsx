'use client';

import * as React from 'react';

import { cn } from './utils';

/* ---------------------------------------------------------------------------
 * FileUpload — drag-and-drop file upload with preview.
 * -------------------------------------------------------------------------- */

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  onFilesSelected: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
}

export function FileUpload({
  accept,
  multiple = false,
  maxSizeMb = 10,
  onFilesSelected,
  className,
  children,
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.size <= maxSizeMb * 1024 * 1024);
    if (valid.length > 0) onFilesSelected(valid);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all',
        dragActive
          ? 'border-primary/50 bg-primary/[0.06]'
          : 'border-border/80 bg-muted/20 hover:border-primary/30 hover:bg-primary/[0.03]',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {children ?? (
        <>
          <svg className="mb-3 h-10 w-10 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-sm font-medium text-foreground">
            Dosya sürükleyin veya <span className="text-primary">seçin</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Maksimum {maxSizeMb} MB
          </p>
        </>
      )}
    </div>
  );
}
