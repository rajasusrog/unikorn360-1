import { useEffect, useState } from 'react';
import { servicesDb } from '../lib/supabase';
import { ServiceCatalogItem, ServiceDivision } from '../types/database';

export type CatalogLoadStatus = 'loading' | 'error' | 'empty' | 'ready';

export interface PublishedCatalogState {
  status: CatalogLoadStatus;
  divisions: ServiceDivision[];
  services: ServiceCatalogItem[];
  totalPublishedServices: number;
  error: string | null;
}

const initialState: PublishedCatalogState = {
  status: 'loading',
  divisions: [],
  services: [],
  totalPublishedServices: 0,
  error: null
};

let currentState: PublishedCatalogState = initialState;
let activePromise: Promise<void> | null = null;
const listeners = new Set<(state: PublishedCatalogState) => void>();

function emit(next: PublishedCatalogState) {
  currentState = next;
  listeners.forEach((listener) => listener(currentState));
}

export function refreshPublishedCatalog(force = false): Promise<void> {
  if (activePromise && !force) {
    return activePromise;
  }

  emit({
    ...currentState,
    status: 'loading',
    error: null
  });

  const promise = (async () => {
    try {
      const snapshot = await servicesDb.getPublishedCatalog();
      const total = snapshot.services.length;
      emit({
        status: total === 0 ? 'empty' : 'ready',
        divisions: snapshot.divisions,
        services: snapshot.services,
        totalPublishedServices: total,
        error: null
      });
    } catch (err: any) {
      emit({
        status: 'error',
        divisions: [],
        services: [],
        totalPublishedServices: 0,
        error: err?.message || 'Unable to load the published service catalogue.'
      });
    } finally {
      if (activePromise === promise) {
        activePromise = null;
      }
    }
  })();

  activePromise = promise;
  return promise;
}

export function usePublishedCatalog(): PublishedCatalogState & { retry: () => void } {
  const [state, setState] = useState<PublishedCatalogState>(() => currentState);

  useEffect(() => {
    listeners.add(setState);
    setState(currentState);

    if (
      currentState.status === 'loading' &&
      !activePromise &&
      currentState.divisions.length === 0 &&
      currentState.services.length === 0
    ) {
      void refreshPublishedCatalog(false);
    }

    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    retry: () => {
      void refreshPublishedCatalog(true);
    }
  };
}
