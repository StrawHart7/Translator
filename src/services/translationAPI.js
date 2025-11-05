// Service de traduction avec MyMemory Translation API
const translationAPI = {
  baseURL: 'https://api.mymemory.translated.net',
  MAX_CHARS: 500,
  
  // Traduire le texte
  async translate(text, sourceLang, targetLang) {
    try {
      // IMPORTANT: Ne jamais utiliser 'auto', forcer 'en' par défaut
      let source = sourceLang;
      if (source === 'auto') {
        source = 'en'; // Par défaut anglais
      }
      
      // Si le texte dépasse la limite, découper
      if (text.length > this.MAX_CHARS) {
        return await this.translateLongText(text, source, targetLang);
      }
      
      // Construction de l'URL avec le bon format
      const langPair = `${source}|${targetLang}`;
      const encodedText = encodeURIComponent(text);
      const url = `${this.baseURL}/get?q=${encodedText}&langpair=${langPair}`;
      
      console.log('🔄 Traduction:', source, '→', targetLang);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📥 Réponse API:', data);
      
      // Vérifier les erreurs de l'API
      if (data.responseStatus !== 200) {
        // Si erreur de paire de langues, essayer avec l'anglais comme pivot
        if (data.responseStatus === 403 || data.responseDetails?.includes('INVALID LANGUAGE')) {
          console.log('⚠️ Paire de langues invalide, utilisation pivot anglais');
          return await this.translateViaEnglish(text, source, targetLang);
        }
        throw new Error(data.responseDetails || 'Traduction impossible');
      }
      
      if (!data.responseData || !data.responseData.translatedText) {
        throw new Error('Aucune traduction retournée');
      }
      
      console.log('✅ Traduction réussie');
      
      return data.responseData.translatedText;
      
    } catch (error) {
      console.error('❌ Erreur de traduction:', error);
      
      // Tentative de secours via l'anglais
      if (sourceLang !== 'en' && targetLang !== 'en') {
        console.log('🔄 Tentative via pivot anglais...');
        try {
          return await this.translateViaEnglish(text, sourceLang, targetLang);
        } catch (pivotError) {
          throw new Error(`Impossible de traduire: ${error.message}`);
        }
      }
      
      throw new Error(`Impossible de traduire: ${error.message}`);
    }
  },
  
  // Traduire via l'anglais comme langue pivot
  async translateViaEnglish(text, sourceLang, targetLang) {
    console.log('🔄 Traduction en 2 étapes:', sourceLang, '→ en →', targetLang);
    
    // Étape 1: Source → Anglais
    if (sourceLang !== 'en') {
      const langPair1 = `${sourceLang}|en`;
      const url1 = `${this.baseURL}/get?q=${encodeURIComponent(text)}&langpair=${langPair1}`;
      
      const response1 = await fetch(url1);
      const data1 = await response1.json();
      
      if (data1.responseStatus === 200 && data1.responseData) {
        text = data1.responseData.translatedText;
        console.log('✅ Étape 1/2 réussie');
      }
    }
    
    // Étape 2: Anglais → Target
    if (targetLang !== 'en') {
      const langPair2 = `en|${targetLang}`;
      const url2 = `${this.baseURL}/get?q=${encodeURIComponent(text)}&langpair=${langPair2}`;
      
      const response2 = await fetch(url2);
      const data2 = await response2.json();
      
      if (data2.responseStatus === 200 && data2.responseData) {
        console.log('✅ Étape 2/2 réussie');
        return data2.responseData.translatedText;
      }
    }
    
    return text;
  },
  
  // Traduire un texte long
  async translateLongText(text, sourceLang, targetLang) {
    console.log('📝 Texte long détecté, découpage en cours...');
    
    const chunks = this.splitIntoChunks(text, this.MAX_CHARS);
    const translations = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔄 Traduction partie ${i + 1}/${chunks.length}...`);
      
      try {
        const translation = await this.translate(chunks[i], sourceLang, targetLang);
        translations.push(translation);
      } catch (error) {
        console.error(`❌ Erreur partie ${i + 1}:`, error);
        translations.push(chunks[i]); // Garder l'original en cas d'erreur
      }
      
      // Délai pour éviter le rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return translations.join(' ');
  },
  
  // Découper le texte intelligemment
  splitIntoChunks(text, maxLength) {
    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        
        // Si la phrase elle-même est trop longue
        if (sentence.length > maxLength) {
          const words = sentence.split(' ');
          let tempChunk = '';
          
          for (const word of words) {
            if ((tempChunk + word).length <= maxLength) {
              tempChunk += word + ' ';
            } else {
              if (tempChunk) chunks.push(tempChunk.trim());
              tempChunk = word + ' ';
            }
          }
          
          if (tempChunk) currentChunk = tempChunk;
        } else {
          currentChunk = sentence;
        }
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    
    return chunks;
  },
  
  // Détecter la langue du texte
  async detectLanguage(text) {
    try {
      const sample = text.substring(0, 100);
      
      // Essayer de détecter via MyMemory
      const url = `${this.baseURL}/get?q=${encodeURIComponent(sample)}&langpair=auto|en`;
      const response = await fetch(url);
      const data = await response.json();
      
      // MyMemory peut donner une indication dans les matches
      if (data.matches && data.matches.length > 0) {
        const match = data.matches[0];
        if (match.source) {
          console.log('🔍 Langue détectée:', match.source);
          return match.source;
        }
      }
      
      console.log('🔍 Détection impossible, utilisation anglais par défaut');
      return 'en';
      
    } catch (error) {
      console.error('❌ Erreur de détection:', error);
      return 'en';
    }
  }
};

export default translationAPI;