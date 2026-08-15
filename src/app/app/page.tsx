'use client';

import { StoreProvider } from '@/state/store';
import { App } from '@/components/app/App';

/** App del emprendedor (README § 1). */
export default function AppPage() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}
