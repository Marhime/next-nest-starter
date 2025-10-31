'use client';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../../store';
import { useParams } from 'next/navigation';

const LocationPage = () => {
  const { propertyId } = useParams();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep?.(2);
  }, [setCurrentStep]);

  return <div>Location page for property {propertyId}</div>;
};

export default LocationPage;
