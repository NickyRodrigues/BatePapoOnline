/**
 * @param {string} text 
 * @returns {Promise<string>} 
 */
export async function translateToEnglish(text) {
  if (!text.trim()) {
    return "";
  }

  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|en`;

  try {
    console.log(`[Tradutor] A traduzir: "${text}"`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.responseData && data.responseData.translatedText) {
      const translatedText = data.responseData.translatedText;
      console.log(`[Tradutor] Tradução: "${translatedText}"`);
      return translatedText;
    } else {
      console.error("[Tradutor] A resposta da API não continha uma tradução válida.", data);
      return text;
    }
  } catch (error) {
    console.error("[Tradutor] Ocorreu um erro ao chamar a API de tradução:", error);
    return text;
  }
}