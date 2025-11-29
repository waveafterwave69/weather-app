<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme';

const themeStore = useThemeStore();
console.log('hello');
</script>

<template>
  <header class="q-py-sm" :class="themeStore.isDark ? 'bg-dark' : 'bg-primary'">
    <q-toolbar
      class="container"
      :class="themeStore.isDark ? 'bg-dark-surface text-dark' : 'bg-light-surface text-light'"
    >
      <q-toolbar-title class="text-white text-h5"
        ><router-link to="/" class="text-white">Weather 🌦️</router-link></q-toolbar-title
      >
      <q-btn
        flat
        round
        dense
        :icon="themeStore.isDark ? 'light_mode' : 'dark_mode'"
        @click="themeStore.toggleTheme"
        :color="themeStore.isDark ? 'warning' : 'white'"
      />
    </q-toolbar>
  </header>
</template>
