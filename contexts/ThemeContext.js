// src/contexts/ThemeContext.js
import React, { 
  createContext, 
  useState, 
  useEffect, 
  useCallback,
  useMemo 
} from 'react';

// Создаем контекст
export const ThemeContext = createContext();

// Провайдер темы
export const ThemeProvider = ({ children }) => {
  // Состояния
  const [theme, setTheme] = useState('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [systemTheme, setSystemTheme] = useState(null);
  
  // Определяем системную тему
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Обработчик изменений системной темы
    const handleSystemThemeChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    // Инициализация
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);
  
  // Инициализация темы при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || 'system';
    
    setTheme(initialTheme);
    
    // Применяем тему сразу после установки
    setTimeout(() => {
      applyTheme(initialTheme);
    }, 10);
  }, [systemTheme]);

  // Функция применения темы
  const applyTheme = useCallback((themeToApply) => {
    let actualTheme = themeToApply;
    
    if (themeToApply === 'system') {
      actualTheme = systemTheme || 'light';
    }
    
    // Устанавливаем атрибут data-theme для CSS переменных
    document.documentElement.setAttribute('data-theme', actualTheme);
    
    // Устанавливаем класс для body
    document.body.className = actualTheme;
    
    // Обновляем meta-тег theme-color
    const themeColor = actualTheme === 'dark' ? '#121212' : '#ffffff';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
  }, [systemTheme]);

  // Переключение темы
  const toggleTheme = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Определяем новую тему
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', newTheme);
    
    // Добавляем класс для анимации
    document.documentElement.classList.add('theme-transition');
    
    // Устанавливаем новую тему
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Убираем класс анимации после завершения перехода
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
      setIsTransitioning(false);
    }, 300);
  }, [theme, isTransitioning, applyTheme]);

  // Функция для прямого установления темы
  const setThemeDirect = useCallback((newTheme) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    localStorage.setItem('theme', newTheme);
    
    document.documentElement.classList.add('theme-transition');
    setTheme(newTheme);
    applyTheme(newTheme);
    
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, applyTheme]);

  // Значение контекста
  const contextValue = useMemo(() => ({
    theme,
    systemTheme,
    isDarkMode: theme === 'system' 
      ? systemTheme === 'dark' 
      : theme === 'dark',
    isTransitioning,
    toggleTheme,
    setTheme: setThemeDirect,
    themeOptions: ['light', 'dark', 'system']
  }), [theme, systemTheme, isTransitioning, toggleTheme, setThemeDirect]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Хук для удобного использования контекста
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};