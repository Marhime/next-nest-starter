'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
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
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      if (acceptedFiles.length > maxFiles) {
        setError(
          `Vous ne pouvez télécharger que ${maxFiles} photos à la fois.`,
        );
        return;
      }

      setUploading(true);
      try {
        await toast.promise(onUpload(acceptedFiles), {
          loading: `Upload de ${acceptedFiles.length} photo${acceptedFiles.length > 1 ? 's' : ''}...`,
          success: `${acceptedFiles.length} photo${acceptedFiles.length > 1 ? 's' : ''} ajoutée${acceptedFiles.length > 1 ? 's' : ''}`,
          error: "Erreur lors de l'upload",
        });
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setUploading(false);
      }
    },
    [maxFiles, onUpload],
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
                ? 'Upload en cours...'
                : isDragActive
                  ? 'Déposez vos photos ici...'
                  : 'Glissez-déposez des photos ou cliquez pour sélectionner'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG ou WebP • Max 10 Mo par fichier • Jusqu&apos;à{' '}
              {maxFiles} photos
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
