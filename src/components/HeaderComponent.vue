<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme';
import { useMedia } from 'src/hooks/useMedia';

const themeStore = useThemeStore();
const { isXs } = useMedia();
</script>

<template>
  <header
    class="header q-py-sm"
    :class="[
      themeStore.isDark ? 'bg-dark' : 'bg-primary',
      themeStore.isDark ? 'shadow-1' : 'shadow-1',
    ]"
  >
    <q-toolbar class="container">
      <!-- Логотип и заголовок -->
      <div class="row items-center no-wrap">
        <q-toolbar-title>
          <router-link to="/" class="text-white text-no-wrap" :class="isXs ? 'text-h6' : 'text-h5'">
            Weather 🌦️
          </router-link>
        </q-toolbar-title>
      </div>

      <q-space />

      <!-- Профиль -->
      <q-btn flat round dense icon="person" color="white" size="md" class="q-ml-md" />

      <!-- Кнопка переключения темы -->
      <q-btn
        flat
        round
        dense
        :icon="themeStore.isDark ? 'light_mode' : 'dark_mode'"
        @click="themeStore.toggleTheme"
        color="white"
        size="md"
        class="q-ml-md"
      >
        <q-tooltip>
          {{ themeStore.isDark ? 'Светлая тема' : 'Тёмная тема' }}
        </q-tooltip>
      </q-btn>
    </q-toolbar>
  </header>
</template>
