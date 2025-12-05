
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  hasNotes: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, hasNotes, isDarkMode, toggleTheme }) => {
  
  const navItems = [
    { id: AppView.HOME, label: 'Dashboard', icon: '🏠', disabled: false },
    { id: AppView.UPLOAD, label: 'Upload & Source', icon: '📁', disabled: false },
    { id: AppView.NOTES, label: 'AI Notes', icon: '📝', disabled: !hasNotes },
    { id: AppView.FLASHCARDS, label: 'Flashcards', icon: '🗂️', disabled: !hasNotes },
    { id: AppView.QUIZ, label: 'Quiz', icon: '✅', disabled: !hasNotes },
  ];

  return (
    <div id="sidebar" className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-colors duration-200">
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.HOME)}>
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-brand-500/20 shadow-lg">
          AI
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">StudyGenius</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setView(item.id)}
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 
              ${currentView === item.id 
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-500 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </div>
  );
};