import React, { useState, useEffect } from 'react';
import css from './InputSearch.module.css';
import { SearchInputProps } from './types';

const InputSearch = ({ value, onChange, placeholder = 'Search for a model', className, voice }: SearchInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-EN';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Add image processing logic here
      console.log('Selected file:', file.name);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <div className={`${css.wrapperSearch} ${className || ''}`}>
      <label className={css.btnAddIcon} title='Select an image'>
        +
        <input type='file' accept='image/*' onChange={handleFileSelect} style={{ display: 'none' }} />
      </label>
      <input
        className={css.inputSearch}
        type='text'
        name='search'
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className={css.wrapperBtnIcon}>
        <button
          className={`${css.btnIcon} ${isListening ? css.listening : ''}`}
          type='button'
          onClick={handleVoiceInput}
          title={isListening ? 'Остановить запись' : 'Начать голосовой ввод'}
        >
          <img width={22} height={22} src='/img/microphone-2.png' alt='Voice input' />
        </button>
        {voice && (
          <button className={css.btnIcon} type='button'>
            <img width={24} height={24} src='/img/barcode.png' alt='Barcode' />
          </button>
        )}
      </div>
    </div>
  );
};
export default InputSearch;
