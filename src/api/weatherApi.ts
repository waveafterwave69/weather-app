import axios from 'axios';

const API_KEY = '1da99e1fbd82a86f501df9837d5c6096';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const weatherApi = axios.create({
  baseURL: BASE_URL,
});

export const weatherService = {
  async getCurrentWeather(city: string) {
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

  async getWeatherByCoords(lat: number, lon: number) {
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
};
