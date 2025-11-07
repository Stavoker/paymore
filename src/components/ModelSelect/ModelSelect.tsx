import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ModelSelectProps } from './types';
import { Device } from '../../types/category';
import Mic from '../../img/mic.svg';
import Voice from '../../img/voice.svg';
import Next from '../../img/next.svg';
import ArrowSvg from '../../img/arrow-nex-back.svg';
import Button from '../Button';
import css from './ModelSelect.module.css';

const ModelSelect: React.FC<ModelSelectProps> = props => {
  const {
  catSpec,
  subcatKeys,
  subcategory,
  setSubcategory,
  q,
  setQ,
  items,
  lowMatches,
  category,
  brand,
  model,
  categoryLabel,
} = props;
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(props?.items?.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = props?.items?.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [props?.items?.length]);

  return (
    <div className={css.wrapperModelSelect}>
      <div className={css.wrapperSearch}>
        <input
          className={css.inputSearch}
          type='text'
          name='search'
          value={props?.q}
          onChange={e => props?.setQ(e.target.value)}
          placeholder='Search for a model'
        />
        <div className={css.wrapperBtnIcon}>
          <button className={css.btnIcon} type='button'>
            <svg width={22} height={22}>
              <use href={Mic} />
            </svg>
          </button>
          <button className={css.btnIcon} type='button'>
            <svg width={24} height={24}>
              <use href={Voice} />
            </svg>
          </button>
        </div>
      </div>

      <p className={css.subtitle}>
        <svg width={18} height={18}>
          <use href={Mic} />
        </svg>
        Ai voice assistant. Helps you to enter devices faster{' '}
      </p>
      <p className={css.subtitle}>
        <svg width={18} height={18}>
          <use href={Voice} />
        </svg>
        Barcode reader. Upload image or scan barcode on your device{' '}
      </p>

      <p className={css.title}>Choose device model</p>

      <ul className={css.list}>
        {currentItems.map((item: any) => (
          <li
            className={`${css.item}`}
            key={item.key}
            onClick={() => {
              let cleanKey = item.key;
              cleanKey = cleanKey.replace(/[-_]\d+\s*(GB|TB|MB)$/gi, '');
              cleanKey = cleanKey.replace(/[-_]\d+$/, '');

              const deviceSlug = cleanKey.toLowerCase().replace(/_/g, '-');

              navigate(`/category/${props?.brand}/${props?.model}/${deviceSlug}`, {
                state: {
                  device: item,
                  categoryKey: props?.category,
                  path: `/category/${props?.brand}/${props?.model}/${deviceSlug}`,
                },
              });
            }}
          >
            <div className={css.itemContent}>
              {item.device_image && <img className={css.deviceImage} src={item.device_image} alt={item.label} />}

              <strong className={css.deviceLabel}>{item.label}</strong>
              <svg className={css.nextIcon} width={9} height={16}>
                <use href={Next} />
              </svg>
            </div>
          </li>
        ))}
        {currentItems.length === 0 && <p className={css.noDevices}>No devices found matching your criteria</p>}
      </ul>

      <div className='wrapper-btn-step' style={{ marginTop: '30px' }}>
        <Button onClick={handlePrevious} disabled={currentPage === 0}>
          <svg className={'arrow-icon'} width={17} height={16}>
            <use href={ArrowSvg} />
          </svg>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentPage >= totalPages - 1}>
          Next Page
          <svg className={'arrow-icon next'} width={17} height={16}>
            <use href={ArrowSvg} />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ModelSelect;
