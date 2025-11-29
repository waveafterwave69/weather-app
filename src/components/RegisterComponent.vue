<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth';
import { useThemeStore } from 'src/stores/theme';
import { ref, computed } from 'vue';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const isDark = computed(() => themeStore.isDark);

const name = ref('');
const email = ref('');
const password = ref('');
</script>

<template>
  <h2 class="text-h4 text-center q-mt-xl q-mb-md" :class="isDark ? 'text-white' : 'text-dark'">
    Регистрация
  </h2>
  <div class="q-py-md text-center q-mx-auto" style="max-width: 500px">
    <q-form class="q-gutter-sm">
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
      />

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
      />

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
      />

      <q-btn
        label="Зарегистрироваться"
        type="submit"
        color="primary"
        class="full-width q-py-none text-subtitle1"
      />

      <div class="q-pt-sm text-center">
        <p :class="isDark ? 'text-white' : 'text-dark'" class="q-mb-md text-subtitle1">
          Есть аккаунт?
          <span outline class="text-primary cursor-pointer" @click="authStore.setLogin">
            Войти
          </span>
        </p>
      </div>
    </q-form>
  </div>
</template>
