'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Star, Trash2, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface Photo {
  id: number;
  url: string;
  thumbnailUrl?: string;
  order: number;
  isPrimary: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onReorder: (photos: { photoId: number; order: number }[]) => Promise<void>;
  onDelete: (photoId: number) => Promise<void>;
  onSetPrimary: (photoId: number) => Promise<void>;
}

export function PhotoGallery({
  photos,
  onReorder,
  onDelete,
  onSetPrimary,
}: PhotoGalleryProps) {
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos);
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localPhotos);
    const [reorderedItem] = items.splice(result.source.index, 1);

    if (!reorderedItem) return;

    items.splice(result.destination.index, 0, reorderedItem);

    // Update local order
    const reorderedPhotos = items.map((photo, index) => ({
      ...photo,
      order: index,
    }));

    setLocalPhotos(reorderedPhotos);

    // Send update to backend
    try {
      await onReorder(
        reorderedPhotos.map((photo) => ({
          photoId: photo.id,
          order: photo.order,
        })),
      );
    } catch {
      // Revert on error
      setLocalPhotos(photos);
    }
  };

  const handleDelete = async () => {
    if (!deletePhotoId) return;

    setLoading(true);
    try {
      await onDelete(deletePhotoId);
      setLocalPhotos((prev) => prev.filter((p) => p.id !== deletePhotoId));
    } catch (error) {
      console.error('Failed to delete photo:', error);
    } finally {
      setLoading(false);
      setDeletePhotoId(null);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    setLoading(true);
    try {
      await onSetPrimary(photoId);
      setLocalPhotos((prev) =>
        prev.map((p) => ({
          ...p,
          isPrimary: p.id === photoId,
        })),
      );
    } catch (error) {
      console.error('Failed to set primary photo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (localPhotos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No photos uploaded yet. Add some photos above to get started.
        </p>
      </Card>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="photos" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {localPhotos.map((photo, index) => (
                <Draggable
                  key={photo.id}
                  draggableId={photo.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        relative overflow-hidden
                        ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}
                        ${photo.isPrimary ? 'ring-2 ring-yellow-500' : ''}
                      `}
                    >
                      {/* Drag Handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="absolute top-2 left-2 z-10 p-1 rounded bg-background/80 backdrop-blur cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {/* Primary Badge */}
                      {photo.isPrimary && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded bg-yellow-500 text-yellow-950 text-xs font-medium">
                          <Star className="h-3 w-3 fill-current" />
                          Cover
                        </div>
                      )}

                      {/* Photo */}
                      <div className="aspect-square relative">
                        <Image
                          src={
                            photo.thumbnailUrl?.startsWith('http')
                              ? photo.thumbnailUrl
                              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${photo.thumbnailUrl || photo.url || ''}`
                          }
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Actions */}
                      <div className="p-2 flex gap-1">
                        {!photo.isPrimary && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetPrimary(photo.id)}
                            disabled={loading}
                            className="flex-1"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Set Cover
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletePhotoId(photo.id)}
                          disabled={loading}
                          className={photo.isPrimary ? 'flex-1' : ''}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Order Number */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-background/80 backdrop-blur text-xs font-medium">
                        #{index + 1}
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletePhotoId !== null}
        onOpenChange={() => setDeletePhotoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
