<script setup lang="ts">
import { ref } from 'vue';
import { useThemeStore } from 'src/stores/theme';

const themeStore = useThemeStore();
const searchValue = ref<string>();
</script>

<template>
  <div style="max-width: 100%">
    <q-input
      filled
      v-model="searchValue"
      label="Поиск города"
      :dark="themeStore.isDark"
      :color="themeStore.isDark ? 'primary' : 'primary'"
      :bg-color="themeStore.isDark ? 'bg-surface' : 'bg-surface'"
      :input-style="{
        color: themeStore.isDark ? 'var(--text-primary)' : 'var(--text-primary)',
      }"
      class="custom-input q-mt-md"
    />
  </div>
</template>
