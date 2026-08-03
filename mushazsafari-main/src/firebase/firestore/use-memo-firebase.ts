
'use client';

import { useMemo } from 'react';

/**
 * A simple wrapper around useMemo to stabilize Firebase queries and references.
 */
export function useMemoFirebase<T>(factory: () => T, dependencies: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, dependencies);
}
