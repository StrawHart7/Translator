import React from 'react';

export default function HistoryPanel({ history, onSelect, onClear, isOpen, languages }) {
  if (!isOpen) return null;

  return (
    <div className="fixed sm:absolute top-14 sm:top-16 left-2 right-2 sm:left-auto sm:right-4 
                    w-auto sm:w-80 max-h-[70vh] sm:max-h-96 bg-white dark:bg-gray-800 
                    border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl 
                    overflow-hidden z-30">
      <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">Historique</h3>
        <button
          onClick={onClear}
          className="text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          Effacer tout
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(70vh-60px)] sm:max-h-80">
        {history.length === 0 ? (
          <p className="p-4 text-gray-500 dark:text-gray-400 text-center text-sm">
            Aucune traduction
          </p>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelect(item)}
              className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 
                         dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                {languages.find(l => l.code === item.sourceLang)?.flag} → {languages.find(l => l.code === item.targetLang)?.flag}
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.sourceText}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {item.translatedText}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}