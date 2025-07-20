import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './WeatherCard.css';

const WeatherCard = ({ weatherData, unit, convertTemp }) => {
  const { isDarkMode } = useTheme();

  if (!weatherData) return <div className="loading-message">Загрузка данных...</div>;

  // Функция для получения дня недели
  const getDayOfWeek = () => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const date = new Date(weatherData.dt * 1000);
    return days[date.getDay()];
  };

  // Функция для направления ветра
  const getWindDirection = (degrees) => {
    if (!degrees) return '';
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(degrees / 45) % 8];
  };

  return (
    <div className={`weather-card ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="weather-main">
        <div className="location-info">
          <h2>{weatherData.name}, {weatherData.sys.country}</h2>
          <p className="day-of-week">{getDayOfWeek()}</p>
        </div>
        
        <div className="temperature-block">
          <div className="current-weather">
            <img 
              src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`} 
              alt={weatherData.weather[0].description}
              className="weather-icon"
            />
            <span className="temperature">{convertTemp(weatherData.main.temp)}°{unit}</span>
          </div>
          <p className="weather-description">{weatherData.weather[0].description}</p>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Ощущается как:</span>
            <span className="detail-value">{convertTemp(weatherData.main.feels_like)}°{unit}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Влажность:</span>
            <span className="detail-value">{weatherData.main.humidity}%</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Ветер:</span>
            <span className="detail-value">
              {Math.round(weatherData.wind.speed)} м/с {getWindDirection(weatherData.wind.deg)}
            </span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Давление:</span>
            <span className="detail-value">{Math.round(weatherData.main.pressure * 0.75)} мм рт.ст.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;