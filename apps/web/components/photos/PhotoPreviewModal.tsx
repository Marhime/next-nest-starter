/**
 * PhotoPreviewModal Component
 * Fullscreen photo preview with navigation, zoom, and metadata editing
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Trash2,
  ZoomIn,
  ZoomOut,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Photo } from '@/types/photo';

interface PhotoPreviewModalProps {
  photos: Photo[];
  initialPhotoId: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (photoId: number) => Promise<void>;
  onSetPrimary?: (photoId: number) => Promise<void>;
  readOnly?: boolean;
}

export function PhotoPreviewModal({
  photos,
  initialPhotoId,
  isOpen,
  onClose,
  onDelete,
  onSetPrimary,
  readOnly = false,
}: PhotoPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  // Find initial photo index
  useEffect(() => {
    const index = photos.findIndex((p) => p.id === initialPhotoId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [initialPhotoId, photos]);

  const currentPhoto = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex((prev) => prev - 1);
      setZoom(1);
    }
  }, [hasPrev]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
      setZoom(1);
    }
  }, [hasNext]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  }, []);

  const handleDelete = useCallback(async () => {
    if (!currentPhoto || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(currentPhoto.id);

      // Move to next photo or close if last one
      if (photos.length <= 1) {
        onClose();
      } else if (hasNext) {
        handleNext();
      } else if (hasPrev) {
        handlePrev();
      }
    } finally {
      setIsDeleting(false);
    }
  }, [
    currentPhoto,
    onDelete,
    photos.length,
    hasNext,
    hasPrev,
    handleNext,
    handlePrev,
    onClose,
  ]);

  const handleSetPrimary = useCallback(async () => {
    if (!currentPhoto || !onSetPrimary || currentPhoto.isPrimary) return;

    setIsSettingPrimary(true);
    try {
      await onSetPrimary(currentPhoto.id);
    } finally {
      setIsSettingPrimary(false);
    }
  }, [currentPhoto, onSetPrimary]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, handleZoomIn, handleZoomOut, onClose]);

  if (!currentPhoto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-2xl w-full h-[90vh] p-0 gap-0 bg-black/95">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            {currentPhoto.isPrimary && (
              <Badge className="bg-primary text-primary-foreground">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Cover Photo
              </Badge>
            )}
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Image */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div
            className="relative transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`,
              width: '100%',
              height: '100%',
            }}
          >
            <Image
              src={currentPhoto.url}
              alt={`Photo ${currentPhoto.order}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>

        {/* Navigation Arrows */}
        {hasPrev && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12 rounded-full"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12 rounded-full"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white text-sm min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <>
              {!currentPhoto.isPrimary && onSetPrimary && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSetPrimary}
                  disabled={isSettingPrimary || isDeleting}
                  className="gap-2"
                >
                  {isSettingPrimary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                  Set as Cover
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || isSettingPrimary}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              )}
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-20 left-0 right-0 z-40 flex items-center justify-center">
          <div className="flex gap-2 p-2 bg-black/60 rounded-lg backdrop-blur-sm max-w-full overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                className={cn(
                  'relative w-16 h-16 rounded overflow-hidden flex-shrink-0',
                  'border-2 transition-all',
                  index === currentIndex
                    ? 'border-primary scale-110'
                    : 'border-transparent opacity-60 hover:opacity-100',
                )}
              >
                <Image
                  src={photo.thumbnailUrl || photo.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
