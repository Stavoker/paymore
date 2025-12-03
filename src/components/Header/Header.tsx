import { Link } from 'react-router';
import React from 'react';
import css from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={css.header}>
      <Link to='/category'>
        <img className={css.headerLogo} src='/img/sprite-icon-logo.svg' alt='Logo' />
      </Link>
    </header>
  );
};

export default Header;
