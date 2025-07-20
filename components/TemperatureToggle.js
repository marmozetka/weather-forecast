import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

// Анимации должны быть объявлены как функции
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(67, 97, 238, 0); }
  100% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0); }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-left: 10px;
`;

const ToggleTrack = styled.div`
  position: relative;
  width: 74px;
  height: 32px;
  border-radius: 16px;
  background: ${({ theme }) => theme.toggleTrackBg};
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.toggleOverlay};
    opacity: 0.2;
    pointer-events: none;
  }
`;

const ToggleThumb = styled.div`
  position: absolute;
  top: 3px;
  left: ${({ unit }) => (unit === 'C' ? '3px' : '39px')};
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${({ theme }) => theme.toggleThumbBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.toggleThumbText};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: 
    left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.3s ease,
    transform 0.2s ease;
  z-index: 2;
  
  ${ToggleTrack}:hover & {
    transform: scale(1.05);
  }
  
  /* Исправление: правильное применение анимации через css helper */
  ${({ unit }) => unit === 'C' && css`
    animation: ${glow} 2s ease-in-out infinite;
  `}
`;

const UnitLabel = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
  transition: all 0.3s ease;
  
  &.celsius {
    left: 10px;
    color: ${({ theme, unit }) => 
      unit === 'C' ? theme.toggleActiveText : theme.toggleInactiveText};
    font-weight: ${({ unit }) => unit === 'C' ? '700' : '500'};
  }
  
  &.fahrenheit {
    right: 10px;
    color: ${({ theme, unit }) => 
      unit === 'F' ? theme.toggleActiveText : theme.toggleInactiveText};
    font-weight: ${({ unit }) => unit === 'F' ? '700' : '500'};
  }
`;

const TemperatureToggle = ({ unit, onToggle }) => {
  const { isDarkMode } = useTheme();
  
  // Тема для переключателя
  const toggleTheme = {
    toggleTrackBg: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    toggleThumbBg: isDarkMode ? '#4cc9f0' : '#4361ee',
    toggleThumbText: isDarkMode ? '#121212' : '#ffffff',
    toggleActiveText: isDarkMode ? '#ffffff' : '#4361ee',
    toggleInactiveText: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
    toggleOverlay: isDarkMode 
      ? 'linear-gradient(135deg, rgba(76,201,240,0.3), rgba(67,97,238,0.3))' 
      : 'linear-gradient(135deg, rgba(255,255,255,0.5), transparent)'
  };

  return (
    <ToggleContainer>
      <ToggleTrack 
        theme={toggleTheme} 
        onClick={onToggle}
        aria-label={`Переключить в ${unit === 'C' ? 'Фаренгейты' : 'Цельсии'}`}
      >
        <ToggleThumb theme={toggleTheme} unit={unit}>
          {unit}
        </ToggleThumb>
        <UnitLabel theme={toggleTheme} unit={unit} className="celsius">
          °C
        </UnitLabel>
        <UnitLabel theme={toggleTheme} unit={unit} className="fahrenheit">
          °F
        </UnitLabel>
      </ToggleTrack>
    </ToggleContainer>
  );
};

export default TemperatureToggle;