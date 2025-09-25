// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
            root.classList.add(systemIsDark ? 'dark' : 'light');
        } else {
            root.classList.add(theme);
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    return [theme, setTheme] as const;
}