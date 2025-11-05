'use client';
import React, { useEffect } from 'react';
import { useAddPropertyStore } from '../../store';
import Image from 'next/image';

const OverviewPage = () => {
  const setIsOpen = useAddPropertyStore((state) => state.setIsOpen);
  const setCurrentStep = useAddPropertyStore((state) => state.setCurrentStep);
  const setCanProceed = useAddPropertyStore((state) => state.setCanProceed);
  const setHasShownHelpDrawer = useAddPropertyStore(
    (state) => state.setHasShownHelpDrawer,
  );
  const hasShownHelpDrawer = useAddPropertyStore(
    (state) => state.hasShownHelpDrawer,
  );

  useEffect(() => {
    // wait it is hydrated
    setCurrentStep?.(0);
    setIsOpen?.(true);
    setHasShownHelpDrawer?.(true);
    // Overview page always allows proceeding
    setCanProceed?.(true);
  }, [
    setCurrentStep,
    setIsOpen,
    setHasShownHelpDrawer,
    hasShownHelpDrawer,
    setCanProceed,
  ]);

  return (
    <>
      <div className="flex w-full h-full justify-center items-center">
        <div className="flex gap-5 max-w-7xl px-4 md:px-0">
          <div className="flex-1 space-y-2 xl:space-y-4">
            <p className="text-lg">Step 1</p>
            <h1 className="text-5xl font-extrabold tracking-tight text-balance leading-snug">
              Overview page content goes here.
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus
              ab hic qui voluptas, deserunt commodi minus autem maiores officia
              nihil, distinctio nostrum perspiciatis ut aspernatur. Sequi ex
              suscipit rem veritatis.
            </p>
          </div>
          <div className="flex-1 flex justify-center items-center space-y-2 xl:space-y-4 text-red-600">
            <Image
              aria-hidden
              src="/add-property-step-1.svg"
              alt="Globe icon"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewPage;
