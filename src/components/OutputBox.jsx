import React, { useState } from 'react';
import AudioButton from './AudioButton';

// Composant: Zone de sortie avec boutons copier et audio
export default function OutputBox({ text, language, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="w-full h-40 p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-lg
                      bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-auto">
        {text || <span className="text-gray-400 dark:text-gray-500">La traduction apparaîtra ici...</span>}
      </div>
      
      <div className="absolute bottom-3 right-3 flex gap-2">
        <AudioButton text={text} language={language} disabled={!text} />
        <button
          onClick={handleCopy}
          disabled={!text}
          className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Copier"
        >
          {copied ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}