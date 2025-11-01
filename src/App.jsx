import React, { useState, useEffect } from 'react';
import TextInput from './components/TextInput';
import LanguageSelector from './components/LanguageSelector';
import OutputBox from './components/OutputBox';
import AudioButton from './components/AudioButton';
import HistoryPanel from './components/HistoryPanel';
import translationAPI from './services/translationAPI';

// Liste des langues supportées
const languages = [
  { code: 'auto', name: 'Détecter la langue', flag: '🌐' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'Anglais', flag: '🇬🇧' },
  { code: 'es', name: 'Espagnol', flag: '🇪🇸' },
  { code: 'de', name: 'Allemand', flag: '🇩🇪' },
  { code: 'it', name: 'Italien', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugais', flag: '🇵🇹' },
  { code: 'ru', name: 'Russe', flag: '🇷🇺' },
  { code: 'ja', name: 'Japonais', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinois', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabe', flag: '🇸🇦' }
];

// Composant principal
export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('fr');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Charger le mode sombre au démarrage
  useEffect(() => {
    const savedDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
  }, []);

  // Basculer le mode sombre
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Ajouter à l'historique
  const addToHistory = (item) => {
    const newHistory = [item, ...history.slice(0, 9)]; // Garder seulement 10 éléments
    setHistory(newHistory);
  };

  // Effacer l'historique
  const clearHistory = () => {
    setHistory([]);
    setShowHistory(false);
  };

  // Sélectionner depuis l'historique
  const selectFromHistory = (item) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setShowHistory(false);
  };

  // Échanger les langues
  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // Traduire le texte
  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('Veuillez entrer du texte à traduire');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let detectedLang = sourceLang;
      
      // Détecter la langue si nécessaire
      if (sourceLang === 'auto') {
        detectedLang = await translationAPI.detectLanguage(sourceText);
      }

      // Traduire
      const result = await translationAPI.translate(sourceText, detectedLang, targetLang);
      setTranslatedText(result);

      // Ajouter à l'historique
      addToHistory({
        sourceText,
        translatedText: result,
        sourceLang: detectedLang,
        targetLang,
        timestamp: Date.now()
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Traduire avec Ctrl + Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTranslate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 
                    dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Straw .
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              title="Historique"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs 
                               rounded-full w-5 h-5 flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Changer le thème"
            >
              {darkMode ? (
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Panneau d'historique */}
      <div className="max-w-6xl mx-auto px-4 relative">
        <HistoryPanel
          history={history}
          isOpen={showHistory}
          onSelect={selectFromHistory}
          onClear={clearHistory}
          languages={languages}
        />
      </div>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Sélecteurs de langue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <LanguageSelector
            value={sourceLang}
            onChange={setSourceLang}
            languages={languages}
            label="Langue source"
          />
          
          <div className="flex items-end justify-center">
            <button
              onClick={swapLanguages}
              disabled={sourceLang === 'auto'}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md 
                         hover:shadow-lg hover:scale-110 disabled:opacity-40 
                         disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200"
              title="Échanger les langues"
            >
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
          
          <LanguageSelector
            value={targetLang}
            onChange={setTargetLang}
            languages={languages}
            label="Langue cible"
            excludeAuto
          />
        </div>

        {/* Zone de traduction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Zone d'entrée */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Texte à traduire
              </h2>
              <AudioButton text={sourceText} language={sourceLang} disabled={!sourceText} />
            </div>
            <TextInput
              value={sourceText}
              onChange={setSourceText}
              placeholder="Entrez votre texte ici... (Ctrl + Entrée pour traduire)"
              disabled={isLoading}
              onKeyDown={handleKeyPress}
            />
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
              {sourceText.length} caractères
            </div>
          </div>

          {/* Zone de sortie */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Traduction
            </h2>
            <OutputBox
              text={translatedText}
              language={targetLang}
            />
          </div>
        </div>

        {/* Bouton de traduction */}
        <div className="text-center">
          <button
            onClick={handleTranslate}
            disabled={isLoading || !sourceText.trim()}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold 
                       rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 
                       disabled:cursor-not-allowed transition-all duration-200 
                       transform hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traduction en cours...
              </span>
            ) : (
              'Traduire'
            )}
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 
                          text-red-700 dark:text-red-400 rounded-lg">
            <p className="font-medium">❌ {error}</p>
          </div>
        )}

        {/* Astuce */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          💡 Astuce : Appuyez sur <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl + Entrée</kbd> pour traduire rapidement
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Propulsé par LibreTranslate • Traduction gratuite et open source</p>
      </footer>
    </div>
  );
}