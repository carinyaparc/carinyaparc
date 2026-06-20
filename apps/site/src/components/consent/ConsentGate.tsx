'use client';

import { useEffect, useState } from 'react';

import { GoogleTagManager } from '@next/third-parties/google';

import { ConsentBanner } from '@/components/ui/Policy';
import { setConsent, type ConsentChoice } from '@/lib/consent/actions';
import type { ConsentStatusResponse } from '@/lib/consent/types';

type ConsentState = ConsentStatusResponse['choice'] | 'loading';

export function ConsentGate() {
  const [choice, setChoice] = useState<ConsentState>('loading');

  useEffect(() => {
    let cancelled = false;

    async function loadConsent() {
      try {
        const response = await fetch('/api/consent');

        if (!response.ok) {
          if (!cancelled) {
            setChoice(null);
          }
          return;
        }

        const data = (await response.json()) as ConsentStatusResponse;

        if (!cancelled) {
          setChoice(data.choice);
        }
      } catch {
        if (!cancelled) {
          setChoice(null);
        }
      }
    }

    void loadConsent();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleConsent = async (consent: ConsentChoice) => {
    try {
      const result = await setConsent(consent);

      if (result.success) {
        setChoice(consent);
      }
    } catch (error) {
      console.error('Failed to set cookie consent:', error);
    }
  };

  const showBanner = choice === null;
  const hasAcceptedAnalytics = choice === 'accepted';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <>
      {hasAcceptedAnalytics && gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {showBanner ? (
        <ConsentBanner
          onAccept={() => void handleConsent('accepted')}
          onReject={() => void handleConsent('rejected')}
        />
      ) : null}
    </>
  );
}
