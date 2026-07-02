import { Slot } from 'expo-router';

import { BesteiraProvider } from '@/data/BesteiraProvider';

export default function BesteiraLayout() {
  return (
    <BesteiraProvider>
      <Slot />
    </BesteiraProvider>
  );
}
