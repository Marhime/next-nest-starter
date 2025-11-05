/**
 * PhotoGallery Component (V3)
 * Airbnb-style photo gallery with hero image and grid layout
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Star, GripVertical, ZoomIn, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Photo, PhotoReorderItem } from '@/types/photo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PhotoGalleryProps {
  photos: Photo[];
  onReorder?: (reorderedPhotos: PhotoReorderItem[]) => Promise<void>;
  onDelete?: (photoId: number) => Promise<void>;
  onSetPrimary?: (photoId: number) => Promise<void>;
  onPreview?: (photo: Photo) => void;
  readOnly?: boolean;
}

/**
 * Single sortable photo item
 */
function SortablePhoto({
  photo,
  onDelete,
  onSetPrimary,
  onPreview,
  isPrimary,
  isHero,
  readOnly,
}: {
  photo: Photo;
  onDelete: () => void;
  onSetPrimary: () => void;
  onPreview: () => void;
  isPrimary: boolean;
  isHero: boolean;
  readOnly: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSetPrimary = async () => {
    setIsSettingPrimary(true);
    try {
      await onSetPrimary();
    } finally {
      setIsSettingPrimary(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group relative rounded-lg overflow-hidden bg-muted',
          'border-2 transition-all duration-200',
          isHero ? 'md:row-span-2 md:col-span-2' : 'aspect-square',
          isDragging && 'opacity-50 scale-95 z-50',
          isPrimary
            ? 'border-primary ring-2 ring-primary ring-offset-2'
            : 'border-transparent hover:border-primary/50',
        )}
      >
        {/* Image */}
        <div
          className={cn(
            'relative w-full',
            isHero ? 'h-full min-h-[400px]' : 'aspect-square',
          )}
        >
          <Image
            src={photo.url}
            alt={`Photo ${photo.order}`}
            fill
            className={cn(
              'object-cover transition-transform duration-300',
              !readOnly && 'group-hover:scale-105',
            )}
            sizes={
              isHero
                ? '(max-width: 768px) 100vw, 50vw'
                : '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
            }
            priority={isHero}
          />
        </div>

        {/* Primary badge */}
        {isPrimary && (
          <Badge
            className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg"
            variant="default"
          >
            <Star className="h-3 w-3 mr-1 fill-current" />
            Cover Photo
          </Badge>
        )}

        {/* Overlay with actions */}
        {!readOnly && (
          <div
            className={cn(
              'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100',
              'transition-opacity duration-200 flex items-center justify-center gap-2',
            )}
          >
            {/* Drag handle */}
            <Button
              variant="secondary"
              size="icon"
              className="cursor-grab active:cursor-grabbing shadow-lg"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>

            {/* Preview */}
            <Button
              variant="secondary"
              size="icon"
              onClick={onPreview}
              disabled={isDeleting}
              className="shadow-lg"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Set as primary */}
            {!isPrimary && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleSetPrimary}
                disabled={isSettingPrimary || isDeleting}
                className="shadow-lg"
              >
                {isSettingPrimary ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Delete */}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="shadow-lg"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              photo from your property listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Main PhotoGallery component with Airbnb-style layout
 */
export function PhotoGallery({
  photos,
  onReorder,
  onDelete,
  onSetPrimary,
  onPreview,
  readOnly = false,
}: PhotoGalleryProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [localPhotos, setLocalPhotos] = useState(photos);
  const [isReordering, setIsReordering] = useState(false);

  // Update local photos when prop changes
  useMemo(() => {
    setLocalPhotos(photos);
  }, [photos]);

  // Sort photos: primary first, then by order
  const sortedPhotos = useMemo(() => {
    return [...localPhotos].sort((a, b) => {
      // Primary photo always first
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      // Otherwise sort by order
      return a.order - b.order;
    });
  }, [localPhotos]);

  const primaryPhoto = useMemo(
    () => sortedPhotos.find((p) => p.isPrimary) || sortedPhotos[0],
    [sortedPhotos],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = sortedPhotos.findIndex((p) => p.id === active.id);
      const newIndex = sortedPhotos.findIndex((p) => p.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Optimistic update
      const newOrder = arrayMove(sortedPhotos, oldIndex, newIndex).map(
        (photo, index) => ({
          ...photo,
          order: index,
        }),
      );

      setLocalPhotos(newOrder);

      // Send to server
      if (onReorder) {
        setIsReordering(true);
        try {
          await onReorder(
            newOrder.map((photo) => ({
              photoId: photo.id,
              order: photo.order,
            })),
          );
        } catch (error) {
          // Revert on error
          setLocalPhotos(photos);
          console.error('Failed to reorder photos:', error);
        } finally {
          setIsReordering(false);
        }
      }
    },
    [sortedPhotos, photos, onReorder],
  );

  const handleDelete = useCallback(
    (photoId: number) => async () => {
      if (onDelete) {
        await onDelete(photoId);
      }
    },
    [onDelete],
  );

  const handleSetPrimary = useCallback(
    (photoId: number) => async () => {
      if (onSetPrimary) {
        await onSetPrimary(photoId);
      }
    },
    [onSetPrimary],
  );

  const handlePreview = useCallback(
    (photo: Photo) => () => {
      if (onPreview) {
        onPreview(photo);
      }
    },
    [onPreview],
  );

  const activePhoto = useMemo(
    () => sortedPhotos.find((p) => p.id === activeId),
    [sortedPhotos, activeId],
  );

  if (sortedPhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No photos yet. Upload some to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isReordering && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving new order...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedPhotos.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
          {/* Airbnb-style Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-fr">
            {sortedPhotos.map((photo, index) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                onDelete={handleDelete(photo.id)}
                onSetPrimary={handleSetPrimary(photo.id)}
                onPreview={handlePreview(photo)}
                isPrimary={photo.id === primaryPhoto?.id}
                isHero={index === 0} // First photo (primary) is the hero
                readOnly={readOnly}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay */}
        <DragOverlay>
          {activePhoto && (
            <div className="aspect-square rounded-lg overflow-hidden shadow-2xl opacity-80 rotate-3">
              <Image
                src={activePhoto.url}
                alt="Dragging"
                width={200}
                height={200}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
