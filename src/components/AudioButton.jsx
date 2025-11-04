import React, { useState, useEffect } from "react";

export default function AudioButton({ text, language, disabled }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

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

  // Détecter si le texte contient du code
  const isCode = (text) => {
    const codePatterns = [
      /[{}<>]/g, // Accolades, chevrons
      /function|const|let|var|=>/g, // Mots-clés JS
      /import|export|from/g, // Imports
      /class|public|private/g, // POO
      /\w+\.\w+\(/g, // Appels de méthodes (ex: console.log())
      /[A-Z][a-z]+[A-Z]/g, // CamelCase (ex: getData)
    ];

    let codeScore = 0;
    for (const pattern of codePatterns) {
      const matches = text.match(pattern);
      if (matches) codeScore += matches.length;
    }

    // Si 3+ patterns détectés = c'est du code
    return codeScore >= 3;
  };

  // Choisir la langue intelligemment
  const getSmartLanguage = (text, originalLang) => {
    // Si ce n'est pas du français, garder la langue originale
    if (originalLang !== "fr") return originalLang;

    // Si c'est du code, lire en anglais
    if (isCode(text)) {
      console.log("🔄 Code détecté → Lecture en anglais");
      return "en";
    }

    return originalLang;
  };

  const getBestVoice = (lang) => {
    const langCode = lang === "auto" ? "en" : lang;

    const googleVoice = voices.find(
      (v) => v.name.includes("Google") && v.lang.startsWith(langCode)
    );
    if (googleVoice) return googleVoice;

    return voices.find((v) => v.lang.startsWith(langCode));
  };

  const speak = () => {
    if (!text || isSpeaking) return;

    window.speechSynthesis.cancel();

    // Détecter intelligemment la langue à utiliser
    const smartLanguage = getSmartLanguage(text, language);

    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = getBestVoice(smartLanguage);

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang =
        smartLanguage === "auto"
          ? "en-US"
          : `${smartLanguage}-${smartLanguage.toUpperCase()}`;
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
    <button
      onClick={isSpeaking ? stopSpeaking : speak}
      disabled={disabled || !text}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      title={isSpeaking ? "Arrêter" : "Écouter"}
    >
      {isSpeaking ? (
        <svg
          className="w-5 h-5 text-indigo-500 animate-pulse"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" opacity="0.3" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )}
    </button>
  );
}
