import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import confetti from 'canvas-confetti';
import Checkbox from '../components/Inputs/Checkbox';
import Button from '../components/Button';
import { createQuote } from '../services/quoteService';

const OfferClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const price = location.state?.salePrice || 0;
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedCategoryId] = useState<number | null>(location.state?.selectedCategoryId || location.state?.categoryId || null);
  const [selectedDeviceId] = useState<number | null>(location.state?.selectedDeviceId || null);
  const [selectedDeviceVariantId] =  useState<number | null>(location.state?.selectedDeviceVariantId || null);
  const [questionAnswersIds] = useState<number | null>(location.state?.questionAnswersIds || null);
  const [deviceName] = useState<string | null>(location.state?.deviceName || null);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

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
    launchConfetti();
  }, [launchConfetti]);

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate('/category');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  async function handleOnSubmit() {
    await createQuote({
      device_id: selectedDeviceId,
      device_variant_id: selectedDeviceVariantId,
      sale_price: price,
      device_name: deviceName,
      email: email,
      phone: phone,
      name: name,
      options: {questionAnswersIds: questionAnswersIds}
    });
  }

  return (
    <div className='wrapper-offer-claim-page'>
      <div className='offer-claim-page'>
        <h1 className='offer-claim-page-title'>Congratulations 🎉</h1>
        <p className='offer-claim-page-subtitle'>Your offer is ready, claim your cash!</p>

        <p className='offer-claim-page-amount'>
          <span className='amount-text'>
            {price}
            <span className='cad-text'>CAD</span>
          </span>
        </p>

        <p className='offer-claim-page-expiry'>Hold expires in {formatTime(timeLeft)}</p>

        <label className='offer-claim-page-label'>
          Enter your name
          <input className='offer-claim-page-input' type='text' placeholder='Your Name' value={name}
            onChange={(e) => setName(e.target.value)} />
        </label>
        <label className='offer-claim-page-label'>
          Enter your email
          <input className='offer-claim-page-input' type='email' placeholder='your@email.com' value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className='offer-claim-page-label'>
          Enter your Phone number
          <input className='offer-claim-page-input' type='tel' placeholder='(123) 456-7890' value={phone}
            onChange={(e) => setPhone(e.target.value)} />
        </label>
         <label className='offer-claim-page-label'>
          Code
          <input className='offer-claim-page-input' type='text' placeholder='Enter code' />
        </label>

        {/* <label className='offer-claim-page-label'>
          4 -digit commission / rewards code (optional)
          <input className='offer-claim-page-input' type='number' placeholder='1234' />
        </label> */}

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

        <Button disabled={!verificationChecked} 
                onClick={async () => {
                  await handleOnSubmit();
                  navigate('/category');
                }}
                colorButton={'green'}>
          Claim my cash now
        </Button>
      </div>
    </div>
  );
};
export default OfferClaimPage;
