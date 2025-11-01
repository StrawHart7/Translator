// Service de traduction avec MyMemory Translation API
// API gratuite, sans CORS, sans clé API requise
const translationAPI = {
  baseURL: 'https://api.mymemory.translated.net',
  
  // Traduire le texte
  async translate(text, sourceLang, targetLang) {
    try {
      // MyMemory accepte 'auto' mais préfère des codes de langue spécifiques
      const source = sourceLang === 'auto' ? 'en' : sourceLang;
      
      // Construire l'URL de requête
      const langPair = `${source}|${targetLang}`;
      const encodedText = encodeURIComponent(text);
      const url = `${this.baseURL}/get?q=${encodedText}&langpair=${langPair}`;
      
      console.log('🔄 Traduction en cours...', { source, targetLang, text: text.substring(0, 50) });
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📥 Réponse de l\'API:', data);
      
      // Vérifier si la traduction a réussi
      if (data.responseStatus !== 200) {
        throw new Error(data.responseDetails || 'Traduction impossible');
      }
      
      // Vérifier si on a une traduction valide
      if (!data.responseData || !data.responseData.translatedText) {
        throw new Error('Aucune traduction retournée');
      }
      
      console.log('✅ Traduction réussie:', data.responseData.translatedText);
      
      return data.responseData.translatedText;
      
    } catch (error) {
      console.error('❌ Erreur de traduction:', error);
      throw new Error(`Impossible de traduire: ${error.message}`);
    }
  },
  
  // Détecter la langue du texte
  async detectLanguage(text) {
    try {
      // MyMemory peut détecter via une traduction test vers anglais
      // Si le texte est déjà en anglais, on le saura par le résultat
      const sample = text.substring(0, 100); // Premier 100 caractères
      
      // Essayer de détecter en testant plusieurs langues communes
      const commonLanguages = ['fr', 'en', 'es', 'de', 'it'];
      
      // Pour simplifier, on retourne 'en' par défaut
      // MyMemory ne propose pas d'API de détection directe
      console.log('🔍 Détection de langue (mode auto)');
      return 'en';
      
    } catch (error) {
      console.error('❌ Erreur de détection:', error);
      return 'en'; // Langue par défaut
    }
  }
};

export default translationAPI;