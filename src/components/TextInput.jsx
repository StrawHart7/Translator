import React from 'react';

// Composant: Zone de texte d'entrée
export default function TextInput({ value, onChange, placeholder, disabled, onKeyDown }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full h-40 p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-lg 
                 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    />
  );
}