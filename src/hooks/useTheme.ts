import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

// This hook manages the theme state and applies it to the document.
export function useTheme(): [Theme, React.Dispatch<React.SetStateAction<Theme>>] {
    const [theme, setTheme] = useState<Theme>(() => {
        // 1. Check for a theme saved in local storage.
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            return savedTheme;
        }
        // 2. If none, default to the user's system preference.
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // This effect runs whenever the theme state changes.
    useEffect(() => {
        const root = window.document.documentElement;
        // 1. Remove previous theme class.
        root.classList.remove('light', 'dark');
        // 2. Add the new theme class to the <html> element.
        root.classList.add(theme);
        // 3. Save the new theme preference to local storage.
        localStorage.setItem("theme", theme);
    }, [theme]);

    return [theme, setTheme];
}