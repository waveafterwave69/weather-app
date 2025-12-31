export interface ForecastItem {
  dt: number;
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
  visibility?: number;
  pop: number;
  rain?: {
    '3h': number;
  };
  snow?: {
    '3h': number;
  };
  clouds: {
    all: number;
  };
}

export interface WeeklyForecast {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    timezone: number;
    coord: {
      lat: number;
      lon: number;
    };
  };
}

export interface CurrentWeather {
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
