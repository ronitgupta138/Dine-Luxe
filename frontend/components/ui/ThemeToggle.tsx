"use client"

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [mode, setMode] = useState<'light'|'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client
    try {
      const saved = localStorage.getItem('dineluxe-theme');
      const newMode = (saved === 'dark' ? 'dark' : 'light');
      setMode(newMode);
      
      const root = document.documentElement;
      if (newMode === 'dark') root.classList.add('dark-mode');
      else root.classList.remove('dark-mode');
    } catch {}
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    
    const root = document.documentElement;
    if (newMode === 'dark') root.classList.add('dark-mode');
    else root.classList.remove('dark-mode');
    try { localStorage.setItem('dineluxe-theme', newMode); } catch {}
  };

  return (
    <button
      aria-label="Toggle theme"
      className="px-3 py-1 border rounded-md text-sm"
      onClick={handleToggle}
    >
      {mounted ? (mode === 'dark' ? '🌙 Dark' : '☀️ Light') : '☀️ Light'}
    </button>
  );
}
