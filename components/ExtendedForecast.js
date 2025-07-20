import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ExtendedForecast = ({ weatherData, airQuality, uvIndex, forecast }) => {
  const { isDarkMode } = useTheme();

  if (!weatherData || !weatherData.sys) return null;

  // Форматирование времени
  const formatTime = (timestamp) => {
    if (!timestamp && timestamp !== 0) return '--:--';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Направление ветра
  const getWindDirection = (degrees) => {
    if (degrees === undefined || degrees === null) return 'N/A';
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(degrees / 45) % 8];
  };

  // Индекс комфорта
  const getComfortIndex = (temp, humidity) => {
    if (temp === undefined || humidity === undefined) return 'N/A';
    if (temp > 27 && humidity > 70) return 'Душно';
    if (temp > 30 && humidity > 50) return 'Очень жарко';
    if (temp < 10 && humidity > 80) return 'Очень холодно';
    if (temp >= 18 && temp <= 25 && humidity <= 60) return 'Комфортно';
    return 'Нормально';
  };

  // Качество воздуха
  const getAirQualityText = (aqi) => {
    if (aqi === undefined) return 'N/A';
    const levels = [
      'Отличное',
      'Хорошее',
      'Удовлетворительное',
      'Неблагоприятное',
      'Очень плохое',
      'Опасное'
    ];
    return levels[aqi - 1] || 'N/A';
  };

  // Уровень УФ-индекса
  const getUVIndexLevel = (value) => {
    if (value === undefined) return 'N/A';
    if (value >= 8) return 'Очень высокий';
    if (value >= 6) return 'Высокий';
    if (value >= 3) return 'Умеренный';
    return 'Низкий';
  };

  return (
    <div className={`extended-forecast ${isDarkMode ? 'dark' : 'light'}`}>
      <h3>Дополнительные данные</h3>
      <div className="extended-grid">
        {/* Восход солнца */}
        <div className="extended-card sunrise">
          <div className="extended-card-header">
            <span className="extended-icon">🌅</span>
            <span>Восход</span>
          </div>
          <p>{formatTime(weatherData.sys.sunrise)}</p>
          <small>Утренние часы</small>
        </div>

        {/* Закат солнца */}
        <div className="extended-card sunset">
          <div className="extended-card-header">
            <span className="extended-icon">🌇</span>
            <span>Закат</span>
          </div>
          <p>{formatTime(weatherData.sys.sunset)}</p>
          <small>Вечерние часы</small>
        </div>

        {/* Ощущаемая температура */}
        <div className="extended-card feels-like">
          <div className="extended-card-header">
            <span className="extended-icon">🌡️</span>
            <span>Ощущается</span>
          </div>
          <p>{Math.round(weatherData.main.feels_like)}°C</p>
          <small>
            {weatherData.main.feels_like > weatherData.main.temp 
              ? 'Теплее чем есть' 
              : 'Холоднее чем есть'}
          </small>
        </div>

        {/* Направление ветра */}
        <div className="extended-card wind-direction">
          <div className="extended-card-header">
            <span className="extended-icon">🧭</span>
            <span>Ветер</span>
          </div>
          <p>{getWindDirection(weatherData.wind.deg)}</p>
          <small>{Math.round(weatherData.wind.speed)} м/с</small>
        </div>

        {/* Индекс комфорта */}
        <div className="extended-card comfort">
          <div className="extended-card-header">
            <span className="extended-icon">😊</span>
            <span>Комфорт</span>
          </div>
          <p>
            {getComfortIndex(
              weatherData.main.temp,
              weatherData.main.humidity
            )}
          </p>
          <small>
            {weatherData.main.temp}°C, {weatherData.main.humidity}%
          </small>
        </div>

        {/* Качество воздуха */}
        <div className="extended-card air-quality">
          <div className="extended-card-header">
            <span className="extended-icon">🍃</span>
            <span>Качество воздуха</span>
          </div>
          {airQuality ? (
            <>
              <p>{getAirQualityText(airQuality.list[0]?.main?.aqi)}</p>
              <small>Индекс AQI: {airQuality.list[0]?.main?.aqi || 'N/A'}</small>
            </>
          ) : (
            <p className="no-data">Нет данных</p>
          )}
        </div>

        {/* УФ-индекс */}
        <div className="extended-card uv-index">
          <div className="extended-card-header">
            <span className="extended-icon">☀️</span>
            <span>УФ-индекс</span>
          </div>
          {uvIndex ? (
            <>
              <p>{uvIndex.value?.toFixed(1) || 'N/A'}</p>
              <small>{getUVIndexLevel(uvIndex.value)}</small>
            </>
          ) : (
            <p className="no-data">Нет данных</p>
          )}
        </div>

        {/* Вероятность осадков */}
        <div className="extended-card precipitation">
          <div className="extended-card-header">
            <span className="extended-icon">🌧️</span>
            <span>Осадки</span>
          </div>
          {forecast?.list?.[0]?.pop !== undefined ? (
            <>
              <p>{Math.round(forecast.list[0].pop * 100)}%</p>
              <small>Вероятность</small>
            </>
          ) : (
            <p className="no-data">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtendedForecast;