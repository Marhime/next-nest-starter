'use client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useAddPropertyStore } from './store';
import { ReactNode } from 'react';
import { useGlobalStore } from '../store';

export default function AddPropertyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const setIsOpen = useGlobalStore((state) => state.setIsOpen);
  const currentStep = useAddPropertyStore((state) => state.currentStep);

  const steps = ['overview', 'type', 'location', 'space-type', 'photos'];
  const maxSteps = steps.length - 1;

  return (
    <>
      <section className="h-screen flex flex-col relative">
        <div className="flex w-full justify-between p-4 xl:py-10 xl:px-12">
          <Link href="/">Logo</Link>
          <div className="flex gap-4 xl:gap-6 items-center">
            <Button onClick={() => setIsOpen?.(true)}>Questions ?</Button>
            <Button asChild variant="outline">
              <Link href="/">Save and quit</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1">{children}</div>
        <div className="relative p-4 xl:py-6 xl:px-12">
          <div className="flex justify-between items-center">
            <Button variant="link" className="underline text-md">
              <Link
                href={
                  currentStep !== undefined && steps[currentStep - 1]
                    ? `/add-property/${steps[currentStep - 1]}`
                    : '#'
                }
              >
                Back
              </Link>
            </Button>
            <>
              <Button asChild className="rounded-full px-10 py-6 text-md">
                <Link
                  href={
                    currentStep !== undefined && steps[currentStep + 1]
                      ? `/add-property/${steps[currentStep + 1]}`
                      : '#'
                  }
                >
                  Next
                </Link>
              </Button>
              <div className="absolute top-0 left-0 w-full">
                <Progress
                  className="rounded-none"
                  value={currentStep ? (currentStep / maxSteps) * 100 : 0}
                />
              </div>
            </>
          </div>
        </div>
      </section>
    </>
  );
}
