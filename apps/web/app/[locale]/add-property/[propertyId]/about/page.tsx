'use client';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../../store';

const AboutPage = ({}) => {
  const { propertyId } = useParams();
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);

  useEffect(() => {
    setCurrentStep?.(4);
  }, [setCurrentStep]);

  return <div>About page for property {propertyId}</div>;
};

export default AboutPage;
