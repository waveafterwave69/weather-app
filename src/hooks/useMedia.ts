import { useQuasar } from 'quasar';

export const useMedia = () => {
  const $q = useQuasar();

  // Определяем xs breakpoint вручную
  const isXs = $q.screen.width < 500;
  const isSm = $q.screen.lt.sm;
  const isMd = $q.screen.md;
  const isLg = $q.screen.lg;
  const isXl = $q.screen.xl;

  return { isXs, isSm, isMd, isLg, isXl };
};
