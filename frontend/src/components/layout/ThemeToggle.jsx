import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all shadow-sm"
      aria-label="Toggle Theme"
    >
      {isDarkMode ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
    </motion.button>
  );
};

export default ThemeToggle;
