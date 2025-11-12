import React, { useState, useRef, useEffect } from 'react';

// Composant: Zone de sortie avec boutons, plein écran et suivi
export default function OutputBox({ text, language, onCopy }) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState([]);
  const textRef = useRef(null);
  const utteranceRef = useRef(null);

  // Charger les voix
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Découper le texte en mots
  useEffect(() => {
    if (text) {
      const wordsArray = text.split(/(\s+)/);
      setWords(wordsArray);
    } else {
      setWords([]);
    }
  }, [text]);

  // Défilement automatique vers le mot en cours
  useEffect(() => {
    if (currentWordIndex >= 0 && textRef.current) {
      const wordElements = textRef.current.querySelectorAll('.word');
      if (wordElements[currentWordIndex]) {
        wordElements[currentWordIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [currentWordIndex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const isCode = (text) => {
    const codePatterns = [
      /[{}<>]/g,
      /function|const|let|var|=>/g,
      /import|export|from/g,
      /class|public|private/g,
      /\w+\.\w+\(/g,
      /[A-Z][a-z]+[A-Z]/g
    ];
    let codeScore = 0;
    for (const pattern of codePatterns) {
      const matches = text.match(pattern);
      if (matches) codeScore += matches.length;
    }
    return codeScore >= 3;
  };

  const getBestVoice = (lang) => {
    const langCode = lang === 'auto' ? 'en' : lang;
    const googleVoice = voices.find(v => 
      v.name.includes('Google') && v.lang.startsWith(langCode)
    );
    if (googleVoice) return googleVoice;
    return voices.find(v => v.lang.startsWith(langCode));
  };

  const speak = () => {
    if (!text || isSpeaking) return;
    window.speechSynthesis.cancel();
    
    const smartLanguage = (language === 'fr' && isCode(text)) ? 'en' : language;
    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = getBestVoice(smartLanguage);
    
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = smartLanguage === 'auto' ? 'en-US' : `${smartLanguage}-${smartLanguage.toUpperCase()}`;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Suivi de la progression avec défilement
    let wordIndex = 0;
    const wordsPerSecond = 2.5; // Vitesse approximative
    const interval = setInterval(() => {
      if (wordIndex < words.length && isSpeaking) {
        setCurrentWordIndex(wordIndex);
        wordIndex += 2; // Sauter les espaces
      } else {
        clearInterval(interval);
        setCurrentWordIndex(-1);
      }
    }, (1000 / wordsPerSecond));

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentWordIndex(0);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      clearInterval(interval);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      clearInterval(interval);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
  };

  // Rendu du texte avec suivi
  const renderTextWithTracking = () => {
    if (!text) {
      return <span className="text-gray-400 dark:text-gray-500">La traduction apparaîtra ici...</span>;
    }

    return (
      <span ref={textRef}>
        {words.map((word, index) => (
          <span
            key={index}
            className={`word transition-all duration-200 ${
              index === currentWordIndex
                ? 'bg-indigo-500 text-white px-1 rounded'
                : ''
            }`}
          >
            {word}
          </span>
        ))}
      </span>
    );
  };

  return (
    <>
      {/* Version normale */}
      <div className={`relative ${isFullscreen ? 'hidden' : 'block'}`}>
        <div className="w-full h-40 p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-lg
                        bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-auto scroll-smooth">
          {renderTextWithTracking()}
        </div>
        
        <div className="absolute bottom-3 right-3 flex gap-2">
          {/* Bouton Audio */}
          <button
            onClick={isSpeaking ? stopSpeaking : speak}
            disabled={!text}
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 
                       disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200
                       backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
            title={isSpeaking ? "Arrêter" : "Écouter"}
          >
            {isSpeaking ? (
              <svg className="w-5 h-5 text-indigo-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" opacity="0.3"/>
                <rect x="9" y="9" width="6" height="6" rx="1"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Bouton Copier */}
          <button
            onClick={handleCopy}
            disabled={!text}
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                       backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
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

          {/* Bouton Plein écran */}
          <button
            onClick={toggleFullscreen}
            disabled={!text}
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                       backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
            title="Plein écran"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Version plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col animate-fade-in">
          {/* Header plein écran */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Traduction
              </h2>
              {isSpeaking && (
                <p className="text-sm text-indigo-500 dark:text-indigo-400 mt-1">
                  🎙️ Lecture en cours...
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {/* Bouton Audio */}
              <button
                onClick={isSpeaking ? stopSpeaking : speak}
                className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isSpeaking ? "Arrêter" : "Écouter"}
              >
                {isSpeaking ? (
                  <svg className="w-6 h-6 text-indigo-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" opacity="0.3"/>
                    <rect x="9" y="9" width="6" height="6" rx="1"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>

              {/* Bouton Copier */}
              <button
                onClick={handleCopy}
                className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Copier"
              >
                {copied ? (
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* Bouton Fermer */}
              <button
                onClick={toggleFullscreen}
                className="p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                title="Fermer"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenu plein écran avec suivi */}
          <div className="flex-1 overflow-auto p-6 sm:p-8 lg:p-12 scroll-smooth">
            <div className="max-w-4xl mx-auto">
              <div ref={textRef} className="text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-gray-100 leading-relaxed">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`word transition-all duration-300 ${
                      index === currentWordIndex
                        ? 'bg-indigo-500 text-white px-2 py-1 rounded-lg shadow-lg scale-110 inline-block'
                        : ''
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          {isSpeaking && words.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{
                  width: `${((currentWordIndex + 1) / words.length) * 100}%`
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Styles pour l'animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}