'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';

const KEY = 'kfit-theme';


export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  }, []);
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };
  const light = theme === 'light';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? 'Usar tema escuro' : 'Usar tema claro'}
      className={`relative flex h-11 w-[76px] items-center rounded-full border border-line bg-card p-1 ${className}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue text-white shadow-md"
        style={{ marginLeft: light ? 0 : 'auto' }}
      >
        {light ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.span>
      <span className={`absolute ${light ? 'right-3' : 'left-3'} text-dim`} aria-hidden="true">
        {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  );
}
