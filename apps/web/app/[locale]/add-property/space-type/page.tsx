'use client';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../store';
import { AddPropertySchema } from '@/features/add-property/schema';

const SpaceTypePage = () => {
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep?.(3);
  }, [setCurrentStep]);

  const setData = useAddPropertyStore((state) => state.setData);

  return <div>SpaceTypePage</div>;
};

export default SpaceTypePage;
