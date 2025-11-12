// Service de traduction avec Google Translate API (gratuite)
const translationAPI = {
  baseURL: 'https://translate.googleapis.com/translate_a/single',
  
  // Traduire le texte
  async translate(text, sourceLang, targetLang) {
    try {
      const source = sourceLang === 'auto' ? 'auto' : sourceLang;
      
      // Construction de l'URL Google Translate
      const params = new URLSearchParams({
        client: 'gtx',
        sl: source,
        tl: targetLang,
        dt: 't',
        q: text
      });
      
      const url = `${this.baseURL}?${params.toString()}`;
      
      console.log('🔄 Traduction Google:', source, '→', targetLang);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📥 Réponse Google:', data);
      
      // Google retourne un format: [[[traduction, original, null, null, score]]]
      if (!data || !data[0]) {
        throw new Error('Format de réponse invalide');
      }
      
      // Extraire toutes les traductions et les combiner
      const translatedText = data[0]
        .map(item => item[0])
        .filter(text => text)
        .join('');
      
      console.log('✅ Traduction réussie');
      
      return translatedText;
      
    } catch (error) {
      console.error('❌ Erreur de traduction:', error);
      throw new Error(`Impossible de traduire: ${error.message}`);
    }
  },
  
  // Détecter la langue du texte
  async detectLanguage(text) {
    try {
      const params = new URLSearchParams({
        client: 'gtx',
        sl: 'auto',
        tl: 'en',
        dt: 't',
        q: text.substring(0, 100)
      });
      
      const url = `${this.baseURL}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // La langue détectée est dans data[2]
      const detectedLang = data[2] || 'en';
      
      console.log('🔍 Langue détectée:', detectedLang);
      
      return detectedLang;
      
    } catch (error) {
      console.error('❌ Erreur de détection:', error);
      return 'en';
    }
  }
};

export default translationAPI;