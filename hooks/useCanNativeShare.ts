import { useEffect, useState } from "react";

/** Detect Web Share API after mount to avoid SSR/client hydration mismatch. */
export function useCanNativeShare(): boolean {
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  return canNativeShare;
}
