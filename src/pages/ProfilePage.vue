<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth';
import { useThemeStore } from 'src/stores/theme';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { useMedia } from 'src/hooks/useMedia';

const { isXs } = useMedia();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();

const handleLogOut = async () => {
  await authStore.logout();
  await router.push('/');
};

const userInitials = computed(() => {
  if (!authStore.user?.displayName) return '?';
  return authStore.user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const cardPadding = computed(() => {
  if (isXs) {
    return 'q-pt-md';
  }
  return 'q-pt-xl';
});

const avatarSize = computed(() => {
  if (isXs) {
    return '80px';
  }
  return '100px';
});

const avatarText = computed(() => {
  if (isXs) {
    return '28px';
  }
  return '36px';
});
</script>

<template>
  <div class="q-mt-lg" :class="cardPadding">
    <!-- Основная карточка -->
    <q-card
      class="q-mt-xl q-pa-md"
      :class="[themeStore.isDark ? 'bg-grey-9 shadow-0' : 'bg-white shadow-5']"
    >
      <!-- Аватар пользователя -->
      <q-card-section class="text-center q-pb-lg">
        <q-avatar
          :size="avatarSize"
          :font-size="avatarText"
          color="primary"
          text-color="white"
          class="avatar-container"
        >
          <div>
            {{ userInitials }}
          </div>

          <!-- Внешняя обводка с помощью QBadge -->
        </q-avatar>

        <h2 class="text-h5 q-mb-xs text-weight-medium">
          {{ authStore.user?.displayName || 'Пользователь' }}
        </h2>
      </q-card-section>

      <q-separator :class="themeStore.isDark ? 'bg-grey-8' : 'bg-grey-3'" />

      <!-- Информация об аккаунте -->
      <q-card-section class="q-pt-lg">
        <div class="text-subtitle1 q-mb-sm text-weight-medium text-primary">
          Информация об аккаунте
        </div>

        <div class="q-gutter-y-md">
          <!-- Имя -->
          <div class="row items-center q-py-sm">
            <q-icon
              name="person"
              size="sm"
              class="q-mr-md"
              :class="themeStore.isDark ? 'text-grey-5' : 'text-grey-7'"
            />
            <div class="col">
              <div class="text-caption text-grey-6">Имя</div>
              <div class="text-body1 text-weight-medium">
                {{ authStore.user?.displayName || 'Не указано' }}
              </div>
            </div>
          </div>

          <!-- Почта -->
          <div class="info-item row items-center q-py-sm q-mt-none">
            <q-icon
              name="email"
              size="sm"
              class="q-mr-md"
              :class="themeStore.isDark ? 'text-grey-5' : 'text-grey-7'"
            />
            <div class="col">
              <div class="text-caption text-grey-6">Электронная почта</div>
              <div class="text-body1 text-weight-medium">
                {{ authStore.user?.email }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator :class="themeStore.isDark ? 'bg-grey-8' : 'bg-grey-3'" />

      <!-- Действия -->
      <q-card-section class="actions-section q-pt-lg">
        <div class="text-subtitle1 q-mb-md text-weight-medium text-primary">Действия</div>

        <div class="action-buttons q-gutter-y-sm">
          <q-btn
            @click="handleLogOut"
            color="negative"
            class="full-width"
            :class="!themeStore.isDark && 'bg-red-2'"
            size="md"
            icon="logout"
            label="Выйти из аккаунта"
            no-caps
            :flat="!themeStore.isDark"
            :outline="themeStore.isDark"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
