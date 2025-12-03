import { DeviceItem } from '../DeviceList/types';
import DeviceList from '../DeviceList';
import InputSearch from '../Inputs/InputSearch';
import { ModelSelectProps } from './types';
import React from 'react';
import css from './ModelSelect.module.css';
import { useNavigate } from 'react-router';

const ModelSelect: React.FC<ModelSelectProps> = ({
  items,
  category,
  brand,
  model,
  setDeviceSearchTerm,
  deviceSearchTerm,
  setSelectedDevice,
  setStep,
}) => {
  const navigate = useNavigate();

  const handleItemClick = (item: DeviceItem) => {
    let cleanKey = item.key;
    cleanKey = cleanKey.replace(/[-_]\d+\s*(GB|TB|MB)$/gi, '');
    cleanKey = cleanKey.replace(/[-_]\d+$/, '');

    const deviceSlug = cleanKey.toLowerCase().replace(/_/g, '-');
    setSelectedDevice(item.id);
    navigate(`/category/${brand}/${deviceSlug}`, {
      state: {
        device: item,
        categoryKey: category,
        path: `/category/${brand}/${deviceSlug}`,
      },
    });
  };

  const handleNoDevicesClick = () => {
    setStep?.(0);
  };

  return (
    <div className={css.wrapperModelSelect}>
      <InputSearch voice value={deviceSearchTerm} onChange={setDeviceSearchTerm} placeholder='Search for a model' />

      <p className={css.subtitle}>
        <img width={18} height={18} src='/img/microphone-2.png' alt='Voice input' />
         Ai voice assistant. Helps you to enter devices faster{' '}
      </p>
      <p className={css.subtitle}>
        <img width={24} height={24} src='/img/barcode.png' alt='Barcode' />
        Barcode reader. Upload image or scan barcode on your device{' '}
      </p>

      {items.length !== 0 && <p className={css.title}>Choose device model</p>}
      <DeviceList
        visibleText
        items={items}
        onItemClick={handleItemClick}
        onNoDevicesClick={handleNoDevicesClick}
        itemsPerPage={4}
        showPagination={true}
      />
    </div>
  );
};

export default ModelSelect;
