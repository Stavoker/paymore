import confetti from 'canvas-confetti';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../Button';
import ButtonRadio from '../ButtonRadio';
import Checkbox from '../Inputs/Checkbox/Checkbox';
import InputText from '../Inputs/InputText';
import css from './NotPurchaseDevice.module.css';
import { createNoVariantRequest } from '../../services/noVariantService';
import { supabase } from '../../lib/supabase';

const NotPurchaseDevice = () => {
  const [deviceModel, setDeviceModel] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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

  const handlePhotoChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
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
    
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("device-images")
        .upload(fileName, file);

      if (error) {
        console.error(error);
        alert("Upload failed");
        return;
      }

      const { data } = supabase.storage
        .from("device-images")
        .getPublicUrl(fileName);

      setImageUrls((prev) => {
        const copy = [...prev];
        copy[2] = data.publicUrl;
        return copy;
      }); // SAVE THIS TO DATABASE
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  // Valid email for disabled button
  const isEmailValid = (email: string) => {
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const descriptionText = {
    Custom: "Get a personalized offer for any device, even if it's not listed!",
    Trade: 'Bring your device in and get a same-day cash or store credit offer!',
    Consign: 'We handle the listing and sale, sit back and get paid when it sells!',
  };

   async function handleOnSubmit() {
      await createNoVariantRequest({
        device_name: deviceModel,
        user_email: email,
        user_name: fullName,
        consignment_type: selectedCondition as string,
        image_1: imageUrls[0],
        image_2: imageUrls[1],
        image_3: imageUrls[2],
      });
    }

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
                required
                value={deviceModel}
                onChange={setDeviceModel}
                placeholder='Example: Samsung Galaxy S23 Ultra'
                label='Write the model name of your device'
              />
            </li>
            <li className={css.inputTextItem}>
              <InputText
                required
                value={fullName}
                onChange={setFullName}
                placeholder='First and Last Name'
                label='Write your first and last name'
              />
            </li>
            <li className={css.inputTextItem}>
              <InputText
                required
                type='email'
                value={email}
                onChange={setEmail}
                placeholder='your@email.com'
                label='Enter your email address'
              />
            </li>
          </ul>

          <p className={css.text}>PayMore does not purchase this item, but we can offer you alternative options:</p>

          <div className={css.wrapperBntRadio}>
            <ButtonRadio
              options={Object.keys(descriptionText) as (string | number)[]}
              value={selectedCondition}
              onChange={handleConditionChange}
              descriptionText={descriptionText}
            />
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
            onClick={async () => {
                  await handleOnSubmit();
                  setCurrentStep(2);
                }}
            colorButton={'green'}
            disabled={!verificationChecked || !selectedCondition || !deviceModel || !fullName || !email || !isEmailValid(email)}
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
