// composables/useTheme.ts
import { computed } from 'vue';
import { useThemeStore } from 'src/stores/theme';

export function useTheme() {
  const themeStore = useThemeStore();

  const themeClasses = computed(() => ({
    'theme-dark': themeStore.isDark,
    'theme-light': !themeStore.isDark,
    'bg-surface': true,
    'text-primary': true,
  }));

  const themeColors = computed(() => ({
    bg: themeStore.isDark ? 'bg-dark' : 'bg-white',
    text: themeStore.isDark ? 'text-white' : 'text-dark',
    surface: themeStore.isDark ? 'bg-dark-surface' : 'bg-light-surface',
    border: themeStore.isDark ? 'border-dark' : 'border-light',
  }));

  // Правильное связывание методов
  const toggleTheme = (): void => {
    themeStore.toggleTheme();
  };

  return {
    themeClasses,
    themeColors,
    isDark: computed(() => themeStore.isDark),
    toggleTheme,
  };
}
