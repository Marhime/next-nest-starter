import { redirect } from 'next/navigation';

const page = async ({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) => {
  const { propertyId } = await params;

  // redirect conditionally if propertyId is invalid
  if (!propertyId) {
    return redirect(`/hosting`);
  }

  return redirect(`/hosting/${propertyId}/overview`);
};

export default page;
