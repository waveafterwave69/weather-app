import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      this.applyTheme();
    },

    initializeTheme() {
      const saved = localStorage.getItem('darkMode');

      if (saved !== null) {
        this.isDark = saved === 'true';
      } else {
        // Авто-определение системной темы
        this.isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
      }

      this.applyTheme();
    },

    applyTheme() {
      // Обновляем атрибут data-theme для кастомных стилей
      document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');

      // Обновляем класс body для Quasar
      if (this.isDark) {
        document.body.classList.add('body--dark', 'dark');
        document.body.classList.remove('body--light');
      } else {
        document.body.classList.add('body--light');
        document.body.classList.remove('body--dark', 'dark');
      }

      localStorage.setItem('darkMode', this.isDark.toString());
    },
  },
});
