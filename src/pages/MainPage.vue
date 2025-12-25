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
  coord?: {
    lat: number;
    lon: number;
  };
}

interface GeolocationError extends Error {
  code?: number;
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
}

const themeStore = useThemeStore();
const searchValue = ref<string>('');
const weatherData = ref<CurrentWeather | null>(null);
const loading = ref<boolean>(false);
const locationLoading = ref<boolean>(false);
const error = ref<string | null>(null);
const userLocation = ref<{ lat: number; lon: number } | null>(null);
const locationDenied = ref<boolean>(false);
const locationError = ref<string>('');

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

// Функция для получения погоды по названию города
const fetchWeatherByCity = async (city: string): Promise<void> => {
  if (!city.trim()) {
    weatherData.value = null;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result = await weatherService.getCurrentWeather(city);
    weatherData.value = result as CurrentWeather;
    searchValue.value = result.name;
    console.log('Weather data by city:', result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Не удалось получить данные о погоде';
    error.value = errorMessage;
    console.error('Error fetching weather:', err);
    weatherData.value = null;
  } finally {
    loading.value = false;
  }
};

// Функция для получения погоды по координатам
const fetchWeatherByCoords = async (lat: number, lon: number): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    const result = await weatherService.getWeatherByCoords(lat, lon);
    weatherData.value = result as CurrentWeather;
    searchValue.value = `${result.name}`;
    userLocation.value = { lat, lon };
    console.log('Weather data by coords:', result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Не удалось получить данные о погоде';
    error.value = errorMessage;
    console.error('Error fetching weather by coords:', err);
    weatherData.value = null;
  } finally {
    loading.value = false;
  }
};

// Функция для получения текущего местоположения пользователя
const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Геолокация не поддерживается вашим браузером'));
      return;
    }

    console.log('Requesting geolocation...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation success:', position.coords);
        resolve(position);
      },
      (err) => {
        console.error('Geolocation error:', err);
        // Преобразуем GeolocationPositionError в Error объект
        const errorMessage = getGeolocationErrorMessage(err);
        const error = new Error(errorMessage) as GeolocationError;
        error.code = err.code;
        error.PERMISSION_DENIED = 1;
        error.POSITION_UNAVAILABLE = 2;
        error.TIMEOUT = 3;
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
};

// Функция для получения сообщения об ошибке геолокации
const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Доступ к геолокации запрещен. Пожалуйста, разрешите доступ в настройках браузера.';
    case error.POSITION_UNAVAILABLE:
      return 'Информация о местоположении недоступна.';
    case error.TIMEOUT:
      return 'Превышено время ожидания определения местоположения.';
    default:
      return 'Не удалось определить ваше местоположение.';
  }
};

// Автоматическое определение местоположения
const detectUserLocation = async (): Promise<void> => {
  console.log('Starting location detection...');
  locationLoading.value = true;
  locationDenied.value = false;
  locationError.value = '';

  try {
    const position = await getUserLocation();
    const { latitude, longitude } = position.coords;
    const accuracy = position.coords.accuracy;

    console.log(`User location detected: lat=${latitude}, lon=${longitude}, accuracy=${accuracy}m`);

    if (accuracy > 5000) {
      console.warn('Low location accuracy:', accuracy);
    }

    await fetchWeatherByCoords(latitude, longitude);
  } catch (err: unknown) {
    console.error('Error in detectUserLocation:', err);

    if (err instanceof Error) {
      const geolocationErr = err as GeolocationError;
      locationError.value = err.message;

      if (
        geolocationErr.code === geolocationErr.PERMISSION_DENIED ||
        err.message.includes('запрещен') ||
        err.message.includes('permission')
      ) {
        locationDenied.value = true;
        error.value = err.message;
        console.log('Location permission denied');
      } else if (
        geolocationErr.code === geolocationErr.TIMEOUT ||
        err.message.includes('время') ||
        err.message.includes('timeout')
      ) {
        error.value = err.message;
      } else if (
        geolocationErr.code === geolocationErr.POSITION_UNAVAILABLE ||
        err.message.includes('недоступна') ||
        err.message.includes('unavailable')
      ) {
        error.value = err.message;
      } else {
        error.value = err.message || 'Не удалось определить ваше местоположение';
      }
    } else {
      error.value = 'Не удалось определить ваше местоположение';
    }

    // Загружаем погоду для города по умолчанию
    await fetchWeatherByCity('Москва');
  } finally {
    locationLoading.value = false;
  }
};

// Кнопка для повторного запроса местоположения
const retryLocationDetection = async (): Promise<void> => {
  console.log('Retrying location detection...');
  locationDenied.value = false;
  locationError.value = '';
  error.value = null;
  await detectUserLocation();
};

// Загрузка начальных данных
onMounted(() => {
  console.log('Component mounted, starting location detection...');
  // Используем setTimeout для гарантии, что DOM готов
  setTimeout(() => {
    detectUserLocation().catch((err) => {
      console.error('Failed to detect location on mount:', err);
    });
  }, 100);
});

// Отслеживание изменений в инпуте с debounce
let timeoutId: NodeJS.Timeout | null = null;
watch(searchValue, (newValue) => {
  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    if (newValue.trim()) {
      void fetchWeatherByCity(newValue);
    }
  }, 500);
});

// Обработка нажатия Enter
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && searchValue.value) {
    void fetchWeatherByCity(searchValue.value);
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
  <div class="full-width q-pt-xl">
    <!-- Поле поиска с кнопкой определения местоположения -->
    <q-input
      filled
      v-model="searchValue"
      label="Поиск города"
      @keypress="handleKeyPress"
      :loading="loading"
      :error="!!error"
      :error-message="error || undefined"
      :dark="themeStore.isDark"
      :color="themeStore.isDark ? 'primary' : 'primary'"
      :bg-color="themeStore.isDark ? 'bg-surface' : 'bg-surface'"
      :input-style="{
        color: themeStore.isDark ? 'var(--text-primary)' : 'var(--text-primary)',
      }"
      class="q-mb-lg q-mt-xl"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
      <template v-slot:append>
        <q-btn
          flat
          dense
          round
          icon="my_location"
          @click="retryLocationDetection"
          :loading="locationLoading"
          :color="themeStore.isDark ? 'primary' : 'primary'"
          size="sm"
        >
          <q-tooltip>Определить мое местоположение</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <!-- Сообщение об определении местоположения -->
    <div v-if="locationLoading" class="q-mb-md text-center">
      <q-spinner size="24px" color="primary" />
      <div class="q-mt-xs text-caption">Определение вашего местоположения...</div>
      <div class="q-mt-xs text-caption text-grey">Пожалуйста, разрешите доступ к геолокации</div>
    </div>

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
              <q-icon
                v-if="
                  userLocation &&
                  weatherData.coord &&
                  Math.abs(userLocation.lat - weatherData.coord.lat) < 0.1 &&
                  Math.abs(userLocation.lon - weatherData.coord.lon) < 0.1
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
          <div class="col-12 col-sm-3">
            <div class="text-caption text-grey">Восход</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="wb_sunny" size="20px" class="q-mr-sm" color="warning" />
              <div class="text-subtitle1 text-weight-medium">
                {{ formatTime(weatherData.sys.sunrise, weatherData.timezone) }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-3">
            <div class="text-caption text-grey">Закат</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="nightlight" size="20px" class="q-mr-sm" color="deep-orange" />
              <div class="text-subtitle1 text-weight-medium">
                {{ formatTime(weatherData.sys.sunset, weatherData.timezone) }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-3">
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

    <!-- Сообщение, если доступ к геолокации запрещен -->
    <div v-if="locationDenied && !weatherData" class="q-mt-xl text-center">
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
        @click="retryLocationDetection"
        class="q-mt-md"
        icon="my_location"
      />
      <q-btn
        color="secondary"
        label="Использовать Москву"
        @click="fetchWeatherByCity('Москва')"
        class="q-mt-md q-ml-sm"
        flat
      />
    </div>

    <!-- Сообщение, если город не найден -->
    <div
      v-else-if="searchValue && !loading && !weatherData && !locationDenied"
      class="q-mt-xl text-center"
    >
      <q-icon name="location_off" size="48px" color="grey" />
      <div class="q-mt-md text-subtitle1">Город не найден. Попробуйте другой.</div>
    </div>

    <!-- Начальное сообщение -->
    <div v-else-if="!searchValue && !loading && !locationDenied" class="q-mt-xl text-center">
      <q-icon name="search" size="48px" color="grey" />
      <div class="q-mt-md text-subtitle1">Определяем ваше местоположение...</div>
      <div class="q-mt-sm text-body2 text-grey">Или введите город вручную</div>
    </div>
  </div>
</template>
