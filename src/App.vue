<script setup lang="ts">
import { onMounted } from 'vue';
import HeaderComponent from './components/HeaderComponent.vue';
import { useThemeStore } from './stores/theme';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initializeTheme();
});
</script>

<template>
  <q-layout view="lHh lpr lFf" class="shadow-2 rounded-borders">
    <HeaderComponent />
    <div class="container">
      <router-view />
    </div>
  </q-layout>
</template>
