import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './WeatherForecast.css';

const WeatherForecast = ({ forecast, unit, convertTemp }) => {
  const { isDarkMode } = useTheme();

  if (!forecast?.list) return null;

  // Функция для группировки по дням
  const groupByDay = (forecastList) => {
    const days = {};
    const now = new Date();
    const currentDay = now.getDate();

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.getDate();
      
      // Пропускаем прошедшие часы текущего дня
      if (day === currentDay && date < now) return;
      
      const dayKey = date.toLocaleDateString('ru-RU', { weekday: 'long', month: 'short', day: 'numeric' });

      if (!days[dayKey]) {
        days[dayKey] = {
          date: date,
          items: [],
          minTemp: Infinity,
          maxTemp: -Infinity,
          mainWeather: {}
        };
      }

      const temp = item.main.temp;
      days[dayKey].items.push(item);
      days[dayKey].minTemp = Math.min(days[dayKey].minTemp, temp);
      days[dayKey].maxTemp = Math.max(days[dayKey].maxTemp, temp);

      // Определяем преобладающую погоду за день
      if (!days[dayKey].mainWeather[item.weather[0].main]) {
        days[dayKey].mainWeather[item.weather[0].main] = 0;
      }
      days[dayKey].mainWeather[item.weather[0].main]++;
    });

    return days;
  };

  // Получаем сгруппированные дни
  const dailyForecast = groupByDay(forecast.list);

  // Определяем преобладающую погоду для дня
  const getMainWeather = (dayData) => {
    let maxCount = 0;
    let mainWeather = '';
    
    Object.entries(dayData.mainWeather).forEach(([weather, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mainWeather = weather;
      }
    });
    
    return mainWeather.toLowerCase();
  };

  // Получаем иконку для преобладающей погоды
  const getWeatherIcon = (dayData) => {
    const mainWeather = getMainWeather(dayData);
    const weatherItem = dayData.items.find(item => 
      item.weather[0].main.toLowerCase() === mainWeather
    );
    return weatherItem ? weatherItem.weather[0].icon : '01d';
  };

  // Формируем массив из 5 следующих дней
  const forecastDays = Object.entries(dailyForecast)
    .sort((a, b) => a[1].date - b[1].date)
    .slice(0, 5);

  return (
    <div className={`forecast-container ${isDarkMode ? 'dark' : 'light'}`}>
      <h3>Прогноз на 5 дней</h3>
      <div className="forecast-days">
        {forecastDays.map(([dayName, dayData]) => {
          const weatherType = getMainWeather(dayData);
          const weatherIcon = getWeatherIcon(dayData);

          return (
            <div 
              key={dayName} 
              className={`forecast-day ${weatherType}`}
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #1e1e1e, #2d2d2d)'
                  : 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
              }}
            >
              <div className="forecast-day-header">
                <h4>{dayName.split(',')[0]}</h4>
                <span>{dayName.split(',')[1]}</span>
              </div>
              
              <div className="temperature-range">
                <span className="max-temp">{convertTemp(dayData.maxTemp)}°{unit}</span>
                <span>/</span>
                <span className="min-temp">{convertTemp(dayData.minTemp)}°{unit}</span>
              </div>
              
              <div className="weather-icon">
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherIcon}.png`} 
                  alt={weatherType}
                />
              </div>
              
              <div className="hourly-forecast">
                {dayData.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="hourly-item">
                    <span>
                      {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit' })}
                    </span>
                    <span>{convertTemp(item.main.temp)}°</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherForecast;