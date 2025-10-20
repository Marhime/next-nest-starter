'use client';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../store';
import { AddPropertySchema } from '@/features/add-property/schema';

const PhotosPage = () => {
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep?.(4);
  }, [setCurrentStep]);

  const setData = useAddPropertyStore((state) => state.setData);

  const onSubmit = (data: AddPropertySchema) => {
    setData(data);
  };

  return <div>Photos page</div>;
};

export default PhotosPage;
