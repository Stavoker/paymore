import React from 'react';
import css from './ButtonRadio.module.css';
import { RadioButtonProps } from './types';

const ButtonRadio: React.FC<RadioButtonProps> = ({ options, value, onChange, descriptionText }) => {
  return (
    <>
      {options.map((option, index) => {
        return (
          <button
            key={index}
            type='button'
            className={`${css.radioLabel} ${value === option ? css.active : ''}`}
            onClick={() => onChange(option)}
          >
            {option}
            {descriptionText && <p className={css.descriptionText}>{descriptionText[option]}</p>}
          </button>
        );
      })}
    </>
  );
};

export default ButtonRadio;
