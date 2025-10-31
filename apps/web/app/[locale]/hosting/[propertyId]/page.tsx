import { redirect } from 'next/navigation';
import React from 'react';

const page = ({ params }: { params: { propertyId: string } }) => {
  const { propertyId } = params;
  return redirect(`/hosting/${propertyId}/overview`);
};

export default page;
