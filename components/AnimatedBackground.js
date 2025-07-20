import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './AnimatedBackground.css';

// Конфигурация фонов для разных погодных условий
const weatherBackgrounds = {
  light: {
    thunderstorm: 'linear-gradient(135deg, #0f2027, #203a43)',
    drizzle: 'linear-gradient(135deg, #4b6cb7, #182848)',
    rain: 'linear-gradient(135deg, #4b6cb7, #182848)',
    snow: 'linear-gradient(135deg, #e6e9f0, #eef1f5)',
    clear: 'linear-gradient(135deg, #56ccf2, #2f80ed)',
    clouds: 'linear-gradient(135deg, #bdc3c7, #2c3e50)',
    default: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)'
  },
  dark: {
    thunderstorm: 'linear-gradient(135deg, #000000, #0a1128)',
    drizzle: 'linear-gradient(135deg, #1a2a6c, #2a3a7c)',
    rain: 'linear-gradient(135deg, #1a2a6c, #2a3a7c)',
    snow: 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
    clear: 'linear-gradient(135deg, #0f2027, #203a43)',
    clouds: 'linear-gradient(135deg, #2c3e50, #4b79a1)',
    default: 'linear-gradient(135deg, #2c3e50, #1a1a1a)'
  }
};

// Дополнительные эффекты для погодных условий
const weatherEffects = {
  thunderstorm: {
    animation: 'lightning 8s infinite',
    overlay: 'repeating-linear-gradient(transparent, transparent 2px, rgba(255,255,255,0.05) 3px)'
  },
  drizzle: {
    animation: 'rain 10s linear infinite',
    overlay: 'repeating-linear-gradient(transparent, transparent 1px, rgba(255,255,255,0.03) 2px)'
  },
  rain: {
    animation: 'heavyRain 5s linear infinite',
    overlay: 'repeating-linear-gradient(transparent, transparent 1px, rgba(255,255,255,0.05) 2px)'
  },
  snow: {
    animation: 'snow 20s linear infinite',
    overlay: 'repeating-radial-gradient(rgba(255,255,255,0.1) 0 1px, transparent 1px 100%)'
  },
  clear: {
    animation: 'sunshine 15s alternate infinite',
    overlay: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
  },
  clouds: {
    animation: 'cloudMovement 30s linear infinite',
    overlay: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 100%)'
  },
  default: {
    animation: 'fadePulse 20s ease infinite',
    overlay: 'none'
  }
};

const AnimatedBackground = ({ weatherType }) => {
  const { isDarkMode, isTransitioning, transitionProgress } = useTheme();
  const [currentBg, setCurrentBg] = useState(null);
  const [nextBg, setNextBg] = useState(null);
  const bgRef = useRef(null);
  const theme = isDarkMode ? 'dark' : 'light';

  // Определяем текущий и следующий фоны
  useEffect(() => {
    const newBg = weatherBackgrounds[theme][weatherType] || weatherBackgrounds[theme].default;
    
    if (!currentBg) {
      setCurrentBg(newBg);
      return;
    }

    if (newBg !== currentBg && !nextBg) {
      setNextBg(newBg);
    }
  }, [theme, weatherType, currentBg, nextBg]);

  // Обработка перехода между фонами
  useEffect(() => {
    if (!isTransitioning && nextBg) {
      setCurrentBg(nextBg);
      setNextBg(null);
    }
  }, [isTransitioning, nextBg]);

  // Эффекты для текущей погоды
  const currentEffects = weatherEffects[weatherType] || weatherEffects.default;

  return (
    <div 
      ref={bgRef}
      className="animated-background"
      style={{
        '--bg-current': currentBg,
        '--bg-next': nextBg,
        '--transition-progress': transitionProgress,
        '--overlay': currentEffects.overlay,
        background: nextBg 
          ? `linear-gradient(
              90deg,
              var(--bg-current) 0%,
              var(--bg-current) calc(var(--transition-progress) * 100%),
              var(--bg-next) calc(var(--transition-progress) * 100%),
              var(--bg-next) 100%
            )`
          : currentBg,
      }}
      data-weather-type={weatherType}
      data-theme={theme}
      data-transitioning={isTransitioning}
    >
      <div 
        className="weather-effects"
        style={{ animation: currentEffects.animation }}
      />
      <div className="background-overlay" />
    </div>
  );
};

export default AnimatedBackground;