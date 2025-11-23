import React, { useState } from 'react';
import { TextInputProps } from './types';
import css from './InputText.module.css';

const InputText = ({
  value,
  onChange,
  placeholder = 'Search for a model',
  className,
  label,
  type = 'text',
  error,
  required,
}: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const validateEmail = (email: string): boolean => {
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (required && !value) {
      setValidationError('This field is required');
      return;
    }
    if (type === 'email' && value && !validateEmail(value)) {
      setValidationError('Please enter a valid email address');
    } else {
      setValidationError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trimStart();
    onChange(newValue);
    if (validationError) {
      setValidationError('');
    }
  };

  const displayError = error || validationError;

  return (
    <div className={`${css.wrapperInputText} ${className || ''}`}>
      <label className={css.inputTextLabel} title='Text Input'>
        {label}
        <input
          className={`${css.inputText} ${displayError ? css.inputError : ''} ${isFocused ? css.inputFocused : ''}`}
          type={type}
          name='text'
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
        />
      </label>
      {displayError && <span className={css.errorText}>{displayError}</span>}
    </div>
  );
};
export default InputText;
