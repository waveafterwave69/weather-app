<script setup lang="ts">
import SearchCity from '../components/SearchCity.vue';
import WeatherInfo from '../components/WeatherInfo.vue';
import WeatherError from '../components/WeatherError.vue';
import WeeklyForecast from '../components/WeeklyForecast.vue';
</script>

<template>
  <div class="full-width q-pt-xl">
    <!-- Поле поиска с кнопкой определения местоположения -->
    <SearchCity />

    <!-- Отображение текущей погоды -->
    <WeatherInfo />

    <!-- Прогноз на неделю -->
    <WeeklyForecast />

    <!-- Сообщение об ошибках -->
    <WeatherError />
  </div>
</template>
