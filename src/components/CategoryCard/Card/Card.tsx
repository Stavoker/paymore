import React from 'react';
import { useNavigate } from 'react-router';
import { Category } from '../../../types/category';
import css from './Card.module.css';

interface CardProps {
  category: Category;
}

const Card: React.FC<CardProps> = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // const parts = category.key.split('_');
    const path = category.key.toLowerCase();

    navigate(`/category/${path}`, {
      state: {
        categoryKey: category.key,
        categoryLabel: category.label,
        categoryId: category.id,
      },
    });
  };

  const pathImg = `/img/category/${category.icon || category.label.replace(/[\s/]+/g, '_')}`;

  return (
    <div className={css.wrapperCard} onClick={handleClick}>
      <h3 className={css.title}>{category.label}</h3>
      <div className={css.imageWrapper}>
        <img className={css.image} src={`${pathImg}.png`} srcSet={`${pathImg}.png 1x, ${pathImg}2x.png 2x`} alt={category.label} />
      </div>
    </div>
  );
};

export default Card;
