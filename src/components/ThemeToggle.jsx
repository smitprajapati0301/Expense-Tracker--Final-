import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark = localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const dark = !isDark;
    localStorage.theme = dark ? 'dark' : 'light';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  };

  return (
    <button onClick={toggleTheme} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
