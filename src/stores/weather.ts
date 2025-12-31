import { defineStore } from 'pinia';
import { weatherService } from 'src/api/weatherApi';
import type { CurrentWeather, ForecastItem, WeeklyForecast } from 'src/types';
import { onMounted, watch } from 'vue';
import { ref } from 'vue';

interface GeolocationError extends Error {
  code?: number;
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
}

export const useWeatherStore = defineStore('weather', () => {
  const searchValue = ref<string>('');
  const weatherData = ref<CurrentWeather | null>(null);
  const forecastData = ref<WeeklyForecast | null>(null);
  const loading = ref<boolean>(false);
  const locationLoading = ref<boolean>(false);
  const forecastLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const forecastError = ref<string | null>(null);
  const userLocation = ref<{ lat: number; lon: number } | null>(null);
  const locationDenied = ref<boolean>(false);
  const locationError = ref<string>('');

  // Флаг для отслеживания первой загрузки
  const isInitialLoad = ref<boolean>(true);

  // Функция для получения иконки погоды
  const getWeatherIcon = (iconCode?: string): string => {
    if (!iconCode) return 'help_outline';

    const iconMap: Record<string, string> = {
      '01d': 'wb_sunny',
      '01n': 'brightness_3',
      '02d': 'partly_cloudy_day',
      '02n': 'partly_cloudy_night',
      '03d': 'cloud',
      '03n': 'cloud',
      '04d': 'cloud_queue',
      '04n': 'cloud_queue',
      '09d': 'grain',
      '09n': 'grain',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'thunderstorm',
      '11n': 'thunderstorm',
      '13d': 'ac_unit',
      '13n': 'ac_unit',
      '50d': 'foggy',
      '50n': 'foggy',
    };

    return iconMap[iconCode] || 'help_outline';
  };

  // Функция для получения цвета иконки в зависимости от погоды
  const getWeatherIconColor = (iconCode?: string): string => {
    if (!iconCode) return 'grey';

    if (iconCode.includes('01') || iconCode.includes('02')) {
      return 'warning';
    } else if (iconCode.includes('03') || iconCode.includes('04')) {
      return 'grey-6';
    } else if (iconCode.includes('09') || iconCode.includes('10')) {
      return 'info';
    } else if (iconCode.includes('11')) {
      return 'deep-purple';
    } else if (iconCode.includes('13')) {
      return 'blue-grey';
    } else {
      return 'grey';
    }
  };

  // Функция для преобразования первой буквы в заглавную
  const capitalizeFirstLetter = (str?: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Функция для получения прогноза на неделю
  const fetchWeeklyForecast = async (city: string): Promise<void> => {
    const normalizedCity = city.trim().replace(/\s+/g, ' ').toLowerCase();

    if (!normalizedCity) {
      forecastData.value = null;
      forecastLoading.value = false;
      return;
    }

    forecastLoading.value = true;
    forecastError.value = null;
    forecastData.value = null; // Сбрасываем старые данные

    try {
      const result = await weatherService.getWeeklyForecast(normalizedCity);
      forecastData.value = result;
      console.log('Weekly forecast data:', result);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Не удалось получить прогноз погоды';
      forecastError.value = errorMessage;
      console.error('Error fetching forecast:', err);
      forecastData.value = null;
    } finally {
      forecastLoading.value = false;
    }
  };

  // Функция для получения прогноза по координатам
  const fetchForecastByCoords = async (lat: number, lon: number): Promise<void> => {
    forecastLoading.value = true;
    forecastError.value = null;
    forecastData.value = null; // Сбрасываем старые данные

    try {
      const result = await weatherService.getForecastByCoords(lat, lon);
      forecastData.value = result;
      console.log('Forecast data by coords:', result);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Не удалось получить прогноз погоды';
      forecastError.value = errorMessage;
      console.error('Error fetching forecast by coords:', err);
      forecastData.value = null;
    } finally {
      forecastLoading.value = false;
    }
  };

  // Функция для получения погоды по названию города
  const fetchWeatherByCity = async (city: string): Promise<void> => {
    const normalizedCity = city.trim().replace(/\s+/g, ' ').toLowerCase();

    if (!normalizedCity) {
      weatherData.value = null;
      forecastData.value = null;
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = null;
    weatherData.value = null; // Сбрасываем старые данные

    try {
      const result = await weatherService.getCurrentWeather(normalizedCity);
      weatherData.value = result;
      searchValue.value = result.name;

      console.log('Weather data by city:', result);

      // Загружаем прогноз для того же города
      await fetchWeeklyForecast(normalizedCity);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Не удалось получить данные о погоде';
      error.value = errorMessage;
      console.error('Error fetching weather:', err);
      weatherData.value = null;
      forecastData.value = null; // Сбрасываем прогноз при ошибке
    } finally {
      loading.value = false;
    }
  };

  // Функция для получения погоды по координатам
  const fetchWeatherByCoords = async (lat: number, lon: number): Promise<void> => {
    loading.value = true;
    error.value = null;
    weatherData.value = null; // Сбрасываем старые данные

    try {
      const result = await weatherService.getWeatherByCoords(lat, lon);
      weatherData.value = result;
      searchValue.value = `${result.name}`;
      userLocation.value = { lat, lon };

      console.log('Weather data by coords:', result);

      // Загружаем прогноз по координатам
      await fetchForecastByCoords(lat, lon);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Не удалось получить данные о погоде';
      error.value = errorMessage;
      console.error('Error fetching weather by coords:', err);
      weatherData.value = null;
      forecastData.value = null; // Сбрасываем прогноз при ошибке
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
          timeout: 5000,
          maximumAge: 300000,
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
    error.value = null;

    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      const accuracy = position.coords.accuracy;

      console.log(
        `User location detected: lat=${latitude}, lon=${longitude}, accuracy=${accuracy}m`,
      );

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

          // При отказе в геолокации загружаем погоду для города по умолчанию
          // только при первой загрузке
          if (isInitialLoad.value) {
            await fetchWeatherByCity('Москва');
          }
        } else {
          error.value = err.message || 'Не удалось определить ваше местоположение';
          if (isInitialLoad.value) {
            await fetchWeatherByCity('Москва');
          }
        }
      } else {
        error.value = 'Не удалось определить ваше местоположение';
        if (isInitialLoad.value) {
          await fetchWeatherByCity('Москва');
        }
      }
    } finally {
      locationLoading.value = false;
      isInitialLoad.value = false; // Сбрасываем флаг после первой загрузки
    }
  };

  // Кнопка для повторного запроса местоположения
  const retryLocationDetection = async (): Promise<void> => {
    console.log('Retrying location detection...');
    locationDenied.value = false;
    locationError.value = '';
    error.value = null;
    isInitialLoad.value = false; // Уже не первая загрузка
    await detectUserLocation();
  };

  // Загрузка начальных данных (только при монтировании)
  onMounted(() => {
    console.log('Component mounted, starting location detection...');
    setTimeout(() => {
      detectUserLocation().catch((err) => {
        console.error('Failed to detect location on mount:', err);
        locationLoading.value = false; // Гарантируем сброс флага загрузки
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
      } else {
        // Если поле пустое, сбрасываем данные
        weatherData.value = null;
        forecastData.value = null;
        error.value = null;
        forecastError.value = null;
      }
    }, 800);
  });

  // Обработка нажатия Enter
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && searchValue.value.trim()) {
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

  // Функция для группировки прогноза по дням
  const getDailyForecast = (): ForecastItem[] => {
    if (!forecastData.value || !forecastData.value.list) return [];

    const dailyForecast: ForecastItem[] = [];
    const seenDays = new Set<string>();

    forecastData.value.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
      });

      // Берем только один прогноз на день (обычно дневной)
      if (!seenDays.has(dayKey) && date.getHours() >= 12 && date.getHours() <= 15) {
        seenDays.add(dayKey);
        dailyForecast.push(item);
      }
    });

    // Возвращаем максимум 7 дней
    return dailyForecast.slice(0, 7);
  };

  // Получение почасового прогноза на сегодня
  const getHourlyForecast = (): ForecastItem[] => {
    if (!forecastData.value) return [];

    const today = new Date().getDate();
    return forecastData.value.list
      .filter((item) => new Date(item.dt * 1000).getDate() === today)
      .slice(0, 8);
  };

  return {
    // Основные данные
    searchValue,
    weatherData,
    forecastData,
    userLocation,

    // Состояния загрузки
    loading,
    locationLoading,
    forecastLoading,

    // Ошибки
    error,
    forecastError,
    locationError,
    locationDenied,

    // Методы
    handleKeyPress,
    formatTime,
    getWindDirection,
    retryLocationDetection,
    getWeatherIcon,
    getWeatherIconColor,
    capitalizeFirstLetter,
    fetchWeatherByCity,
    fetchWeatherByCoords,
    fetchWeeklyForecast,
    fetchForecastByCoords,
    getDailyForecast,
    getHourlyForecast,
  };
});
