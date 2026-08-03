
'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * Ensures Firebase is initialized only once on the client side.
 * Standardizes service instances across the entire application.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      app={services.app} 
      firestore={services.firestore} 
      auth={services.auth} 
      storage={services.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
