'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotoUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  disabled?: boolean;
}

export function PhotoUploadZone({
  onUpload,
  maxFiles = 10,
  disabled = false,
}: PhotoUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<
    Array<File & { preview: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      // Check for rejected files
      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0]?.errors?.[0];
        if (firstError?.code === 'file-too-large') {
          setError('Some files are too large. Maximum size is 10MB per file.');
        } else if (firstError?.code === 'file-invalid-type') {
          setError('Only JPEG, PNG, and WebP images are allowed.');
        } else if (firstError) {
          setError(firstError.message);
        }
        return;
      }

      // Check total file count
      if (selectedFiles.length + acceptedFiles.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} photos.`);
        return;
      }

      // Create previews
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

      setSelectedFiles((prev) => [...prev, ...filesWithPreview]);
    },
    [selectedFiles, maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || uploading,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={`
          border-2 border-dashed p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop the photos here...'
                : 'Drag & drop photos here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, or WebP • Max 10MB per file • Up to {maxFiles} photos
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

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''}{' '}
              selected
            </p>
            <Button onClick={handleUpload} disabled={uploading} size="sm">
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={file.preview}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="
                    absolute top-1 right-1 p-1 rounded-full
                    bg-destructive text-destructive-foreground
                    opacity-0 group-hover:opacity-100 transition-opacity
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
