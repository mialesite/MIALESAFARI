
'use client';

import { useState, useEffect } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData, 
  FirestoreError 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        setData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T)));
        setLoading(false);
        setError(null);
      },
      async (serverError: FirestoreError) => {
        if (serverError.code === 'permission-denied') {
          // Robust path extraction for Firestore v9+ Queries
          let pathStr = 'collection-query';
          try {
            const q = query as any;
            
            // 1. Check for standard path segments
            if (q._query?.path?.segments) {
              pathStr = q._query.path.segments.join('/');
            } 
            // 2. Check for public path property
            else if (q.path) {
              pathStr = q.path;
            } 
            // 3. Check for specific collection ID
            else if (q.id) {
              pathStr = q.id;
            } 
            // 4. Heuristic: match from toString if internal properties are obscured
            else if (typeof q.toString === 'function') {
              const match = q.toString().match(/collections\/([^\/?]+)/);
              if (match) pathStr = match[1];
            }
          } catch (e) {
            // Silently fallback to default string
          }

          const permissionError = new FirestorePermissionError({
            path: pathStr,
            operation: 'list',
          } satisfies SecurityRuleContext);
          
          // Emit contextual error for developer overlay
          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(serverError);
        setLoading(false);
        setData(null);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
