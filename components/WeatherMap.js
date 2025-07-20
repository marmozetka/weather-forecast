import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './WeatherMap.css';

const WeatherMap = ({ city }) => {
  const { isDarkMode, isTransitioning } = useTheme();
  const [mapType, setMapType] = useState('temp');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Для принудительного ререндера iframe

  // Конфигурация карт с иконками и цветами
  const mapConfig = {
    temp: {
      label: 'Температура',
      overlay: 'temp',
      icon: '🌡️',
      color: isDarkMode ? '#ff6b6b' : '#e03131'
    },
    wind: {
      label: 'Ветер',
      overlay: 'wind',
      icon: '🌬️',
      color: isDarkMode ? '#74b816' : '#37b24d'
    },
    precip: {
      label: 'Осадки',
      overlay: 'rain',
      icon: '🌧️',
      color: isDarkMode ? '#4dabf7' : '#1c7ed6'
    },
    clouds: {
      label: 'Облака',
      overlay: 'clouds',
      icon: '☁️',
      color: isDarkMode ? '#adb5bd' : '#868e96'
    },
    pressure: {
      label: 'Давление',
      overlay: 'pressure',
      icon: '⏱️',
      color: isDarkMode ? '#f783ac' : '#e64980'
    }
  };

  // Генерация URL для Windy с учетом темы
  const getMapUrl = () => {
    const baseUrl = 'https://embed.windy.com/embed2.html';
    const params = {
      lat: city?.lat || 55.7558,
      lon: city?.lon || 37.6176,
      zoom: city ? 8 : 5,
      level: 'surface',
      overlay: mapConfig[mapType].overlay,
      menu: 'false',
      message: 'true',
      marker: city ? 'true' : 'false',
      pressure: 'false',
      type: 'map',
      location: 'coordinates',
      metricWind: 'default',
      metricTemp: 'default',
      detail: 'true',
      detailLat: city?.lat || 55.7558,
      detailLon: city?.lon || 37.6176,
      theme: isDarkMode ? 'dark' : 'light'
    };

    return `${baseUrl}?${new URLSearchParams(params)}`;
  };

  // Регенерация iframe при изменении темы
  useEffect(() => {
    setMapKey(prevKey => prevKey + 1);
  }, [isDarkMode]);

  // Плавная загрузка карты
  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  // Смена типа карты с анимацией
  const handleMapTypeChange = (type) => {
    if (mapType !== type && !isTransitioning) {
      setMapLoaded(false);
      setMapType(type);
    }
  };

  return (
    <div className={`weather-map-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="weather-map-header">
        <h3>
          {city ? `Синоптическая карта (${city.name})` : 'Глобальная карта погоды'}
        </h3>
        
        <div className="map-controls">
          {Object.entries(mapConfig).map(([key, { label, icon, color }]) => (
            <button
              key={key}
              className={`map-control-btn ${mapType === key ? 'active' : ''}`}
              onClick={() => handleMapTypeChange(key)}
              aria-label={label}
              style={{
                '--btn-color': color,
                '--btn-active-bg': isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <span className="map-btn-icon">{icon}</span>
              <span className="map-btn-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`map-container ${mapLoaded ? 'loaded' : 'loading'}`}>
        <iframe
          key={mapKey}
          title={`Погодная карта: ${mapConfig[mapType].label}`}
          src={getMapUrl()}
          frameBorder="0"
          allow="geolocation"
          allowFullScreen
          loading="lazy"
          onLoad={handleMapLoad}
          style={{ opacity: mapLoaded ? 1 : 0 }}
        />
        
        {!mapLoaded && (
          <div className="map-loading-overlay">
            <div className="map-loading-spinner"></div>
            <p>Загрузка карты...</p>
          </div>
        )}
      </div>
      
      <div className="map-footer">
        <p className="map-note">
          Карта обновляется автоматически. Данные предоставлены{' '}
          <a 
            href="https://www.windy.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: mapConfig[mapType].color }}
          >
            Windy.com
          </a>
        </p>
        
        <div className="map-legend">
          <span className="legend-item">
            <span 
              className="legend-color" 
              style={{ backgroundColor: mapConfig[mapType].color }}
            ></span>
            {mapConfig[mapType].label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherMap;