import { useEffect, useState } from 'react';

/**
 * Hook that returns the current timestamp (in ms) only after the component has mounted.
 * This avoids serverclient hydration mismatches caused by Date.now() being evaluated
 * during serverside rendering.
 */
export default function useClientNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);
  return now;
}
