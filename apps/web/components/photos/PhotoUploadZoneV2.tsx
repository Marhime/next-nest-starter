/**
 * PhotoUploadZone Component
 * Modern drag-and-drop upload zone with progress tracking,
 * instant previews, and file validation
 */

'use client';

import { useCallback, useState, useMemo } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PhotoFile, PhotoUploadProgress } from '@/types/photo';

interface PhotoUploadZoneProps {
  uploadQueue: PhotoUploadProgress[];
  onFilesSelected: (files: PhotoFile[]) => void;
  onCancelUpload?: (fileId: string) => void;
  onRetryUpload?: (fileId: string, file: PhotoFile) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  disabled?: boolean;
  currentPhotoCount?: number;
}

export function PhotoUploadZone({
  uploadQueue,
  onFilesSelected,
  onCancelUpload,
  onRetryUpload,
  maxFiles = 20,
  maxSizeInMB = 10,
  disabled = false,
  currentPhotoCount = 0,
}: PhotoUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<PhotoFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = maxFiles - currentPhotoCount;
  const canUploadMore = remainingSlots > 0 && !disabled;

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0]?.errors?.[0];
        if (firstError?.code === 'file-too-large') {
          setError(
            `Some files are too large. Maximum size is ${maxSizeInMB}MB per file.`,
          );
        } else if (firstError?.code === 'file-invalid-type') {
          setError('Only JPEG, PNG, and WebP images are allowed.');
        } else if (firstError?.code === 'too-many-files') {
          setError(`You can only upload ${remainingSlots} more photo(s).`);
        } else {
          setError(firstError?.message || 'Some files were rejected.');
        }
        return;
      }

      // Check if adding would exceed limit
      if (acceptedFiles.length > remainingSlots) {
        setError(
          `You can only upload ${remainingSlots} more photo(s). Total limit is ${maxFiles}.`,
        );
        return;
      }

      // Create PhotoFile objects with preview and unique ID
      const filesWithPreview: PhotoFile[] = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: `${file.name}-${Date.now()}-${Math.random()}`,
        }),
      );

      setSelectedFiles(filesWithPreview);
      onFilesSelected(filesWithPreview);
    },
    [maxFiles, maxSizeInMB, remainingSlots, onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
      },
      maxSize: maxSizeInMB * 1024 * 1024,
      maxFiles: remainingSlots,
      disabled: !canUploadMore,
      multiple: true,
    });

  const removeSelectedFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
    setError(null);
  };

  // Group upload queue by status
  const { uploading, success, pending } = useMemo(() => {
    const groups = {
      uploading: uploadQueue.filter((q) => q.status === 'uploading'),
      success: uploadQueue.filter((q) => q.status === 'success'),
      pending: uploadQueue.filter((q) => q.status === 'pending'),
    };
    return groups;
  }, [uploadQueue]);

  const hasActiveUploads =
    uploading.length > 0 || pending.length > 0 || selectedFiles.length > 0;

  return (
    <div className="space-y-6">
      {/* Main Dropzone */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed p-12 text-center cursor-pointer',
          'transition-all duration-200',
          isDragActive &&
            !isDragReject &&
            'border-primary bg-primary/5 scale-[1.02]',
          isDragReject && 'border-destructive bg-destructive/5',
          !canUploadMore && 'opacity-50 cursor-not-allowed',
          canUploadMore &&
            !isDragActive &&
            'hover:border-primary/50 hover:bg-accent/5',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'rounded-full p-4 transition-colors',
              isDragActive && !isDragReject && 'bg-primary/10',
              isDragReject && 'bg-destructive/10',
              !isDragActive && 'bg-muted',
            )}
          >
            <Upload
              className={cn(
                'h-10 w-10 transition-colors',
                isDragActive && !isDragReject && 'text-primary',
                isDragReject && 'text-destructive',
                !isDragActive && 'text-muted-foreground',
              )}
            />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold">
              {isDragActive
                ? isDragReject
                  ? 'Some files are not supported'
                  : 'Drop your photos here'
                : canUploadMore
                  ? 'Drag & drop photos here'
                  : 'Upload limit reached'}
            </p>
            {canUploadMore && (
              <p className="text-sm text-muted-foreground">
                or click to browse • JPEG, PNG, WebP • Max {maxSizeInMB}MB
              </p>
            )}
            <p className="text-xs text-muted-foreground font-medium">
              {currentPhotoCount} / {maxFiles} photos •{' '}
              {remainingSlots > 0
                ? `${remainingSlots} slot${remainingSlots !== 1 ? 's' : ''} remaining`
                : 'No slots remaining'}
            </p>
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Queue Progress */}
      {hasActiveUploads && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Upload Progress ({uploading.length + success.length} /{' '}
              {uploadQueue.length})
            </h3>
            {success.length === uploadQueue.length &&
              uploadQueue.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  All uploaded
                </div>
              )}
          </div>

          <div className="space-y-2">
            {uploadQueue.map((item) => (
              <div
                key={item.fileId}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                {/* Status Icon */}
                <div>
                  {item.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {item.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {item.status === 'pending' && (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.fileName}
                  </p>
                  {item.status === 'error' && item.error && (
                    <p className="text-xs text-destructive mt-1">
                      {item.error}
                    </p>
                  )}
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  {item.status === 'error' && onRetryUpload && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const file = selectedFiles.find(
                          (f) => f.id === item.fileId,
                        );
                        if (file) {
                          onRetryUpload(item.fileId, file);
                        }
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  {(item.status === 'pending' || item.status === 'uploading') &&
                    onCancelUpload && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancelUpload(item.fileId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files Preview (before upload) */}
      {selectedFiles.length > 0 && uploadQueue.length === 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''}{' '}
              ready to upload
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {selectedFiles.map((file) => (
              <div key={file.id} className="relative group aspect-square">
                <div className="rounded-lg overflow-hidden bg-muted h-full">
                  <Image
                    src={file.preview}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeSelectedFile(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
