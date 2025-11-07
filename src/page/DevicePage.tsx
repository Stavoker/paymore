import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { RotatingLines } from 'react-loader-spinner';
import { useNewCategories } from '../hooks/useNewCategories';
import { useDevices as useDevicesForCategory } from '../hooks/useNewDevices';
import ModelSelect from '../components/ModelSelect';
import DeviceDetail from '../components/DeviceDetail';
import StepContainer from '../components/StepContainer/StepContainer';

const MIN_PURCHASE = 100;
const MIN_RESALE = 200;

const DevicePage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const { brand, model, deviceName } = useParams<{ brand: string; model: string; deviceName?: string }>();
  const location = useLocation();
  // const { categories, devices, loading, error } = useCategories();
  const { categories, loading: categoriesLoading, error: categoriesError } = useNewCategories();

  const categoryKey = (location.state as any)?.categoryKey || (brand && model ? `${brand}_${model}`.toLowerCase() : '');
  // selectedCategory (used to fetch devices)
  const selectedCategory = useMemo(() => categories.find((c: any) => c.key === categoryKey) || null, [categories, categoryKey]);
  // pass undefined instead of null so the hook can decide whether to fetch
  const { devices, loading: devicesLoading, error: devicesError } = useDevicesForCategory(selectedCategory?.id ?? undefined);
  const loading = !!(categoriesLoading || devicesLoading);
  const error = (categoriesError || devicesError) as any;

  // const categoryKey = (location.state as any)?.categoryKey || (brand && model ? `${brand}_${model}`.toLowerCase() : '');
  const [q, setQ] = useState<string>('');

  useEffect(() => {
    if (deviceName) {
      setStep(2);
    } else if (brand && model) {
      setStep(1);
      setQ('');
    }
  }, [deviceName, brand, model]);

  const selectedDevice: any = useMemo(() => {
    if (!deviceName || !devices.length) return null;
    return devices.find((d: any) => {
      let cleanKey = d.key;
      cleanKey = cleanKey.replace(/[-_]\d+\s*(GB|TB|MB)$/gi, '');
      cleanKey = cleanKey.replace(/[-_]\d+$/, '');

      const deviceSlug = cleanKey.toLowerCase().replace(/_/g, '-');

      return deviceSlug === deviceName.toLowerCase();
    });
  }, [deviceName, devices]);

  const catSpec: any = useMemo(() => {
    if (!categories.length) return {};
    const cat = categories.find((c: any) => c.key === categoryKey);
    if (!cat) return {};
    // Use devices list filtered by category
    // const dev = devices;
    // debugger;
    const items = (devices || []).filter((d: any) => {
      return d.category_id === cat.id || d.category_key === cat.key || d.category === cat.key;
    });

    return {
      label: cat.label,
      items,
    };
  }, [categories, devices, categoryKey]);

  // const subcatKeys = useMemo(() => Object.keys(catSpec.subcategories || {}), [catSpec]);

  // useEffect(() => {
  //   const newSubcategory = subcatKeys.length ? subcatKeys[0] : '';
  //   setSubcategory(newSubcategory);
  // }, [subcatKeys, deviceName]); // Добавили deviceName чтобы сбрасывать при возврате

  const deviceList = useMemo(() => {
    return catSpec.items || [];
  }, [catSpec]);

  const deviceVariants: any[] = useMemo(() => {
    if (!deviceName || !deviceList.length) return [];

    return deviceList.filter((d: any) => {
      let cleanKey = d.key;
      cleanKey = cleanKey.replace(/[-_]\d+\s*(GB|TB|MB)$/gi, '');
      cleanKey = cleanKey.replace(/[-_]\d+$/, '');

      const deviceSlug = cleanKey.toLowerCase().replace(/_/g, '-');

      return deviceSlug === deviceName.toLowerCase();
    });
  }, [deviceName, deviceList]);

  const filteredDevices = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return deviceList;

    return deviceList.filter((d: any) => [d.label, d.brand, d.model].filter(Boolean).join(' ').toLowerCase().includes(query));
  }, [deviceList, q]);

  // const uniqueDevices = useMemo(() => {
  //   const deviceMap = new Map<string, any>();

  //   filteredDevices.forEach((d: any) => {
  //     const modelKey = `${d.brand}_${d.model}`.replace(/\s*\d+\s*(GB|TB|MB)/gi, '').toUpperCase();

  //     if (!deviceMap.has(modelKey)) {
  //       deviceMap.set(modelKey, d);
  //     }
  //   });

  //   return Array.from(deviceMap.values());
  // }, [filteredDevices]);

  const items = useMemo(() => devices, [devices]);

  return (
    <>
      {loading && (
        <RotatingLines
          visible={true}
          height='36'
          width='36'
          color='#45B549'
          strokeWidth='5'
          animationDuration='0.75'
          ariaLabel='rotating-lines-loading'
          wrapperStyle={{}}
          wrapperClass='spinner-wrapper'
        />
      )}
      {error && <div style={{ padding: '20px', color: 'red' }}>Error: {String(error)}</div>}
      {!loading && !error && (
        <StepContainer step={step}>
          {!loading && !error && catSpec.label && selectedDevice && (
            <DeviceDetail
              device={selectedDevice}
              deviceVariants={deviceVariants}
              catSpec={catSpec}
              category={categoryKey}
              step={step}
              setStep={setStep}
            />
          )}
          {!loading && !error && catSpec.label && !selectedDevice && step === 1 && (
            <ModelSelect
              catSpec={catSpec}
              q={q}
              setQ={setQ}
              items={items}
              category={categoryKey}
              brand={brand || ''}
              model={model || ''}
              categoryLabel={catSpec.label}
            />
          )}
        </StepContainer>
      )}
    </>
  );
};

export default DevicePage;
