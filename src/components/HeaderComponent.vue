<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme';
import { useMedia } from 'src/hooks/useMedia';

const themeStore = useThemeStore();

const { isXs } = useMedia();
</script>

<template>
  <header class="q-py-sm" :class="themeStore.isDark ? 'bg-dark' : 'bg-primary'">
    <q-toolbar
      class="container"
      :class="themeStore.isDark ? 'bg-dark-surface text-dark' : 'bg-light-surface text-light'"
    >
      <!-- Логотип и заголовок -->
      <div class="row items-center no-wrap">
        <q-toolbar-title class="text-white">
          <router-link to="/" class="text-white text-no-wrap" :class="isXs ? 'text-h6' : 'text-h5'">
            Weather 🌦️
          </router-link>
        </q-toolbar-title>
      </div>

      <q-space />

      <!-- Кнопка переключения темы -->
      <q-btn
        flat
        round
        dense
        :icon="themeStore.isDark ? 'light_mode' : 'dark_mode'"
        @click="themeStore.toggleTheme"
        :color="themeStore.isDark ? 'warning' : 'white'"
        size="md"
        class="q-ml-md"
      />
    </q-toolbar>
  </header>
</template>
