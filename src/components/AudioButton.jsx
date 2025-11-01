import React, { useState } from 'react';

// Composant: Bouton audio pour lire le texte
export default function AudioButton({ text, language, disabled }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (!text || isSpeaking) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'auto' ? 'en-US' : `${language}-${language.toUpperCase()}`;
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      disabled={disabled || !text}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      title="Écouter"
    >
      <svg 
        className={`w-5 h-5 ${isSpeaking ? 'text-blue-500 animate-pulse' : 'text-gray-600 dark:text-gray-400'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </button>
  );
}