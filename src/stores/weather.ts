import { defineStore } from 'pinia';
import { weatherService } from 'src/api/weatherApi';
import { onMounted, watch } from 'vue';
import { ref } from 'vue';

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

export const useWeatherStore = defineStore('weather', () => {
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
    // Нормализуем строку: убираем лишние пробелы и приводим к единому формату
    const normalizedCity = city
      .trim() // убираем пробелы в начале и конце
      .replace(/\s+/g, ' ') // заменяем множественные пробелы на один
      .toLowerCase(); // приводим к нижнему регистру для консистентности

    if (!normalizedCity) {
      weatherData.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // Отправляем нормализованное название города
      const result = await weatherService.getCurrentWeather(normalizedCity);
      weatherData.value = result as CurrentWeather;
      // Сохраняем оригинальное название из ответа API
      searchValue.value = result.name;
      console.log('Weather data by city:', result);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Не удалось получить данные о погоде';
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
      const errorMessage =
        err instanceof Error ? err.message : 'Не удалось получить данные о погоде';
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

  return {
    handleKeyPress,
    formatTime,
    getWindDirection,
    searchValue,
    loading,
    error,
    retryLocationDetection,
    locationLoading,
    weatherData,
    userLocation,
    getWeatherIcon,
    getWeatherIconColor,
    capitalizeFirstLetter,
    locationDenied,
    fetchWeatherByCity,
  };
});
