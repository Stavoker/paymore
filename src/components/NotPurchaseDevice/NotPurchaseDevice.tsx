import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import confetti from 'canvas-confetti';
import Button from '../Button';
import Checkbox from '../Inputs/Checkbox/Checkbox';
import ButtonRadio from '../ButtonRadio';
import css from './NotPurchaseDevice.module.css';
import InputText from '../Inputs/InputText';

const NotPurchaseDevice = () => {
  const [deviceModel, setDeviceModel] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState<string | number>('');
  const [verificationChecked, setVerificationChecked] = useState(false);
  const navigate = useNavigate();

  // Confetti animation
  const makeShot = useCallback((particleRatio: number, opts: any): void => {
    const config = { ...opts, origin: { y: 0.7 }, particleCount: Math.floor(200 * particleRatio) };
    confetti(config);
  }, []);

  const launchConfetti = useCallback((): void => {
    makeShot(0.25, { spread: 26, startVelocity: 55 });
    makeShot(0.2, { spread: 60 });
    makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    makeShot(0.1, { spread: 120, startVelocity: 45 });
  }, [makeShot]);

  useEffect(() => {
    if (currentStep === 2) {
      launchConfetti();
    }
  }, [launchConfetti, currentStep]);

  const handleConditionChange = (value: string | number) => {
    setSelectedCondition(value);
  };

  const handlePhotoChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...photos];
        newPhotos[index] = reader.result as string;
        setPhotos(newPhotos);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  return (
    <div className={css.wrapperNotPurchaseDevice}>
      {currentStep < 2 && (
        <>
          <p className={css.title}>Upload up to 3 photos of your device</p>

          <ul className={css.photoListsWrapper}>
            {photos.map((photo, index) => (
              <li key={index} className={css.photoItemWrapper}>
                <input
                  type='file'
                  accept='image/*'
                  onChange={e => handlePhotoChange(index, e)}
                  className={css.photoInput}
                  id={`photo-${index}`}
                />
                <label htmlFor={`photo-${index}`} className={css.photoLabel}>
                  {photo && (
                    <>
                      <img src={photo} alt={`Device ${index + 1}`} className={css.photoPreview} />
                      <button
                        type='button'
                        onClick={e => {
                          e.preventDefault();
                          handleRemovePhoto(index);
                        }}
                        className={css.removePhotoBtn}
                      ></button>
                    </>
                  )}
                </label>
              </li>
            ))}
          </ul>

          <ul className={css.inputTextListsWrapper}>
            <li className={css.inputTextItem}>
              <InputText
                value={deviceModel}
                onChange={setDeviceModel}
                placeholder='Example: Samsung Galaxy S23 Ultra'
                label='Write the model name of your device'
              />
            </li>
            <li className={css.inputTextItem}>
              <InputText value={fullName} onChange={setFullName} placeholder='First and Last Name' label='Write your first and last name' />
            </li>
            <li className={css.inputTextItem}>
              <InputText type='email' value={email} onChange={setEmail} placeholder='your@email.com' label='Enter your email address' />
            </li>
          </ul>

          <p className={css.text}>PayMore does not purchase this item, but we can offer you alternative options:</p>

          <div className={css.wrapperBntRadio}>
            <ButtonRadio options={['Recycle', 'Donate', 'Consign']} value={selectedCondition} onChange={handleConditionChange} />
          </div>

          <div className='wrapper-verification'>
            <Checkbox
              label={
                <p>
                  I agree to the store’s verification & payout policies.
                  <span className='view-rewards-btn'>View rewards</span>
                </p>
              }
              checked={verificationChecked}
              onChange={e => setVerificationChecked(e.target.checked)}
            />
          </div>

          <Button
            onClick={() => {
              setCurrentStep(2);
            }}
            colorButton={'green'}
            disabled={!verificationChecked || !selectedCondition}
          >
            Send Request
          </Button>
        </>
      )}

      {currentStep === 2 && (
        <div className={css.wrapperOfferClaimPage}>
          <div className={css.offerClaimPage}>
            <h1 className={css.offerClaimPageTitle}>Congratulations 🎉</h1>
            <p className={css.congratulationsText}>We've received your item. We'll respond to your email within a few days</p>

            <Button
              style={{ fontWeight: 600, fontSize: 22, lineHeight: '20px' }}
              onClick={() => navigate('/category')}
              colorButton={'green'}
            >
              Return to the main page
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotPurchaseDevice;
