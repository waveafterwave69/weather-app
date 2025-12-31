<script setup lang="ts">
import { useMedia } from 'src/hooks/useMedia';
import { useThemeStore } from 'src/stores/theme';
import { useWeatherStore } from 'src/stores/weather';
import { computed } from 'vue';

const { isXs } = useMedia();
const themeStore = useThemeStore();
const weatherStore = useWeatherStore();

const cardPadding = computed(() => {
  if (isXs) {
    return 'q-pa-md';
  }
  return 'q-pa-lg';
});

const weatherSize = computed(() => {
  if (isXs) {
    return 'text-h3';
  }
  return 'text-h1';
});

const textSize = computed(() => {
  if (isXs) {
    return 'text-subtitle2';
  }
  return 'text-subtitle1';
});

const weatherMarginTop = computed(() => {
  if (isXs) {
    return 'q-mt-lg';
  }
  return 'q-mt-xl';
});
</script>

<template>
  <div v-if="weatherStore.weatherData" class="q-mt-sm">
    <q-card
      :dark="themeStore.isDark"
      :class="[cardPadding, themeStore.isDark ? 'bg-grey-9 shadow-0' : 'bg-white shadow-5']"
      class="q-mb-sm"
    >
      <div class="row items-center justify-between">
        <div>
          <div class="text-h6 text-weight-bold">
            {{ weatherStore.weatherData.name }}, {{ weatherStore.weatherData.sys?.country }}
            <q-icon
              v-if="
                weatherStore.userLocation &&
                weatherStore.weatherData.coord &&
                Math.abs(weatherStore.userLocation.lat - weatherStore.weatherData.coord.lat) <
                  0.1 &&
                Math.abs(weatherStore.userLocation.lon - weatherStore.weatherData.coord.lon) < 0.1
              "
              name="my_location"
              size="16px"
              color="primary"
              class="q-ml-xs"
            >
              <q-tooltip>Ваше текущее местоположение</q-tooltip>
            </q-icon>
          </div>
          <div class="text-caption text-grey q-mt-xs">
            {{
              new Date(weatherStore.weatherData.dt * 1000).toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })
            }}
          </div>
        </div>
        <q-icon
          v-if="weatherStore.weatherData.weather[0]?.icon"
          :name="weatherStore.getWeatherIcon(weatherStore.weatherData.weather[0].icon)"
          :color="weatherStore.getWeatherIconColor(weatherStore.weatherData.weather[0].icon)"
          size="48px"
        />
      </div>

      <div class="row items-center" :class="weatherMarginTop">
        <div class="col-auto">
          <div class="text-weight-light" :class="weatherSize">
            {{ Math.round(weatherStore.weatherData.main.temp) }}°
          </div>
        </div>
        <div class="col q-ml-xl">
          <div class="q-mb-xs flex items-center">
            <q-icon name="thermostat" size="20px" class="q-mr-sm" :class="textSize" />
            Ощущается как: {{ Math.round(weatherStore.weatherData.main.feels_like) }}°
          </div>
          <div class="flex items-center">
            <q-icon
              :name="weatherStore.getWeatherIcon(weatherStore.weatherData.weather[0]?.icon)"
              size="20px"
              class="q-mr-sm"
              :class="textSize"
            />
            {{
              weatherStore.capitalizeFirstLetter(weatherStore.weatherData.weather[0]?.description)
            }}
          </div>
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <div class="text-caption text-grey">Влажность</div>
          <div class="row items-center q-mt-xs">
            <q-icon name="water_drop" size="20px" class="q-mr-sm" color="info" />
            <div class="text-weight-medium" :class="textSize">
              {{ weatherStore.weatherData.main.humidity }}%
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <div class="text-caption text-grey">Давление</div>
          <div class="row items-center q-mt-xs">
            <q-icon name="speed" size="20px" class="q-mr-sm" color="deep-orange" />
            <div class="text-weight-medium" :class="textSize">
              {{ Math.round(weatherStore.weatherData.main.pressure * 0.75) }} мм рт. ст.
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <div class="text-caption text-grey">Ветер</div>
          <div class="row items-center q-mt-xs">
            <q-icon name="air" size="20px" class="q-mr-sm" color="teal" />
            <div class="text-weight-medium" :class="textSize">
              {{ weatherStore.weatherData.wind.speed }} м/с
              <span class="text-caption text-grey q-ml-xs">
                {{ weatherStore.getWindDirection(weatherStore.weatherData.wind.deg) }}
              </span>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <div class="text-caption text-grey">Видимость</div>
          <div class="row items-center q-mt-xs">
            <q-icon name="visibility" size="20px" class="q-mr-sm" color="blue-grey" />
            <div class="text-weight-medium" :class="textSize">
              {{ (weatherStore.weatherData.visibility / 1000).toFixed(1) }} км
            </div>
          </div>
        </div>
      </div>

      <!-- Восход и закат -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-sm-3">
          <div class="text-caption text-grey">Восход</div>
          <div class="row items-center q-mt-xs">
            <q-icon name="wb_sunny" size="20px" class="q-mr-sm" color="warning" />
            <div class="text-weight-medium" :class="textSize">
              {{
                weatherStore.formatTime(
                  weatherStore.weatherData.sys.sunrise,
                  weatherStore.weatherData.timezone,
                )
              }}
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-3">
          <div class="text-caption text-grey">Закат</div>
          <div class="row items-center q-mt-xs">
            <q-icon name="nightlight" size="20px" class="q-mr-sm" color="deep-orange" />
            <div class="text-weight-medium" :class="textSize">
              {{
                weatherStore.formatTime(
                  weatherStore.weatherData.sys.sunset,
                  weatherStore.weatherData.timezone,
                )
              }}
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-3">
          <div class="text-caption text-grey">Мин/Макс</div>
          <div class="row items-center q-mt-xs">
            <q-icon name="thermostat" size="20px" class="q-mr-sm" color="red" />
            <div class="text-weight-medium" :class="textSize">
              {{ Math.round(weatherStore.weatherData.main.temp_min) }}° /
              {{ Math.round(weatherStore.weatherData.main.temp_max) }}°
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>

<style scoped></style>
