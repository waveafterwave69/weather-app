import { defineStore } from 'pinia';
import { ref } from 'vue';

type Auth = 'login' | 'register';

export const useAuthStore = defineStore('auth', () => {
  const auth = ref<Auth>('login');

  const setRegister = () => {
    auth.value = 'register';
  };

  const setLogin = () => {
    auth.value = 'login';
  };

  return {
    auth,
    setRegister,
    setLogin,
  };
});
