<script setup lang="ts">
import LoginComponent from 'src/components/LoginComponent.vue';
import RegisterComponent from 'src/components/RegisterComponent.vue';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div>
    <RegisterComponent v-if="authStore.authMode === 'register'" />
    <LoginComponent v-else />
  </div>
</template>
