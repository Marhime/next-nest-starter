'use client';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../../store';
import { AddPropertySchema } from '@/features/add-property/schema';
import { useParams } from 'next/navigation';

const SpaceTypePage = () => {
  const { propertyId } = useParams();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep?.(1);
  }, [setCurrentStep]);

  const setData = useAddPropertyStore((state) => state.setData);

  return <div>Space Type page for property {propertyId}</div>;
};

export default SpaceTypePage;
