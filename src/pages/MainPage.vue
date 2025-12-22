<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useThemeStore } from 'src/stores/theme';
import { weatherService } from 'src/api/weatherApi';

interface CurrentWeather {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  dt: number;
  timezone: number;
}

const themeStore = useThemeStore();
const searchValue = ref<string>('Пенза');
const weatherData = ref<CurrentWeather | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// Функция для получения иконки погоды
const getWeatherIcon = (iconCode?: string): string => {
  if (!iconCode) return 'help_outline';

  const iconMap: Record<string, string> = {
    '01d': 'wb_sunny', // ясно (день)
    '01n': 'brightness_3', // ясно (ночь)
    '02d': 'partly_cloudy_day', // малооблачно (день)
    '02n': 'partly_cloudy_night', // малооблачно (ночь)
    '03d': 'cloud', // облачно
    '03n': 'cloud',
    '04d': 'cloud_queue', // облачно с прояснениями
    '04n': 'cloud_queue',
    '09d': 'grain', // ливень
    '09n': 'grain',
    '10d': 'rainy', // дождь (день)
    '10n': 'rainy', // дождь (ночь)
    '11d': 'thunderstorm', // гроза
    '11n': 'thunderstorm',
    '13d': 'ac_unit', // снег
    '13n': 'ac_unit',
    '50d': 'foggy', // туман
    '50n': 'foggy',
  };

  return iconMap[iconCode] || 'help_outline'; // иконка по умолчанию
};

// Функция для получения цвета иконки в зависимости от погоды
const getWeatherIconColor = (iconCode?: string): string => {
  if (!iconCode) return 'grey';

  if (iconCode.includes('01') || iconCode.includes('02')) {
    return 'warning'; // солнечно - желтый
  } else if (iconCode.includes('03') || iconCode.includes('04')) {
    return 'grey-6'; // облачно - серый
  } else if (iconCode.includes('09') || iconCode.includes('10')) {
    return 'info'; // дождь - синий
  } else if (iconCode.includes('11')) {
    return 'deep-purple'; // гроза - фиолетовый
  } else if (iconCode.includes('13')) {
    return 'blue-grey'; // снег - голубовато-серый
  } else {
    return 'grey'; // по умолчанию
  }
};

// Функция для преобразования первой буквы в заглавную
const capitalizeFirstLetter = (str?: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Функция для получения погоды
const fetchWeather = async (city: string): Promise<void> => {
  if (!city.trim()) {
    weatherData.value = null;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result = await weatherService.getCurrentWeather(city);
    weatherData.value = result as CurrentWeather;
    console.log('Weather data:', result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Не удалось получить данные о погоде';
    error.value = errorMessage;
    console.error('Error fetching weather:', err);
    weatherData.value = null;
  } finally {
    loading.value = false;
  }
};

// Загрузка начальных данных
onMounted(async () => {
  await fetchWeather(searchValue.value);
});

// Отслеживание изменений в инпуте с debounce
let timeoutId: NodeJS.Timeout | null = null;
watch(searchValue, (newValue) => {
  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    void fetchWeather(newValue || '');
  }, 500);
});

// Обработка нажатия Enter
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && searchValue.value) {
    void fetchWeather(searchValue.value);
  }
};

// Форматирование времени
const formatTime = (timestamp: number, timezone: number): string => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

// Получение направления ветра
const getWindDirection = (degrees: number) => {
  const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};
</script>

<template>
  <div class="full-width">
    <q-input
      filled
      v-model="searchValue"
      label="Поиск города"
      :dark="themeStore.isDark"
      color="primary"
      :bg-color="themeStore.isDark ? 'grey-9' : 'white'"
      class="q-mt-lg"
      @keypress="handleKeyPress"
      :loading="loading"
      :error="!!error"
      :error-message="error || undefined"
    />

    <!-- Отображение погоды -->
    <div v-if="weatherData" class="q-mt-sm">
      <q-card
        :dark="themeStore.isDark"
        :class="themeStore.isDark ? 'bg-grey-9 shadow-0' : 'bg-white shadow-5'"
        class="q-pa-lg q-mb-lg"
      >
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold">
              {{ weatherData.name }}, {{ weatherData.sys?.country }}
            </div>
            <div class="text-caption text-grey q-mt-xs">
              {{
                new Date(weatherData.dt * 1000).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              }}
            </div>
          </div>
          <q-icon
            v-if="weatherData.weather[0]?.icon"
            :name="getWeatherIcon(weatherData.weather[0].icon)"
            :color="getWeatherIconColor(weatherData.weather[0].icon)"
            size="48px"
          />
        </div>

        <div class="row items-center q-mt-xl">
          <div class="col-auto">
            <div class="text-h1 text-weight-light">{{ Math.round(weatherData.main.temp) }}°</div>
          </div>
          <div class="col q-ml-xl">
            <div class="text-subtitle1 q-mb-xs flex items-center">
              <q-icon name="thermostat" size="20px" class="q-mr-sm" />
              Ощущается как: {{ Math.round(weatherData.main.feels_like) }}°
            </div>
            <div class="text-subtitle1 flex items-center">
              <q-icon
                :name="getWeatherIcon(weatherData.weather[0]?.icon)"
                size="20px"
                class="q-mr-sm"
              />
              {{ capitalizeFirstLetter(weatherData.weather[0]?.description) }}
            </div>
          </div>
        </div>

        <q-separator class="q-my-lg" />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-caption text-grey">Влажность</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="water_drop" size="20px" class="q-mr-sm" color="info" />
              <div class="text-subtitle1 text-weight-medium">{{ weatherData.main.humidity }}%</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-caption text-grey">Давление</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="speed" size="20px" class="q-mr-sm" color="deep-orange" />
              <div class="text-subtitle1 text-weight-medium">
                {{ Math.round(weatherData.main.pressure * 0.75) }} мм рт. ст.
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-caption text-grey">Ветер</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="air" size="20px" class="q-mr-sm" color="teal" />
              <div class="text-subtitle1 text-weight-medium">
                {{ weatherData.wind.speed }} м/с
                <span class="text-caption text-grey q-ml-xs">
                  {{ getWindDirection(weatherData.wind.deg) }}
                </span>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-caption text-grey">Видимость</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="visibility" size="20px" class="q-mr-sm" color="blue-grey" />
              <div class="text-subtitle1 text-weight-medium">
                {{ (weatherData.visibility / 1000).toFixed(1) }} км
              </div>
            </div>
          </div>
        </div>

        <!-- Восход и закат -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-sm-4">
            <div class="text-caption text-grey">Восход</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="wb_sunny" size="20px" class="q-mr-sm" color="warning" />
              <div class="text-subtitle1 text-weight-medium">
                {{ formatTime(weatherData.sys.sunrise, weatherData.timezone) }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="text-caption text-grey">Закат</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="nightlight" size="20px" class="q-mr-sm" color="deep-orange" />
              <div class="text-subtitle1 text-weight-medium">
                {{ formatTime(weatherData.sys.sunset, weatherData.timezone) }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="text-caption text-grey">Мин/Макс</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="thermostat" size="20px" class="q-mr-sm" color="red" />
              <div class="text-subtitle1 text-weight-medium">
                {{ Math.round(weatherData.main.temp_min) }}° /
                {{ Math.round(weatherData.main.temp_max) }}°
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <!-- Состояние загрузки -->
    <div v-else-if="loading" class="q-mt-xl text-center">
      <q-spinner size="50px" color="primary" />
      <div class="q-mt-md text-subtitle1">Загрузка данных...</div>
    </div>

    <!-- Сообщение, если город не найден -->
    <div v-else-if="searchValue && !loading && !weatherData" class="q-mt-xl text-center">
      <q-icon name="location_off" size="48px" color="grey" />
      <div class="q-mt-md text-subtitle1">Город не найден. Попробуйте другой.</div>
    </div>

    <!-- Начальное сообщение -->
    <div v-else-if="!searchValue && !loading" class="q-mt-xl text-center">
      <q-icon name="search" size="48px" color="grey" />
      <div class="q-mt-md text-subtitle1">Введите название города для поиска погоды</div>
    </div>
  </div>
</template>
