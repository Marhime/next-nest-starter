import { redirect } from 'next/navigation';

const page = ({ params }: { params: { propertyId: string } }) => {
  const { propertyId } = params;

  // redirect conditionally if propertyId is invalid
  if (!propertyId) {
    return redirect(`/hosting`);
  }

  return redirect(`/hosting/${propertyId}/overview`);
};

export default page;
