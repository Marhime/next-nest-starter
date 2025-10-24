'use client';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../store';

const LocationPage = () => {
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep?.(2);
  }, [setCurrentStep]);
  return <div>Location page</div>;
};

export default LocationPage;
