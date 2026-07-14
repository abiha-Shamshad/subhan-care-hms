import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

/**
 * Light/Dark theme switch. Renders a Sun (when dark, to go light) or Moon
 * (when light, to go dark). Pass `floating` for the fixed pill used on the
 * pre-authentication screens; default is the inline topbar variant.
 */
const ThemeToggle = ({ floating = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className={`theme-toggle ${floating ? 'theme-toggle--floating' : ''}`}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
