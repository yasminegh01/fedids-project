import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} className="p-2 rounded-md bg-bg-secondary text-text-primary">
            {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
        </button>
    );
}