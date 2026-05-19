import { useEffect, useRef } from "react";

export default function useOnceEffect(callback: () => void) {
    const hasRun = useRef(false);
  
    useEffect(() => {
      if (!hasRun.current) {
        callback();
        hasRun.current = true;
      }
    }, []);
  }
  