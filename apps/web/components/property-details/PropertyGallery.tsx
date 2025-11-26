/**
 * Property Gallery Component
 * Carousel mobile + Grid desktop with lightbox
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn, getPhotoUrl } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Photo {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface PropertyGalleryProps {
  photos: Photo[];
  propertyTitle: string;
}

export function PropertyGallery({
  photos,
  propertyTitle,
}: PropertyGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground">Aucune photo disponible</p>
      </div>
    );
  }

  const primaryPhoto = photos.find((p) => p.isPrimary) || photos[0];
  const secondaryPhotos = primaryPhoto
    ? photos.filter((p) => p.id !== primaryPhoto.id)
    : photos.slice(1);

  return (
    <>
      {/* Mobile: Carousel */}
      <div className="md:hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem key={photo.id}>
                <div
                  className="relative aspect-[4/3] cursor-pointer"
                  onClick={() => {
                    setCurrentPhotoIndex(index);
                    setIsLightboxOpen(true);
                  }}
                >
                  <Image
                    src={getPhotoUrl(photo.url)}
                    alt={`${propertyTitle} - ${index + 1}`}
                    fill
                    className="object-cover rounded-2xl"
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>

        {/* Photo counter */}
        <div className="flex justify-center mt-2">
          <span className="text-sm text-muted-foreground">
            {photos.length} photo{photos.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[500px]">
          {/* Main Photo - Large */}
          {primaryPhoto && (
            <div
              className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden"
              onClick={() => {
                setCurrentPhotoIndex(0);
                setIsLightboxOpen(true);
              }}
            >
              <Image
                src={getPhotoUrl(primaryPhoto.url)}
                alt={propertyTitle}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                priority
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          )}

          {/* Secondary Photos - Grid */}
          {secondaryPhotos.slice(0, 4).map((photo, index) => (
            <div
              key={photo.id}
              className="relative cursor-pointer group overflow-hidden"
              onClick={() => {
                setCurrentPhotoIndex(index + 1);
                setIsLightboxOpen(true);
              }}
            >
              <Image
                src={getPhotoUrl(photo.url)}
                alt={`${propertyTitle} - ${index + 2}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

              {/* "Voir toutes les photos" overlay on last photo */}
              {index === 3 && photos.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    +{photos.length - 5} photos
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* "Show all photos" button */}
        {photos.length > 1 && (
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentPhotoIndex(0);
                setIsLightboxOpen(true);
              }}
            >
              Voir toutes les photos ({photos.length})
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full flex flex-col">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLightboxOpen(false)}
                className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Photo Counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {currentPhotoIndex + 1} / {photos.length}
            </div>

            {/* Main Photo */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              {photos[currentPhotoIndex] && (
                <div className="relative w-full h-full">
                  <Image
                    src={getPhotoUrl(photos[currentPhotoIndex].url)}
                    alt={`${propertyTitle} - ${currentPhotoIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="100vw"
                  />
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {currentPhotoIndex > 0 && (
              <div className="absolute inset-y-0 left-4 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPhotoIndex((prev) => Math.max(0, prev - 1))
                  }
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm h-12 w-12"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
            )}
            {currentPhotoIndex < photos.length - 1 && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPhotoIndex((prev) =>
                      Math.min(photos.length - 1, prev + 1),
                    )
                  }
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm h-12 w-12"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}

            {/* Thumbnails Strip */}
            <div className="bg-black/50 backdrop-blur-sm p-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={cn(
                      'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                      currentPhotoIndex === index
                        ? 'border-white scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105',
                    )}
                  >
                    <Image
                      src={getPhotoUrl(photo.url)}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
