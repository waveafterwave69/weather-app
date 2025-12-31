<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme';
import { useMedia } from 'src/hooks/useMedia';
import { useAuthStore } from 'src/stores/auth';
import { computed } from 'vue';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const { isXs } = useMedia();
</script>

<template>
  <q-header
    :class="[
      themeStore.isDark ? 'bg-dark' : 'bg-primary',
      themeStore.isDark ? 'shadow-1' : 'shadow-1',
    ]"
  >
    <q-toolbar class="container">
      <!-- Логотип и заголовок -->
      <div class="row items-center no-wrap">
        <q-toolbar-title>
          <router-link
            v-if="user"
            to="/main"
            class="text-white text-no-wrap"
            :class="isXs ? 'text-h6' : 'text-h5'"
          >
            🌦️ weather
          </router-link>
          <router-link
            v-else
            to="/"
            class="text-white text-no-wrap"
            :class="isXs ? 'text-h6' : 'text-h5'"
          >
            🌦️ weather
          </router-link>
        </q-toolbar-title>
      </div>

      <q-space />

      <!-- Профиль -->
      <router-link to="/profile" class="q-pa-md" v-if="user">
        <q-btn flat round dense icon="person" color="white" size="md" class="q-ml-md">
          <q-tooltip v-if="!isXs"> Профиль </q-tooltip></q-btn
        >
      </router-link>

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
        <q-tooltip v-if="!isXs">
          {{ themeStore.isDark ? 'Светлая тема' : 'Тёмная тема' }}
        </q-tooltip>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>
