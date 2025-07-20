import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import WeatherCard from './components/WeatherCard';
import HourlyForecast from './components/HourlyForecast';
import WeatherForecast from './components/WeatherForecast';
import ExtendedForecast from './components/ExtendedForecast';
import WeatherMap from './components/WeatherMap';
import SearchHistory from './components/SearchHistory';
import ThemeToggle from './components/ThemeToggle';
import TemperatureToggle from './components/TemperatureToggle';
import AnimatedBackground from './components/AnimatedBackground';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

const WEATHER_ALERTS = {
  cityChange: { emoji: '📍', color: 'var(--cyan)' },
  rain: { emoji: '🌧️', color: 'var(--light-blue)', threshold: 0.1 },
  snow: { emoji: '❄️', color: 'var(--white)', threshold: 0 },
  thunderstorm: { emoji: '⚡', color: 'var(--bright-pink)' },
  clear: { emoji: '☀️', color: 'var(--orange)' },
  clouds: { emoji: '☁️', color: 'var(--medium-gray)' },
  extremeHeat: { emoji: '🥵', color: 'var(--orange)', threshold: 30 },
  extremeCold: { emoji: '🥶', color: 'var(--cyan)', threshold: -10 },
  strongWind: { emoji: '💨', color: 'var(--dark-blue)', threshold: 10 },
  error: { emoji: '⚠️', color: 'var(--bright-pink)' }
};

const AppContent = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [unit, setUnit] = useState('C');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { isDarkMode } = useTheme();
  const notificationShown = useRef(new Set());

  const getWeatherType = useCallback(() => {
    if (!weatherData?.weather?.[0]) return 'default';
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    return ['thunderstorm', 'drizzle', 'rain', 'snow', 'clear', 'clouds'].includes(weatherMain)
      ? weatherMain
      : 'default';
  }, [weatherData]);

  const showAlert = (type, message, customTitle) => {
    const alert = WEATHER_ALERTS[type];
    if (!alert || notificationShown.current.has(type)) return;

    notificationShown.current.add(type);
    toast(
      <div className="weather-alert">
        <span className="alert-emoji" style={{ color: alert.color }}>{alert.emoji}</span>
        <div className="alert-content">
          <h4>{customTitle || type === 'cityChange' ? 'Город изменен' : 'Погодное уведомление'}</h4>
          <p>{message}</p>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? 'dark' : 'light',
        className: `alert-${type}`,
        style: { borderLeft: `4px solid ${alert.color}` }
      }
    );
  };

  const analyzeWeather = useCallback((data) => {
    if (!data) return;
    const weather = data.weather[0].main.toLowerCase();
    const temp = data.main.temp;
    const windSpeed = data.wind.speed;

    if (['rain', 'snow', 'thunderstorm', 'clear', 'clouds'].includes(weather)) {
      showAlert(weather, WEATHER_ALERTS[weather].emoji + ' ' + data.weather[0].description);
    }

    if (temp >= WEATHER_ALERTS.extremeHeat.threshold) {
      showAlert('extremeHeat', `Температура ${Math.round(temp)}°C! Оставайтесь в тени`);
    } else if (temp <= WEATHER_ALERTS.extremeCold.threshold) {
      showAlert('extremeCold', `${Math.round(temp)}°C. Оденьтесь теплее!`);
    }

    if (windSpeed >= WEATHER_ALERTS.strongWind.threshold) {
      showAlert('strongWind', `Ветер ${Math.round(windSpeed)} м/с. Будьте осторожны!`);
    }
  }, []);

  const processHourlyData = (hourlyData) => {
    if (!hourlyData?.list) return [];
    const now = new Date();
    const currentHour = now.getHours();

    return hourlyData.list.slice(0, 24).map((item, index) => {
      const hour = new Date(item.dt * 1000).getHours();
      const isCurrent = hour === currentHour && index === 0;
      return {
        time: hour + ':00',
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        icon: item.weather[0].icon,
        condition: item.weather[0].main,
        windSpeed: Math.round(item.wind.speed),
        wind_deg: item.wind.deg,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        pop: item.pop || 0,
        dt: item.dt,
        isCurrent
      };
    });
  };

  const fetchAllWeatherData = async (cityName, lat, lon) => {
    try {
      const urls = [
        cityName
          ? `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=ru`
          : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`,
        cityName
          ? `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=ru`
          : `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`,
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat || weatherData?.coord.lat}&lon=${lon || weatherData?.coord.lon}&appid=${API_KEY}`,
        `https://api.openweathermap.org/data/2.5/uvi?lat=${lat || weatherData?.coord.lat}&lon=${lon || weatherData?.coord.lon}&appid=${API_KEY}`,
        cityName
          ? `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=ru`
          : `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
      ];

      const responses = await Promise.all(urls.map(url => fetch(url)));
      if (!responses[0].ok) throw new Error('Город не найден');

      const data = await Promise.all(responses.map(res => res.json()));
      return {
        weather: data[0],
        forecast: data[1],
        airQuality: data[2],
        uvIndex: data[3],
        hourly: processHourlyData(data[1]),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Ошибка получения данных:', error);
      throw error;
    }
  };

  const fetchWeather = async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    setError(null);
    notificationShown.current.clear();

    try {
      const data = await fetchAllWeatherData(cityName);
      setWeatherData(data.weather);
      setHourlyForecast(data.hourly);
      setForecast(data.forecast);
      updateHistory(cityName);
      showAlert('cityChange', `Теперь показываем погоду для ${cityName}`);
      analyzeWeather(data.weather);
      setAirQuality(data.airQuality);
      setUvIndex(data.uvIndex);
    } catch (err) {
      setError(err.message);
      showAlert('error', 'Не удалось загрузить данные о погоде');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllWeatherData(null, lat, lon);
      setWeatherData(data.weather);
      setCity(data.weather.name);
      setHourlyForecast(data.hourly);
      setForecast(data.forecast);
      updateHistory(data.weather.name);
      analyzeWeather(data.weather);
      setAirQuality(data.airQuality);
      setUvIndex(data.uvIndex);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateHistory = (cityName) => {
    const newHistory = [cityName, ...history.filter(item => item !== cityName)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
  };

  const fetchCitySuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Ошибка при загрузке подсказок:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const handleHistorySelect = (cityName) => {
    setCity(cityName);
    fetchWeather(cityName);
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    setShowSuggestions(false);
    fetchWeather(suggestion.name);
  };

  const toggleUnit = () => {
    setUnit(unit === 'C' ? 'F' : 'C');
  };

  const convertTemp = useCallback((temp) => {
    return unit === 'F' ? Math.round((temp * 9/5) + 32) : Math.round(temp);
  }, [unit]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.log("Геолокация недоступна:", err.message);
          if (savedHistory && JSON.parse(savedHistory).length > 0) {
            fetchWeather(JSON.parse(savedHistory)[0]);
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (city.trim().length > 1) {
        fetchCitySuggestions(city);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      <AnimatedBackground weatherType={getWeatherType()} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
        toastClassName="weather-toast"
      />

      <nav className="navbar">
        <div className="navbar-left">
          <h1 className="navbar-title">Прогноз погоды</h1>
        </div>
        <div className="navbar-center">
          <form onSubmit={handleSubmit} className="navbar-search">
            <div className="search-container">
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Введите город"
                aria-label="Поиск города"
              />
              {showSuggestions && (
                <ul className="suggestions-list">
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <li
                        key={`${item.lat}-${item.lon}`}
                        onClick={() => handleSuggestionClick(item)}
                        tabIndex="0"
                      >
                        {item.name}, {item.country}
                      </li>
                    ))
                  ) : city.length > 1 && (
                    <li className="no-results">Ничего не найдено</li>
                  )}
                </ul>
              )}
            </div>
            <button type="submit">Поиск</button>
          </form>
        </div>
        <div className="navbar-right">
          <TemperatureToggle unit={unit} onToggle={toggleUnit} />
          <ThemeToggle />
        </div>
      </nav>

      <div className="app-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p className="loading-message">Загрузка данных...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => fetchWeather(city)} className="retry-button">
              Повторить попытку
            </button>
          </div>
        )}

        {weatherData && (
          <>
            <WeatherCard
              weatherData={weatherData}
              unit={unit}
              convertTemp={convertTemp}
            />
            <HourlyForecast
              hourlyData={hourlyForecast}
              unit={unit}
              convertTemp={convertTemp}
            />
            <WeatherForecast
              forecast={forecast}
              unit={unit}
              convertTemp={convertTemp}
            />
            <ExtendedForecast
              weatherData={weatherData}
              airQuality={airQuality}
              uvIndex={uvIndex}
              forecast={forecast}
            />
            <WeatherMap
              city={{
                name: weatherData.name,
                lat: weatherData.coord.lat,
                lon: weatherData.coord.lon
              }}
            />
          </>
        )}

        <SearchHistory
          history={history}
          onSelect={handleHistorySelect}
        />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;