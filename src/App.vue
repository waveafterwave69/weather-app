<script setup lang="ts">
import HeaderComponent from './components/HeaderComponent.vue';
</script>

<template>
  <q-layout view="lHh lpr lFf" class="shadow-2 rounded-borders">
    <HeaderComponent />
    <div class="container">
      <router-view />
    </div>
  </q-layout>
</template>
