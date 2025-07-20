import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './HourlyForecast.css';

const HourlyForecast = ({ hourlyData, unit, convertTemp }) => {
  const { isDarkMode } = useTheme();
  const scrollRef = useRef(null);
  const [expandedHour, setExpandedHour] = useState(null);
  const [currentTime] = useState(new Date());

  // Автопрокрутка к текущему часу
  useEffect(() => {
    if (hourlyData?.length > 0 && scrollRef.current) {
      const now = currentTime.getHours();
      const currentIndex = hourlyData.findIndex(h => 
        parseInt(h.time.split(':')[0]) >= now
      );
      
      if (currentIndex > 0) {
        scrollRef.current.scrollTo({
          left: (currentIndex - 1) * 70,
          behavior: 'smooth'
        });
      }
    }
  }, [hourlyData, currentTime]);

  // Функция для получения дня недели и даты
  const getDayInfo = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className={`hourly-forecast-wrapper ${isDarkMode ? 'dark' : 'light'}`}>
        <h3 className="section-title">Почасовой прогноз</h3>
        <p className="data-loading">Данные загружаются...</p>
      </div>
    );
  }

  return (
    <div className={`hourly-forecast-wrapper ${isDarkMode ? 'dark' : 'light'}`}>
      <h3 className="section-title">Почасовой прогноз</h3>
      
      <div className="hourly-items-container" ref={scrollRef}>
        {hourlyData.map((hour, index) => {
          const hourNumber = parseInt(hour.time.split(':')[0]);
          const isCurrent = index === 0 && hourNumber === currentTime.getHours();
          const dayInfo = getDayInfo(hour.dt);
          
          return (
            <div 
              key={`${hour.time}-${index}`}
              className={`hour-item ${isCurrent ? 'current-hour' : ''} ${expandedHour === index ? 'expanded' : ''}`}
              onClick={() => setExpandedHour(expandedHour === index ? null : index)}
            >
              <div className="hour-header">
                <span className="hour-day">{dayInfo.split(',')[0]}</span>
                <span className="hour-time">{hour.time.split(':')[0]}</span>
              </div>
              
              <span className="hour-temp">{convertTemp(hour.temp)}°{unit}</span>
              
              <img
                src={`https://openweathermap.org/img/wn/${hour.icon}.png`}
                alt={hour.condition}
                className="weather-icon"
                loading="lazy"
              />
              
              {expandedHour === index && (
                <div className={`hour-details ${isDarkMode ? 'dark' : ''}`}>
                  <div className="detail-row">
                    <span>Ощущается:</span>
                    <span>{convertTemp(hour.feels_like)}°</span>
                  </div>
                  <div className="detail-row">
                    <span>Ветер:</span>
                    <span>{hour.windSpeed} м/с</span>
                  </div>
                  <div className="detail-row">
                    <span>Влажность:</span>
                    <span>{hour.humidity}%</span>
                  </div>
                  {hour.pop > 0 && (
                    <div className="detail-row">
                      <span>Осадки:</span>
                      <span>{Math.round(hour.pop * 100)}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(HourlyForecast);