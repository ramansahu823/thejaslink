// src/hooks/useManualTranslation.js
import { useState, useEffect } from 'react';

export const useManualTranslation = () => {
  const [translatedTexts, setTranslatedTexts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async (text, targetLang) => {
    if (targetLang === 'en') return text;

    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const translateMultiple = async (texts, targetLang) => {
    setIsTranslating(true);
    const translations = {};

    for (const [key, text] of Object.entries(texts)) {
      translations[key] = await translateText(text, targetLang);
    }

    setTranslatedTexts(translations);
    setIsTranslating(false);
    return translations;
  };

  return {
    translatedTexts,
    isTranslating,
    translateText,
    translateMultiple
  };
};