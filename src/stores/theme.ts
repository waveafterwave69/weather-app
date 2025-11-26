import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light');

  // Инициализация темы из localStorage или системных настроек
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      // Определяем системную тему
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme.value = systemPrefersDark ? 'dark' : 'light';
    }
    applyTheme(theme.value);
  };

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  const isDark = computed(() => theme.value === 'dark');

  watch(
    isDark,
    (newVal) => {
      if (newVal) {
        document.body.classList.add('body--dark');
        document.body.classList.remove('body--light');
      } else {
        document.body.classList.add('body--light');
        document.body.classList.remove('body--dark');
      }
    },
    { immediate: true },
  );

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        theme.value = e.matches ? 'dark' : 'light';
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  };

  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    theme,
    isDark,
    initializeTheme,
    toggleTheme,
    setTheme,
    setupSystemThemeListener,
  };
});
