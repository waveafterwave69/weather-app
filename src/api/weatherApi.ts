import axios from 'axios';
import type { CurrentWeather, WeeklyForecast } from 'src/types';

const API_KEY = '1da99e1fbd82a86f501df9837d5c6096';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const weatherApi = axios.create({
  baseURL: BASE_URL,
});

export const weatherService = {
  async getCurrentWeather(city: string): Promise<CurrentWeather> {
    try {
      const response = await weatherApi.get('/weather', {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          lang: 'ru',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Город не найден');
        }
        if (error.response?.status === 401) {
          throw new Error('Неверный API ключ');
        }
        if (error.response?.status === 429) {
          throw new Error('Превышен лимит запросов. Попробуйте позже');
        }
      }

      if (error instanceof Error) {
        throw new Error(`Ошибка сети: ${error.message}`);
      }
      throw new Error('Неизвестная ошибка');
    }
  },

  async getWeatherByCoords(lat: number, lon: number): Promise<CurrentWeather> {
    try {
      const response = await weatherApi.get('/weather', {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'ru',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Неверные координаты');
        }
      }

      throw new Error('Не удалось получить данные о погоде');
    }
  },

  async getWeeklyForecast(city: string): Promise<WeeklyForecast> {
    try {
      const response = await weatherApi.get('/forecast', {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          lang: 'ru',
          cnt: 40,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Город не найден. Проверьте правильность написания.');
        }
      }
      throw new Error('Не удалось получить прогноз погоды.');
    }
  },

  async getForecastByCoords(lat: number, lon: number): Promise<WeeklyForecast> {
    try {
      const response = await weatherApi.get('/forecast', {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'ru',
          cnt: 40,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Неверные координаты');
        }
      }
      throw new Error('Не удалось получить прогноз погоды по координатам.');
    }
  },
};
