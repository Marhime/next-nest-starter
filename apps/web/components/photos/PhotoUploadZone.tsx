'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslations } from 'next-intl';
import { Upload, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

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
  const t = useTranslations('PhotoUpload');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      if (acceptedFiles.length > maxFiles) {
        setError(t('maxFilesError', { count: maxFiles }));
        return;
      }

      setUploading(true);
      try {
        const plural = acceptedFiles.length > 1 ? 's' : '';
        await toast.promise(onUpload(acceptedFiles), {
          loading: t('uploadingCount', { count: acceptedFiles.length, plural }),
          success: t('uploadedCount', { count: acceptedFiles.length, plural }),
          error: t('uploadError'),
        });
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setUploading(false);
      }
    },
    [maxFiles, onUpload, t],
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

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={`
          border-2 border-dashed p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/25'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <Upload
            className={`h-10 w-10 ${uploading ? 'animate-pulse text-primary' : 'text-muted-foreground'}`}
          />
          <div>
            <p className="text-sm font-medium">
              {uploading
                ? t('uploading')
                : isDragActive
                  ? t('dropHere')
                  : t('dropOrClick')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('fileInfo', { max: maxFiles })}
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
    </div>
  );
}
