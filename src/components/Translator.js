import React, { useState } from 'react';
import { Translate } from '@google-cloud/translate/build/src/v2';

const Translator = () => {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi'); // Default to Hindi

  const translate = new Translate({
    key: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY
  });

  const handleTranslate = async () => {
    try {
      const [translation] = await translate.translate(text, targetLanguage);
      setTranslatedText(translation);
    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

  return (
    <div className="translator-container">
      <div className="input-section">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
        />
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
        </select>
        <button onClick={handleTranslate}>Translate</button>
      </div>
      <div className="output-section">
        <h3>Translated Text:</h3>
        <p>{translatedText}</p>
      </div>
    </div>
  );
};

export default Translator;
