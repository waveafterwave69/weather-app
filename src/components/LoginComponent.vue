<script setup lang="ts">
import { useMedia } from 'src/hooks/useMedia';
import { useAuthStore } from 'src/stores/auth';
import { useThemeStore } from 'src/stores/theme';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const isDark = computed(() => themeStore.isDark);

const email = ref('');
const password = ref('');

const { isXs } = useMedia();

// Обработка входа
const handleLogin = async () => {
  // Валидация формы
  if (!email.value || !password.value) return;

  if (password.value.length < 6) return;

  try {
    await authStore.login(email.value, password.value);

    // Редирект на главную страницу (добавлен await)
    await router.push('/main');
  } catch (error) {
    // Ошибка уже обработана в хранилище
    console.error('Login error:', error);
  }
};

// Сброс ошибки при изменении полей
const clearError = () => {
  authStore.clearError();
};
</script>

<template>
  <!-- Адаптивный заголовок -->
  <h2
    class="text-center q-mt-xl q-mb-md q-pt-xl"
    :class="[isXs ? 'text-h5' : 'text-h4', isDark ? 'text-white' : 'text-dark']"
  >
    Вход
  </h2>

  <!-- Адаптивный контейнер -->
  <div
    class="q-py-md text-center q-mx-auto"
    :style="{
      maxWidth: isXs ? '100%' : '500px',
    }"
  >
    <!-- Сообщение об ошибке -->
    <div v-if="authStore.error" class="q-mb-lg q-px-none">
      <q-banner dense class="bg-negative text-white">
        {{ authStore.error }}
      </q-banner>
    </div>
    <q-form @submit.prevent="handleLogin" class="q-gutter-sm q-mx-none">
      <!-- Поле email -->
      <q-input
        class="q-ma-none"
        outlined
        v-model="email"
        label="Email"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || '']"
        :dark="isDark"
        :color="isDark ? 'primary' : 'primary'"
        :bg-color="isDark ? 'dark' : 'white'"
        :input-style="{ color: isDark ? 'white' : 'dark' }"
        :dense="isXs"
        @update:model-value="clearError"
      />

      <!-- Поле пароля -->
      <q-input
        class="q-ma-none"
        outlined
        type="password"
        v-model="password"
        label="Пароль"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || '',
          (val) => (val && val.length > 6) || 'Пароль должен содержать больше 6 символов',
        ]"
        :dark="isDark"
        :color="isDark ? 'primary' : 'primary'"
        :bg-color="isDark ? 'dark' : 'white'"
        :input-style="{ color: isDark ? 'white' : 'dark' }"
        :dense="isXs"
        @update:model-value="clearError"
      />

      <!-- Кнопка входа -->
      <q-btn
        label="Войти"
        type="submit"
        color="primary"
        class="full-width"
        :class="isXs ? 'text-subtitle2' : 'text-subtitle1'"
        :loading="authStore.loading"
        :disable="authStore.loading"
      />

      <!-- Ссылка на регистрацию -->
      <div class="q-pt-sm text-center">
        <p
          :class="[isDark ? 'text-white' : 'text-dark', isXs ? 'text-subtitle2' : 'text-subtitle1']"
          class="q-mb-md"
        >
          Нет аккаунта?
          <span
            class="text-primary cursor-pointer q-ml-xs"
            @click="authStore.setRegisterMode"
            :class="isXs ? 'text-subtitle2' : 'text-subtitle1'"
          >
            Зарегистрироваться
          </span>
        </p>
      </div>
    </q-form>
  </div>
</template>
