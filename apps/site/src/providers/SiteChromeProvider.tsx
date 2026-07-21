'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type SiteChromeContextValue = {
  minimal: boolean;
  setMinimal: (minimal: boolean) => void;
};

const SiteChromeContext = createContext<SiteChromeContextValue | null>(null);

export function SiteChromeProvider({ children }: { children: ReactNode }) {
  const [minimal, setMinimal] = useState(false);
  const value = useMemo(() => ({ minimal, setMinimal }), [minimal]);

  return <SiteChromeContext.Provider value={value}>{children}</SiteChromeContext.Provider>;
}

function useSiteChrome() {
  const context = useContext(SiteChromeContext);
  if (!context) {
    throw new Error('useSiteChrome must be used within SiteChromeProvider');
  }
  return context;
}

export function SetMinimalChrome() {
  const { setMinimal } = useSiteChrome();

  useEffect(() => {
    setMinimal(true);
    return () => setMinimal(false);
  }, [setMinimal]);

  return null;
}

export function useSiteChromeState() {
  return useSiteChrome();
}
