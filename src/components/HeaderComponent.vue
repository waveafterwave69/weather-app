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
  <header
    class="header"
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
            to="/main"
            class="text-white text-no-wrap"
            :class="isXs ? 'text-h6' : 'text-h5'"
          >
            🌦️ weather
          </router-link>
        </q-toolbar-title>
      </div>

      <q-space />

      <!-- Профиль -->
      <div class="q-pa-md" v-if="user">
        <q-btn flat round dense icon="person" color="white" size="md" class="q-ml-md">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column items-center">
                <q-avatar size="52px">
                  <img src="../assets/user.png" />
                </q-avatar>

                <div class="text-subtitle1 q-mt-md">{{ user.displayName }}</div>
                <div class="text-subtitle2 q-mb-md">{{ user.email }}</div>

                <q-btn color="primary" label="Выйти" push size="md" v-close-popup />
              </div>
            </div>
          </q-menu>
        </q-btn>
      </div>

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
  </header>
</template>
