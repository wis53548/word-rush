import { useEffect, useState } from 'react';

export type ResponsiveGameSize = {
  width: number;
  height: number;
  isNarrow: boolean;
  isTouch: boolean;
};

const readSize = (): ResponsiveGameSize => ({
  width: window.innerWidth,
  height: window.innerHeight,
  isNarrow: window.innerWidth < 720 && window.innerHeight > window.innerWidth,
  isTouch: matchMedia('(pointer: coarse)').matches,
});

export const useResponsiveGameSize = (): ResponsiveGameSize => {
  const [size, setSize] = useState<ResponsiveGameSize>(() =>
    typeof window === 'undefined'
      ? { width: 1280, height: 720, isNarrow: false, isTouch: false }
      : readSize(),
  );

  useEffect(() => {
    const onResize = () => setSize(readSize());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return size;
};
