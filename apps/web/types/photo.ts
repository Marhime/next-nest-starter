/**
 * Photo Types
 * Type definitions for photo upload and management system
 */

export interface Photo {
  id: number;
  url: string;
  thumbnailUrl?: string;
  order: number;
  isPrimary: boolean;
  propertyId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PhotoUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  photo?: Photo;
}

export interface PhotoFile extends File {
  preview: string;
  id: string;
}

export interface PhotoUploadOptions {
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  compressImages?: boolean;
  quality?: number;
}

export interface PhotoReorderItem {
  photoId: number;
  order: number;
}

export interface PhotoUploadResponse {
  photo: Photo;
  message?: string;
}

export interface PhotoError {
  code: string;
  message: string;
  field?: string;
}
