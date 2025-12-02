<script setup lang="ts">
import { useMedia } from 'src/hooks/useMedia';
import { useAuthStore } from 'src/stores/auth';
import { useThemeStore } from 'src/stores/theme';
import { ref, computed } from 'vue';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const isDark = computed(() => themeStore.isDark);

const name = ref('');
const email = ref('');
const password = ref('');

const { isXs } = useMedia();
</script>

<template>
  <!-- Адаптивный заголовок -->
  <h2
    class="text-center q-mb-md q-mt-xl"
    :class="[isXs ? 'text-h5' : 'text-h4 q-mt-xl', isDark ? 'text-white' : 'text-dark']"
  >
    Регистрация
  </h2>

  <!-- Адаптивный контейнер -->
  <div
    class="q-py-md text-center q-mx-auto"
    :class="isXs ? 'q-px-sm' : ''"
    :style="{
      maxWidth: isXs ? '100%' : '500px',
      paddingLeft: isXs ? '16px' : '',
      paddingRight: isXs ? '16px' : '',
    }"
  >
    <q-form class="q-gutter-sm">
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
      />

      <!-- Кнопка регистрации -->
      <q-btn
        label="Зарегистрироваться"
        type="submit"
        color="primary"
        :class="[isDark ? 'text-white' : 'text-dark', isXs ? 'text-subtitle2' : 'text-subtitle1']"
        class="q-mb-md full-width"
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
            @click="authStore.setLogin"
            :class="isXs ? 'text-subtitle2' : 'text-subtitle2'"
          >
            Войти
          </span>
        </p>
      </div>
    </q-form>
  </div>
</template>
