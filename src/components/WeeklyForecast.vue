<!-- components/WeeklyForecast.vue -->
<template>
  <div class="q-mt-md">
    <q-card
      :dark="themeStore.isDark"
      :class="[themeStore.isDark ? 'bg-grey-9 shadow-0' : 'bg-white shadow-5']"
      class="q-mb-sm q-pa-lg"
    >
      <div class="text-h6 text-weight-bold q-mb-md">
        Прогноз на неделю
        <q-icon
          name="calendar_today"
          size="20px"
          class="q-ml-xs"
          :color="themeStore.isDark ? 'grey-4' : 'grey-7'"
        />
      </div>

      <!-- Загрузка -->
      <div v-if="weatherStore.forecastLoading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="48px" />
        <div class="q-mt-md text-subtitle1">Загружаем прогноз...</div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="weatherStore.forecastError" class="text-center q-pa-md">
        <q-icon name="error_outline" size="48px" color="warning" />
        <div class="q-mt-md text-subtitle1 text-warning">
          {{ weatherStore.forecastError }}
        </div>
        <q-btn color="primary" label="Повторить" @click="retryForecast" class="q-mt-md" outline />
      </div>

      <!-- Прогноз -->
      <div v-else-if="dailyForecast && dailyForecast.length > 0" class="weekly-forecast">
        <div class="row q-col-gutter-md">
          <div v-for="day in dailyForecast" :key="day.dt" class="col-12 col-sm-6 col-md">
            <q-card
              flat
              :class="[
                themeStore.isDark ? 'bg-grey-8' : 'bg-grey-1',
                isToday(day.dt) ? 'today-forecast' : '',
              ]"
              class="forecast-card text-center"
            >
              <div class="q-pa-sm">
                <div
                  class="text-subtitle2 text-weight-medium q-mb-xs"
                  :class="isToday(day.dt) ? 'text-primary' : ''"
                >
                  {{ formatDay(day.dt) }}
                  <span v-if="isToday(day.dt)" class="q-ml-xs text-caption text-primary">
                    (сегодня)
                  </span>
                </div>

                <q-icon
                  :name="weatherStore.getWeatherIcon(day.weather[0]?.icon)"
                  :color="weatherStore.getWeatherIconColor(day.weather[0]?.icon)"
                  size="36px"
                  class="q-mb-xs"
                />

                <div class="text-h6 text-weight-medium">{{ Math.round(day.main.temp) }}°</div>

                <div class="text-caption q-mt-xs">
                  {{ weatherStore.capitalizeFirstLetter(day.weather[0]?.description) }}
                </div>

                <q-separator class="q-my-xs" />

                <div class="row justify-between q-px-xs">
                  <div class="column items-center">
                    <q-icon name="water_drop" size="16px" color="info" />
                    <div class="text-caption">{{ day.main.humidity }}%</div>
                  </div>
                  <div class="column items-center">
                    <q-icon name="air" size="16px" color="teal" />
                    <div class="text-caption">{{ Math.round(day.wind.speed) }} м/с</div>
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Нет данных о прогнозе (но есть текущая погода) -->
      <div v-else-if="weatherStore.weatherData" class="text-center q-pa-lg">
        <q-icon name="info" size="48px" color="grey" />
        <div class="q-mt-md text-subtitle1 text-grey">Прогноз на неделю недоступен</div>
      </div>

      <!-- Нет данных вообще (пользователь не выбрал город) -->
      <div v-else class="text-center q-pa-lg">
        <q-icon name="search" size="48px" color="grey" />
        <div class="q-mt-md text-subtitle1 text-grey">Введите город, чтобы увидеть прогноз</div>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme';
import { useWeatherStore } from 'src/stores/weather';
import { computed } from 'vue';

const themeStore = useThemeStore();
const weatherStore = useWeatherStore();

// Получаем ежедневный прогноз
const dailyForecast = computed(() => {
  return weatherStore.getDailyForecast();
});

// Проверяем, является ли день сегодняшним
const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const date = new Date(timestamp * 1000);

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Форматирование дня
const formatDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

// Повторная загрузка прогноза
const retryForecast = async () => {
  if (weatherStore.weatherData) {
    await weatherStore.fetchWeeklyForecast(weatherStore.weatherData.name);
  } else if (weatherStore.searchValue.trim()) {
    await weatherStore.fetchWeeklyForecast(weatherStore.searchValue);
  }
};
</script>

<style scoped>
.forecast-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  min-height: 160px;
}

.forecast-card:hover {
  transform: translateY(-4px);
}

.today-forecast {
  border: 2px solid var(--q-primary);
}
</style>
