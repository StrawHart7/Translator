import React, { useState } from 'react';

// Composant: Zone de sortie avec boutons et plein écran
export default function OutputBox({ text, language, onCopy }) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Lecture audio
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

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
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <>
      {/* Version normale */}
      <div className={`relative ${isFullscreen ? 'hidden' : 'block'}`}>
        <div className="w-full h-40 p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-lg
                        bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-auto">
          {text || <span className="text-gray-400 dark:text-gray-500">La traduction apparaîtra ici...</span>}
        </div>
        
        <div className="absolute bottom-3 right-3 flex gap-2">
          {/* Bouton Audio */}
          <button
            onClick={isSpeaking ? stopSpeaking : speak}
            disabled={!text}
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 
                       disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
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

          {/* Bouton Plein écran */}
          <button
            onClick={toggleFullscreen}
            disabled={!text}
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
          {/* Header plein écran */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Traduction
            </h2>
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
                className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Fermer"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenu plein écran */}
          <div className="flex-1 overflow-auto p-6 sm:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                {text}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}