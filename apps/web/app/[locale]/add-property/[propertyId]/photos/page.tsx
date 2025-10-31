'use client';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../../store';
import { AddPropertySchema } from '@/features/add-property/schema';
import { useParams } from 'next/navigation';

const PhotosPage = () => {
  const { propertyId } = useParams();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep?.(3);
  }, [setCurrentStep]);

  const setData = useAddPropertyStore((state) => state.setData);

  const onSubmit = (data: AddPropertySchema) => {
    setData(data);
  };

  return <div>Photos page for property {propertyId}</div>;
};

export default PhotosPage;
