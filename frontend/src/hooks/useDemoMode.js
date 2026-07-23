import { useState, useCallback } from 'react';
import { useProAccess } from './useProAccess';

const DEMO_KEY   = 'bj_demo_hands';
const DEMO_LIMIT = 10;

function getDemoCount() {
  try { return parseInt(localStorage.getItem(DEMO_KEY) || '0', 10); }
  catch { return 0; }
}

export function useDemoMode() {
  const isPro = useProAccess();
  const [demoHandsPlayed, setDemoHandsPlayed] = useState(getDemoCount);

  const incrementDemoHand = useCallback(() => {
    if (isPro) return;
    const next = getDemoCount() + 1;
    localStorage.setItem(DEMO_KEY, String(next));
    setDemoHandsPlayed(next);
  }, [isPro]);

  const isDemo      = !isPro;
  const demoExpired = isDemo && demoHandsPlayed >= DEMO_LIMIT;
  const demoLeft    = Math.max(0, DEMO_LIMIT - demoHandsPlayed);

  return { isDemo, isPro, demoHandsPlayed, demoLeft, demoExpired, incrementDemoHand, DEMO_LIMIT };
}
