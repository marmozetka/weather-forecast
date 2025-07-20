import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { 
    theme, 
    systemTheme, 
    isDarkMode, 
    isTransitioning, 
    toggleTheme,
    themeOptions 
  } = useTheme();

  // Текущая активная тема
  const activeTheme = theme === 'system' ? systemTheme : theme;
  
  // Тексты для разных состояний
  const themeLabels = {
    light: 'Светлая',
    dark: 'Темная',
    system: 'Системная'
  };
  
  // Иконки
  const themeIcons = {
    light: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-11-4h2v2h-2v-2zm19 0h2v2h-2v-2zm-17 17h2v2h-2v-2zm17 0h2v2h-2v-2zm-15-7h4v2h-4v-2zm13 0h4v2h-4v-2zm-13-7h3v2h-3v-2zm14 0h3v2h-3v-2zm-9 14h2v3h-2v-3zm5 0h2v3h-2v-3z"/>
      </svg>
    ),
    dark: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M12.1 22c-5.5 0-10-4.5-10-10 0-4.3 2.7-8 6.7-9.5.4-.1.8.1.9.5.1.4-.1.8-.5.9-3.5 1.3-6 5.1-6 8.9 0 4.4 3.6 8 8 8 3.8 0 7.6-2.5 8.9-6 .1-.4.5-.6.9-.5.4.1.6.5.5.9-1.5 4-5.2 6.7-9.5 6.7zm0-18c-4.4 0-8 3.6-8 8s3.6 8 8 8c.3 0 .6 0 .9-.1-1.8-1.8-2.9-4.3-2.9-6.9 0-2.6 1.1-5.1 2.9-6.9-.3-.1-.6-.1-.9-.1z"/>
      </svg>
    ),
    system: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M21 16H3V4h18m0-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    )
  };
  
  // Стили
  const styles = useMemo(() => ({
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 16px',
      background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      border: 'none',
      borderRadius: '50px',
      cursor: isTransitioning ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      color: isDarkMode ? '#fff' : '#333',
      opacity: isTransitioning ? 0.7 : 1,
      position: 'relative',
      overflow: 'hidden',
      minWidth: '180px',
    },
    icon: {
      minWidth: '24px',
      transition: 'transform 0.3s ease',
      transform: isTransitioning ? 'rotate(90deg)' : 'none',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      flexGrow: 1,
      textAlign: 'left',
    },
    themeName: {
      fontWeight: 700,
      marginLeft: '4px',
    },
    indicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      background: isDarkMode ? '#333' : '#fff',
      borderRadius: '50%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }
  }), [isDarkMode, isTransitioning]);

  return (
    <button
      onClick={toggleTheme}
      style={styles.container}
      aria-label="Переключить тему"
      aria-busy={isTransitioning}
      disabled={isTransitioning}
    >
      <div style={styles.icon}>
        {themeIcons[theme] || themeIcons.system}
      </div>
      
      <div style={styles.label}>
        Тема: 
        <span style={styles.themeName}>
          {themeLabels[theme] || 'Системная'}
        </span>
      </div>
      
      <div style={styles.indicator}>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          borderRadius: '50%',
          background: activeTheme === 'dark' ? '#4361ee' : '#ff9800',
          opacity: isTransitioning ? 0.5 : 1
        }} />
      </div>
    </button>
  );
};

export default ThemeToggle;