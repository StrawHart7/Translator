import React from 'react';

// Composant: Sélecteur de langue
export default function LanguageSelector({ value, onChange, languages, label, excludeAuto }) {
  const filteredLanguages = excludeAuto 
    ? languages.filter(lang => lang.code !== 'auto')
    : languages;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 text-base border-2 border-gray-200 dark:border-gray-700 rounded-lg
                   focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   cursor-pointer transition-colors"
      >
        {filteredLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}