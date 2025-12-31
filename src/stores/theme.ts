import { defineStore } from 'pinia';
import { useStorage, usePreferredDark, useMediaQuery } from '@vueuse/core';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const darkModeStorage = useStorage('darkMode', null);
  const prefersDark = usePreferredDark();

  const isDark = ref();

  const initializeTheme = () => {
    if (darkModeStorage.value === null) {
      // Если в хранилище нет значения, используем системную тему
      isDark.value = prefersDark.value;
    } else {
      // Если есть сохраненное значение, используем его
      isDark.value = darkModeStorage.value === 'true' || darkModeStorage.value === true;
    }

    applyTheme();

    const mediaQuery = useMediaQuery('(prefers-color-scheme: dark)');

    watch(mediaQuery, (isSystemDark) => {
      if (darkModeStorage.value === null) {
        isDark.value = isSystemDark;
        applyTheme();
      }
    });
  };

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    // useStorage автоматически сохранит значение
    darkModeStorage.value = isDark.value;
    applyTheme();
  };

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');

    if (isDark.value) {
      document.body.classList.add('body--dark', 'dark');
      document.body.classList.remove('body--light');
    } else {
      document.body.classList.add('body--light');
      document.body.classList.remove('body--dark', 'dark');
    }
  };

  watch(isDark, applyTheme, { immediate: false });

  return {
    isDark,
    toggleTheme,
    initializeTheme,
    applyTheme,
  };
});
