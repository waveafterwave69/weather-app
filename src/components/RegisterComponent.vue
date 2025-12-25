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

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const { isXs } = useMedia();

// Проверка совпадения паролей
const passwordMatch = (val: string) => val === password.value || 'Пароли не совпадают';

// Обработка регистрации
const handleRegister = async () => {
  // Валидация формы
  if (!name.value || !email.value || !password.value || !confirmPassword.value) return;

  if (password.value.length < 6) return;

  if (password.value !== confirmPassword.value) return;

  try {
    await authStore.register(email.value, password.value, name.value);

    // Переключаемся на форму входа
    authStore.setLoginMode();

    // Очищаем поля
    name.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';

    await router.push('/main');
  } catch (error) {
    console.error('Registration error:', error);
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
    class="text-center q-mb-md q-mt-xl q-pt-xl"
    :class="[isXs ? 'text-h5' : 'text-h4 q-mt-xl', isDark ? 'text-white' : 'text-dark']"
  >
    Регистрация
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
    <q-form @submit.prevent="handleRegister" class="q-gutter-sm q-mx-none q-px-none">
      <!-- Поле имени -->
      <q-input
        class="q-ma-none"
        outlined
        v-model="name"
        label="Имя"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || '']"
        :dark="isDark"
        :color="isDark ? 'primary' : 'primary'"
        :bg-color="isDark ? 'dark' : 'white'"
        :input-style="{ color: isDark ? 'white' : 'dark' }"
        :dense="isXs"
        @update:model-value="clearError"
      />

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
        :rules="[(val) => (val && val.length > 0) || '']"
        :dark="isDark"
        :color="isDark ? 'primary' : 'primary'"
        :bg-color="isDark ? 'dark' : 'white'"
        :input-style="{ color: isDark ? 'white' : 'dark' }"
        :dense="isXs"
        @update:model-value="clearError"
      />

      <!-- Поле подтверждения пароля -->
      <q-input
        class="q-ma-none"
        outlined
        type="password"
        v-model="confirmPassword"
        label="Подтвердите пароль"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || '', passwordMatch]"
        :dark="isDark"
        :color="isDark ? 'primary' : 'primary'"
        :bg-color="isDark ? 'dark' : 'white'"
        :input-style="{ color: isDark ? 'white' : 'dark' }"
        :dense="isXs"
        @update:model-value="clearError"
      />

      <!-- Кнопка регистрации -->
      <q-btn
        label="Зарегистрироваться"
        type="submit"
        color="primary"
        :class="[isDark ? 'text-white' : 'text-dark', isXs ? 'text-subtitle2' : 'text-subtitle1']"
        class="full-width"
        :loading="authStore.loading"
        :disable="authStore.loading"
      />

      <!-- Ссылка на вход -->
      <div class="q-pt-sm text-center">
        <p
          :class="[isDark ? 'text-white' : 'text-dark', isXs ? 'text-subtitle2' : 'text-subtitle2']"
          class="q-mb-md"
        >
          Есть аккаунт?
          <span
            class="text-primary cursor-pointer q-ml-xs"
            @click="authStore.setLoginMode"
            :class="isXs ? 'text-subtitle2' : 'text-subtitle2'"
          >
            Войти
          </span>
        </p>
      </div>
    </q-form>
  </div>
</template>
