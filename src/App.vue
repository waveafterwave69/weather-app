<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import HeaderComponent from './components/HeaderComponent.vue';
import { useThemeStore } from './stores/theme';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const appReady = ref(false);

// Компьютед для удобства - используем уже существующий геттер из хранилища
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAuthPage = computed(() => route.path === '/');

// Наблюдаем за изменением темы
watch(
  () => themeStore.isDark,
  (isDark) => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  },
  { immediate: true },
);

// Наблюдаем за изменениями авторизации
watch(
  isAuthenticated,
  (authenticated) => {
    if (!appReady.value) return;

    const redirect = async () => {
      try {
        if (authenticated && isAuthPage.value) {
          // Если авторизовались и находимся на странице авторизации
          await router.push('/main');
        } else if (!authenticated && !isAuthPage.value) {
          // Если вышли из системы и не на странице авторизации
          await router.push('/');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Можно добавить обработку ошибок навигации
      }
    };

    void redirect(); // Используем void для игнорирования промиса
  },
  { immediate: true }, // Добавляем immediate: true для немедленного выполнения
);

// Наблюдаем за маршрутом
watch(
  () => route.path,
  (path) => {
    if (!appReady.value) return;

    const redirect = async () => {
      try {
        // Если не авторизован и пытается получить доступ к защищенной странице
        if (!isAuthenticated.value && path !== '/') {
          await router.push('/');
        }
        // Если авторизован и находится на странице авторизации
        else if (isAuthenticated.value && path === '/') {
          await router.push('/main');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Можно добавить обработку ошибок навигации
      }
    };

    void redirect(); // Используем void для игнорирования промиса
  },
  { immediate: true }, // Добавляем immediate: true
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

  // Даем время на инициализацию Firebase (auth уже следит за состоянием через onAuthStateChanged)
  await new Promise((resolve) => setTimeout(resolve, 500));

  appReady.value = true;

  // Первоначальная проверка маршрута
  try {
    if (isAuthenticated.value && isAuthPage.value) {
      await router.push('/main');
    } else if (!isAuthenticated.value && !isAuthPage.value) {
      await router.push('/');
    }
  } catch (error) {
    console.error('Initial navigation error:', error);
  }
});
</script>

<template>
  <div v-if="!appReady" class="fullscreen flex flex-center">
    <q-spinner size="xl" />
  </div>
  <q-layout v-else view="lHh lpr lFf">
    <HeaderComponent v-if="isAuthenticated" />
    <div class="container">
      <router-view />
    </div>
  </q-layout>
</template>

<style lang="scss">
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
