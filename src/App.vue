<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import HeaderComponent from './components/HeaderComponent.vue';
import { useThemeStore } from './stores/theme';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);
const appReady = ref(false);

// Наблюдаем за изменением темы и обновляем атрибут body
watch(
  () => themeStore.isDark,
  (isDark) => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  },
);

onMounted(async () => {
  // Инициализируем тему
  themeStore.initializeTheme();

  // Устанавливаем начальную тему
  if (themeStore.isDark) {
    document.body.setAttribute('data-theme', 'dark');
  } else {
    document.body.removeAttribute('data-theme');
  }

  // Ждём инициализации Firebase
  await new Promise((resolve) => setTimeout(resolve, 1000));
  appReady.value = true;

  // Проверяем пользователя и перенаправляем
  if (user.value) {
    await router.push('/main');
  }
});
</script>

<template>
  <div v-if="!appReady" class="fullscreen flex flex-center">
    <q-spinner size="xl" />
  </div>
  <q-layout v-else view="lHh lpr lFf">
    <HeaderComponent />
    <div class="container">
      <router-view />
    </div>
  </q-layout>
</template>

<style lang="scss">
// Добавьте эти стили для применения темы ко всему приложению
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.q-layout {
  background-color: var(--bg-primary);
}

// Стили для Quasar компонентов
.q-card {
  background-color: var(--bg-surface) !important;
  color: var(--text-primary) !important;
}

.q-field {
  &__control {
    color: var(--text-primary) !important;
  }

  &__native {
    color: var(--text-primary) !important;
  }

  &__label {
    color: var(--text-secondary) !important;
  }
}
</style>
