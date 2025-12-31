<script setup lang="ts">
import { useWeatherStore } from 'src/stores/weather';

const weatherStore = useWeatherStore();
</script>

<template>
  <!-- Сообщение об определении местоположения -->
  <div v-if="weatherStore.locationLoading" class="q-mb-md text-center">
    <q-spinner size="24px" color="primary" />
    <div class="q-mt-xs text-caption text-subtitle1">Определение вашего местоположения...</div>
    <div class="q-mt-xs text-caption text-grey text-subtitle1">
      Пожалуйста, разрешите доступ к геолокации
    </div>
  </div>

  <!-- Сообщение, если доступ к геолокации запрещен -->
  <div v-if="weatherStore.locationDenied && !weatherStore.weatherData" class="q-mt-xl text-center">
    <q-icon name="location_off" size="48px" color="warning" />
    <div class="q-mt-md text-subtitle1">Доступ к местоположению запрещен</div>
    <div class="q-mt-sm text-body2 text-grey">
      Для автоматического определения погоды разрешите доступ к геолокации:
    </div>
    <div class="q-mt-sm text-body2 text-grey">
      1. Нажмите на иконку замка рядом с адресной строкой<br />
      2. Найдите "Местоположение"<br />
      3. Выберите "Разрешить"<br />
      4. Обновите страницу или нажмите кнопку ниже
    </div>
    <div class="q-mt-sm text-body2 text-grey">Или введите город вручную в поле поиска выше</div>
    <q-btn
      color="primary"
      label="Повторить запрос местоположения"
      @click="weatherStore.retryLocationDetection"
      class="q-mt-md"
      icon="my_location"
    />
    <q-btn
      color="secondary"
      label="Использовать Москву"
      @click="weatherStore.fetchWeatherByCity('Москва')"
      class="q-mt-md q-ml-sm"
      flat
    />
  </div>

  <!-- Сообщение, если город не найден -->
  <div
    v-else-if="
      weatherStore.searchValue &&
      !weatherStore.loading &&
      !weatherStore.weatherData &&
      !weatherStore.locationDenied
    "
    class="q-mt-xl text-center"
  >
    <q-icon name="location_off" size="48px" color="grey" />
    <div class="q-mt-md text-subtitle1">Город не найден. Попробуйте другой.</div>
  </div>
</template>

<style scoped></style>
