import React, { useState, useEffect } from 'react';
import { DeviceListProps, BaseListItem } from './types';
import Button from '../Button';
import css from './DeviceList.module.css';

function DeviceList<T extends BaseListItem = BaseListItem>({
  items,
  visibleText,
  onItemClick,
  onNoDevicesClick,
  itemsPerPage = 4,
}: DeviceListProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

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

  return (
    <div>
      <ul className={css.list}>
        {currentItems.length === 0 && visibleText && (
          <li className={css.itemTextRed}>
            <p className={css.noDevices}>Looks like this device isn't in our system just yet!</p>
            {onNoDevicesClick && (
              <button onClick={onNoDevicesClick} type='button' className={css.noDevicesBtn}>
                Click here to find out what it's worth.
              </button>
            )}
          </li>
        )}

        {currentItems.map(item => {
          return (
            <li className={css.item} key={item.key} onClick={() => onItemClick(item)}>
              <div className={css.itemContent}>
                {item.device_image && <img className={css.deviceImage} src={item.device_image} alt={item.label} />}
                <strong className={css.deviceLabel}>{item.label}</strong>
                <svg className={css.nextIcon} width={9} height={16}>
                  <use href='/img/sprite-icon.svg#next-step' />
                </svg>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={css.paginationWrapper}>
        <Button onClick={handlePrevious} disabled={currentPage === 0}>
          <svg className={css.arrowIcon} width={17} height={16}>
            <use href='/img/sprite-icon.svg#arrow-next-back' />
          </svg>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentPage >= totalPages - 1}>
          Next Page
          <svg className={`${css.arrowIcon} ${css.next}`} width={17} height={16}>
            <use href='/img/sprite-icon.svg#arrow-next-back' />
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default DeviceList;
