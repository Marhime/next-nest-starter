/**
 * usePhotoUpload Hook
 * Manages photo uploads with progress tracking, parallel uploads,
 * retry logic, and optimistic updates
 */

import { useState, useCallback, useRef } from 'react';
import type {
  Photo,
  PhotoFile,
  PhotoUploadProgress,
  PhotoUploadOptions,
} from '@/types/photo';

const DEFAULT_OPTIONS: Required<PhotoUploadOptions> = {
  maxFiles: 20,
  maxSizeInMB: 10,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  compressImages: true,
  quality: 0.8,
};

interface UsePhotoUploadProps {
  propertyId: number;
  onSuccess?: (photos: Photo[]) => void;
  onError?: (error: Error) => void;
  options?: Partial<PhotoUploadOptions>;
}

export function usePhotoUpload({
  propertyId,
  onSuccess,
  onError,
  options = {},
}: UsePhotoUploadProps) {
  const [uploadQueue, setUploadQueue] = useState<PhotoUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const config = { ...DEFAULT_OPTIONS, ...options };

  /**
   * Compress image before upload
   */
  const compressImage = useCallback(
    async (file: File): Promise<Blob> => {
      if (!config.compressImages) return file;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            // Calculate new dimensions (max 2000px on longest side)
            const maxDim = 2000;
            let { width, height } = img;
            if (width > height && width > maxDim) {
              height = (height * maxDim) / width;
              width = maxDim;
            } else if (height > maxDim) {
              width = (width * maxDim) / height;
              height = maxDim;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to compress image'));
                }
              },
              file.type,
              config.quality,
            );
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    },
    [config.compressImages, config.quality],
  );

  /**
   * Upload single photo with progress tracking
   */
  const uploadSinglePhoto = useCallback(
    async (file: PhotoFile, fileId: string): Promise<Photo> => {
      const abortController = new AbortController();
      abortControllersRef.current.set(fileId, abortController);

      try {
        // Compress image
        const compressedBlob = await compressImage(file);

        // Create FormData
        const formData = new FormData();
        formData.append('file', compressedBlob, file.name);

        // Upload with progress
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/photos/property/${propertyId}`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
            signal: abortController.signal,
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const photo = await response.json();
        return photo;
      } finally {
        abortControllersRef.current.delete(fileId);
      }
    },
    [propertyId, compressImage],
  );

  /**
   * Upload multiple photos in parallel with queue management
   */
  const uploadPhotos = useCallback(
    async (files: PhotoFile[]) => {
      if (files.length === 0) return;

      setIsUploading(true);

      // Initialize upload queue
      const initialQueue: PhotoUploadProgress[] = files.map((file) => ({
        fileId: file.id,
        fileName: file.name,
        progress: 0,
        status: 'pending',
      }));
      setUploadQueue(initialQueue);

      const uploadedPhotos: Photo[] = [];
      const errors: Error[] = [];

      try {
        // Upload in batches of 3 for better UX
        const batchSize = 3;
        for (let i = 0; i < files.length; i += batchSize) {
          const batch = files.slice(i, i + batchSize);

          const promises = batch.map(async (file) => {
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.fileId === file.id
                  ? { ...item, status: 'uploading', progress: 0 }
                  : item,
              ),
            );

            try {
              const photo = await uploadSinglePhoto(file, file.id);

              setUploadQueue((prev) =>
                prev.map((item) =>
                  item.fileId === file.id
                    ? { ...item, status: 'success', progress: 100, photo }
                    : item,
                ),
              );

              uploadedPhotos.push(photo);
              return photo;
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Upload failed';

              setUploadQueue((prev) =>
                prev.map((item) =>
                  item.fileId === file.id
                    ? { ...item, status: 'error', error: errorMessage }
                    : item,
                ),
              );

              errors.push(
                new Error(`Failed to upload ${file.name}: ${errorMessage}`),
              );
              return null;
            }
          });

          await Promise.allSettled(promises);
        }

        // Callback with successful uploads
        if (uploadedPhotos.length > 0 && onSuccess) {
          onSuccess(uploadedPhotos);
        }

        // Handle errors
        if (errors.length > 0 && onError) {
          onError(
            new Error(
              `${errors.length} photo(s) failed to upload. ${errors[0]?.message}`,
            ),
          );
        }
      } finally {
        setIsUploading(false);
        // Clear queue after 3 seconds
        setTimeout(() => setUploadQueue([]), 3000);
      }
    },
    [uploadSinglePhoto, onSuccess, onError],
  );

  /**
   * Cancel specific upload
   */
  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllersRef.current.get(fileId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(fileId);
    }

    setUploadQueue((prev) =>
      prev.map((item) =>
        item.fileId === fileId
          ? { ...item, status: 'error', error: 'Cancelled by user' }
          : item,
      ),
    );
  }, []);

  /**
   * Cancel all uploads
   */
  const cancelAllUploads = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();
    setUploadQueue([]);
    setIsUploading(false);
  }, []);

  /**
   * Retry failed upload
   */
  const retryUpload = useCallback(
    async (fileId: string, file: PhotoFile) => {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.fileId === fileId
            ? { ...item, status: 'uploading', progress: 0, error: undefined }
            : item,
        ),
      );

      try {
        const photo = await uploadSinglePhoto(file, fileId);

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.fileId === fileId
              ? { ...item, status: 'success', progress: 100, photo }
              : item,
          ),
        );

        if (onSuccess) {
          onSuccess([photo]);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.fileId === fileId
              ? { ...item, status: 'error', error: errorMessage }
              : item,
          ),
        );

        if (onError) {
          onError(error as Error);
        }
      }
    },
    [uploadSinglePhoto, onSuccess, onError],
  );

  return {
    uploadPhotos,
    uploadQueue,
    isUploading,
    cancelUpload,
    cancelAllUploads,
    retryUpload,
  };
}
