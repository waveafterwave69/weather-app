<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme';
import { useWeatherStore } from 'src/stores/weather';

const themeStore = useThemeStore();
const weatherStore = useWeatherStore();
</script>

<template>
  <q-input
    filled
    v-model="weatherStore.searchValue"
    label="Поиск города"
    @keypress="weatherStore.handleKeyPress"
    :loading="weatherStore.loading"
    :error="!!weatherStore.error"
    :error-message="weatherStore.error || undefined"
    :dark="themeStore.isDark"
    :color="themeStore.isDark ? 'primary' : 'primary'"
    :bg-color="themeStore.isDark ? 'bg-surface' : 'bg-surface'"
    :input-style="{
      color: themeStore.isDark ? 'var(--text-primary)' : 'var(--text-primary)',
    }"
    class="q-mt-xl"
  >
    <template v-slot:prepend>
      <q-icon name="search" />
    </template>
    <template v-slot:append>
      <q-btn
        flat
        dense
        round
        icon="my_location"
        @click="weatherStore.retryLocationDetection"
        :loading="weatherStore.locationLoading"
        :color="themeStore.isDark ? 'primary' : 'primary'"
        size="sm"
      >
        <q-tooltip>Определить мое местоположение</q-tooltip>
      </q-btn>
    </template>
  </q-input>
</template>

<style scoped></style>
