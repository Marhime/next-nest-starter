'use client';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../store';
import { AddPropertySchema } from '@/features/add-property/schema';

const TypePage = () => {
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep?.(1);
  }, [setCurrentStep]);

  const setData = useAddPropertyStore((state) => state.setData);

  return <div>Type page</div>;
};

export default TypePage;
