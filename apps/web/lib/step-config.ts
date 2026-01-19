/**
 * Configuration centralisée des steps du wizard
 * Une source unique de vérité pour l'ordre et les infos des steps
 */
export const PROPERTY_STEPS = [
  { index: 0, key: 'location', route: 'location' },
  { index: 1, key: 'photos', route: 'photos' },
  { index: 2, key: 'characteristics', route: 'characteristics' },
  { index: 3, key: 'description', route: 'description' },
  { index: 4, key: 'contact', route: 'contact' },
] as const;

export type StepKey = (typeof PROPERTY_STEPS)[number]['key'];

export function getStepByIndex(index: number) {
  return PROPERTY_STEPS.find((s) => s.index === index);
}

export function getStepByKey(key: StepKey) {
  return PROPERTY_STEPS.find((s) => s.key === key);
}

export function getNextStep(currentIndex: number) {
  const nextStep = PROPERTY_STEPS.find((s) => s.index === currentIndex + 1);
  return nextStep?.route;
}

export function getPrevStep(currentIndex: number) {
  const prevStep = PROPERTY_STEPS.find((s) => s.index === currentIndex - 1);
  return prevStep?.route;
}

export const TOTAL_STEPS = PROPERTY_STEPS.length;
export const MAX_STEP_INDEX = TOTAL_STEPS - 1;
