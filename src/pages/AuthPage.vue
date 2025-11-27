<script setup lang="ts">
import LoginComponent from 'src/components/LoginComponent.vue';
import RegisterComponent from 'src/components/RegisterComponent.vue';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div class="">
    <RegisterComponent v-if="authStore.auth === 'register'" />
    <LoginComponent v-else />
  </div>
</template>

<style scoped></style>
