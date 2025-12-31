import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

type AuthMode = 'login' | 'register';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

// Интерфейс для ошибки Firebase
interface FirebaseError extends Error {
  code: string;
  message: string;
  name: string;
}

// Проверяем, является ли ошибка FirebaseError
const isFirebaseError = (error: unknown): error is FirebaseError => {
  return error instanceof Error && 'code' in error && typeof error.code === 'string';
};

export const useAuthStore = defineStore('auth', () => {
  const authMode = ref<AuthMode>('login');
  const user = ref<UserData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Проверяем, авторизован ли пользователь
  const isAuthenticated = computed(() => !!user.value);

  // Установка режима
  const setRegisterMode = () => {
    authMode.value = 'register';
    error.value = null;
  };

  const setLoginMode = () => {
    authMode.value = 'login';
    error.value = null;
  };

  // Регистрация
  const register = async (email: string, password: string, name: string) => {
    loading.value = true;
    error.value = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Обновляем профиль с именем
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Отправляем email для подтверждения
      await sendEmailVerification(userCredential.user);

      // Сохраняем данные пользователя
      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
      };

      return userCredential.user;
    } catch (err: unknown) {
      handleAuthError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Вход
  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
      };

      return userCredential.user;
    } catch (err: unknown) {
      handleAuthError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Выход
  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Неизвестная ошибка';
      }
      throw err;
    }
  };

  // Обработка ошибок аутентификации
  const handleAuthError = (err: unknown) => {
    if (!isFirebaseError(err)) {
      error.value = 'Неизвестная ошибка';
      return;
    }

    switch (err.code) {
      case 'auth/email-already-in-use':
        error.value = 'Этот email уже зарегистрирован';
        break;
      case 'auth/invalid-email':
        error.value = 'Неверный формат email';
        break;
      case 'auth/weak-password':
        error.value = 'Пароль должен содержать минимум 6 символов';
        break;
      case 'auth/user-not-found':
        error.value = 'Пользователь не найден';
        break;
      case 'auth/wrong-password':
        error.value = 'Неверный пароль';
        break;
      case 'auth/too-many-requests':
        error.value = 'Слишком много попыток. Попробуйте позже';
        break;
      case 'auth/network-request-failed':
        error.value = 'Ошибка сети. Проверьте подключение';
        break;
      case 'auth/user-disabled':
        error.value = 'Аккаунт отключен';
        break;
      case 'auth/operation-not-allowed':
        error.value = 'Операция не разрешена';
        break;
      default:
        error.value = err.message || 'Произошла ошибка';
    }
  };

  // Следим за состоянием аутентификации
  auth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
      };
    } else {
      user.value = null;
    }
  });

  return {
    // State
    authMode,
    user,
    loading,
    error,

    // Getters
    isAuthenticated,

    // Actions
    setRegisterMode,
    setLoginMode,
    register,
    login,
    logout,

    // Helpers
    clearError: () => {
      error.value = null;
    },
  };
});
