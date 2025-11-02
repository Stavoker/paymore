import { useState } from 'react'
import { useCategories } from './hooks/useNewCategories'
import { useSubcategories } from './hooks/useNewSubcategories'
import { useDevices } from './hooks/useNewDevices'
import { DeviceDetail } from './components/DeviceDetail'

export default function CategoryBrowser() {
  const { categories, loading: loadingCategories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const { subcategories, loading: loadingSubcategories } = useSubcategories(selectedCategory)
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null)

  const { devices, loading: loadingDevices } = useDevices(selectedSubcategory)

  return (
    <div className="p-6 space-y-6">
      {/* Categories */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        {loadingCategories ? (
          <p>Loading categories...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-3 py-2 rounded border ${
                  selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setSelectedSubcategory(null) // reset device view
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Subcategories */}
      {selectedCategory && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Subcategories</h2>
          {loadingSubcategories ? (
            <p>Loading subcategories...</p>
          ) : subcategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  className={`px-3 py-2 rounded border ${
                    selectedSubcategory === sub.id ? 'bg-green-600 text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => setSelectedSubcategory(sub.id)}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          ) : (
            <p>No subcategories found.</p>
          )}
        </section>
      )}

      {/* Devices */}
      {selectedSubcategory && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Devices</h2>
          {loadingDevices ? (
            <p>Loading devices...</p>
          ) : devices.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {devices.map((device) => (
                <div key={device.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <h3 className="font-medium text-lg">{device.label}</h3>
                  <p className="text-sm text-gray-600">{device.brand}</p>
                  {device.device_image && (
                    <img
                      src={device.device_image}
                      alt={device.label}
                      className="mt-2 w-full rounded-lg object-cover"
                    />
                  )}
                  <DeviceDetail deviceId={device.id} />
                </div>
              ))}
            </ul>
          ) : (
            <p>No devices found.</p>
          )}
        </section>
      )}
    </div>
  )
}


// import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import { ChevronRight, ArrowRight, ArrowLeft, Smartphone, Laptop, Gamepad2, Headphones as HeadphonesIcon, Music2, Monitor, Cpu, Keyboard, ScanFace, Camera, Speaker, Mic, Upload, Phone, Info, ArrowUpDown } from "lucide-react";
// import './App.css';
// import { SuccessPage } from './components/SuccessPage';
// import { ErrorPage } from './components/ErrorPage';
// import { useCategories } from './hooks/useCategories';
// import { useAuth, useSupabase } from './hooks/useSupabase';
// import { getPriceForDevice } from './utils/priceListService';
// import confetti from "canvas-confetti";

// /**
//  * Pay More Free Quote Shopify Widget — r13.1 PREVIEW (bugfix)
//  *
//  * Fixes
//  * - Resolved unterminated string constant and several small JSX typos.
//  * - Completed Step 2 form markup and actions.
//  * - Ensured every string/prop is properly closed and component compiles.
//  *
//  * Highlights
//  * - "Upload Photo or Scan Barcode" flow (file upload + BarcodeDetector when available)
//  * - Voice input (Web Speech API) with a prominent mic button
//  * - Optional fields truly optional (you can continue to Page 2)
//  * - Rewards code + rewards pop‑up
//  * - Hero icon + grading legend
//  * - 10‑minute quote hold timer + sound/coin celebration, then redirect
//  */

// // ---------------- Business rules ----------------
// const MIN_PURCHASE = 100; // CAD buy floor
// const MIN_RESALE = 200;   // CAD resale floor

// const STORE_NAME = "PayMore Toronto Downtown";
// const PAYMORE_LOCAL_E164 = "+14168154588";
// const PAYMORE_LOCAL_HUMAN = "(416) 815-4588";
// const STORE_GOOGLE_MAPS = "https://www.google.com/maps/search/?api=1&query=PayMore+Toronto+Downtown";

// // Theme
// // const CTA_GREEN = "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500";

// // Google Sheet webhook (Apps Script). Override at runtime via window.PAYMORE_SHEET_WEBHOOK
// const SHEET_WEBHOOK = (typeof window !== "undefined" && (window as any).PAYMORE_SHEET_WEBHOOK) || null;

// // Thank-you + audio configuration (override at runtime with window.*)
// const THANKYOU_URL = (typeof window !== "undefined" && (window as any).PAYMORE_THANKYOU_URL) || "/thank-you/quote-locked";
// const SOUND_URL = (typeof window !== "undefined" && (window as any).PAYMORE_SOUND_URL) || "/assets/locked-chime.mp3"; // ~3s chime
// const CASH_SOUND_URL = (typeof window !== "undefined" && (window as any).PAYMORE_CASH_SOUND_URL) || "/assets/cash-register.mp3";
// const SOUND_START = (typeof window !== "undefined" && (window as any).PAYMORE_SOUND_START_SEC) || 0; // seconds
// // Removed SOUND_DURATION_MS as it's no longer used
// // const COIN_URL = (typeof window !== "undefined" && (window as any).PAYMORE_COIN_URL) || "/assets/paymore-coin.png";

// // Barcode Lookup (optional)
// const BARCODELOOKUP_KEY = (typeof window !== "undefined" && (window as any).PAYMORE_BARCODELOOKUP_API_KEY) || null;
// const BARCODELOOKUP_URL = (typeof window !== "undefined" && (window as any).PAYMORE_BARCODELOOKUP_URL) || "https://api.barcodelookup.com/v3/products";
// const BARCODELOOKUP_PROXY = (typeof window !== "undefined" && (window as any).PAYMORE_BARCODELOOKUP_PROXY) || null; // if you deploy Apps Script proxy

// // ---------------- Tiny UI primitives ----------------
// const cn = (...x: Array<string | false | null | undefined>) => x.filter(Boolean).join(" ");
// const SafeIcon = ({ Comp, className = "" }: { Comp: any; className?: string }) => (typeof Comp === "function" ? <Comp className={className} /> : <span className={cn("inline-block rounded bg-zinc-200", className)} />);

// const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <div className="paymore-container">
//     <div className="paymore-main">
//       <div className="paymore-header">
//         <div className="paymore-header-content">
//           <div className="paymore-header-left">
//             <h1 className="paymore-header-title">
//               <img src="/logo.png" alt="PayMore Logo" />
//             </h1>
//           </div>
//           <div className="paymore-header-right">
//             <div className="paymore-header-info-item">
//               <Phone className="paymore-header-info-icon" />
//               Phone
//               <div className="paymore-header-info-tooltip">
//                 {PAYMORE_LOCAL_HUMAN}
//               </div>
//             </div>
//             <div className="paymore-header-info-item">
//               <Info className="paymore-header-info-icon" />
//               Address
//               <div className="paymore-header-info-tooltip">
//                 577 Yonge St #102, Toronto
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="paymore-header-nav">
//           <span className="paymore-header-nav-item">Trade‑In</span>
//           <span className="paymore-header-nav-arrow">
//             <ArrowUpDown size={12} />
//           </span>
//           <span className="paymore-header-nav-item active">Live Preview</span>
//         </div>
//       </div>
//       <div className="paymore-content">{children}</div>
//     </div>
//   </div>
// );

// const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
//   <div className={cn("paymore-card", className)}>{children}</div>
// );
// const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="px-5 pt-5">{children}</div>;
// const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (<div className={cn("text-base font-semibold text-zinc-900", className)}>{children}</div>);
// const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (<div className={cn("px-5 pb-5", className)}>{children}</div>);
// const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
//   <span className={cn("paymore-badge", className)}>{children}</span>
// );
// // const Pill: React.FC<{ className?: string; color?: 'zinc' | 'green' | 'yellow' | 'orange' | 'red'; children: React.ReactNode }> = ({ className = "", color = "zinc", children }) => (
// //   <span className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold border",
// //     color === 'zinc' && "text-zinc-700 bg-zinc-50 border-zinc-200",
// //     color === 'green' && "text-green-700 bg-green-50 border-green-200",
// //     color === 'yellow' && "text-yellow-700 bg-yellow-50 border-yellow-200",
// //     color === 'orange' && "text-orange-700 bg-orange-50 border-orange-200",
// //     color === 'red' && "text-red-700 bg-red-50 border-red-200",
// //     className)}>{children}</span>
// // );
// const Button: React.FC<{ variant?: 'solid' | 'ghost' | 'outline'; className?: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ variant = "solid", className = "", children, ...props }) => (
//   <button {...props} className={cn(
//     "paymore-button",
//     variant === "solid" && "paymore-button-solid",
//     variant === "ghost" && "paymore-button-ghost",
//     variant === "outline" && "paymore-button-outline",
//     className
//   )}>{children}</button>
// );
// const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (<label className="grid gap-1"><span className="paymore-field-label">{label}</span>{children}</label>);
// const Money: React.FC<{ amount: number; currency?: string }> = ({ amount, currency = "CAD" }) => (<span className="tabular-nums">{Number(amount||0).toLocaleString("en-CA", { style: "currency", currency })}</span>);

// // ---------------- Icons + Categories ----------------
// const ICONS: Record<string, any> = { smartphone: Smartphone, laptop: Laptop, gamepad2: Gamepad2, headphones: HeadphonesIcon, music: Music2, monitor: Monitor, cpu: Cpu, keyboard: Keyboard, scanface: ScanFace, camera: Camera, speaker: Speaker };
// const DeviceIcon: React.FC<{ name?: string }> = ({ name }) => <SafeIcon Comp={ICONS[name || 'smartphone'] || Smartphone} className="h-6 w-6 text-zinc-700" />;

// // Component for displaying device image with fallback
// const DeviceImage: React.FC<{ 
//   imageUrl?: string; 
//   icon?: string; 
//   categoryIcon?: string; 
//   size?: 'small' | 'medium' | 'large';
// }> = ({ imageUrl, icon, categoryIcon, size = 'medium' }) => {
//   const [imageError, setImageError] = useState(false);
  
//   const sizeClass = size === 'small' ? 'device-image-small' : 
//                    size === 'large' ? 'device-image-large' : 
//                    'device-image-medium';
  
//   if (imageUrl && !imageError) {
//     return (
//       <div className={`device-image-container ${sizeClass}`}>
//         <img 
//           src={imageUrl} 
//           alt="Device" 
//           className="device-image"
//           onError={() => setImageError(true)}
//           onLoad={() => setImageError(false)}
//         />
//       </div>
//     );
//   }
  
//   // Fallback to icon
//   return (
//     <div className={`device-image-container fallback ${sizeClass}`}>
//       <DeviceIcon name={icon || categoryIcon || 'smartphone'} />
//     </div>
//   );
// };

// // ---------------- Utilities ----------------
// async function postToSheet(payload: any){
//   if (!SHEET_WEBHOOK) return { ok: false, message: 'No webhook configured' };
//   try {
//     await fetch(SHEET_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), mode: 'no-cors' });
//     return { ok: true };
//   } catch (e) { console.error('Sheet POST failed', e); return { ok: false, message: String(e) }; }
// }

// function buildBarcodeLookupUrl(code: string){
//   if (BARCODELOOKUP_PROXY) return `${BARCODELOOKUP_PROXY}?barcode=${encodeURIComponent(code)}`;
//   if (BARCODELOOKUP_KEY) return `${BARCODELOOKUP_URL}?barcode=${encodeURIComponent(code)}&key=${encodeURIComponent(BARCODELOOKUP_KEY)}`;
//   return null;
// }

// // ---------------- Main App ----------------
// export default function App(){
//   // Supabase hooks
//   const { user } = useAuth();
//   const { insertData } = useSupabase();
//   const { categories, subcategories, devices, loading: categoriesLoading, error: categoriesError } = useCategories();

//   const [step, setStep] = useState(1);
//   const [mode, setMode] = useState<'sell'|'buy'>('sell');
//   const [category, setCategory] = useState<string>('');
//   const [subcategory, setSubcategory] = useState('');
//   const [selected, setSelected] = useState<any>(null);

//   // device details
//   const [hasCharger, setHasCharger] = useState(false);
//   const [hasBox, setHasBox] = useState(false);
//   const [battery, setBattery] = useState(90);
//   const [condition, setCondition] = useState<'Like New'|'Good'|'Fair'|''>('');
//   const [unlocked, setUnlocked] = useState(true); // Add unlocked state

//   // customer
//   const [isBusiness, setIsBusiness] = useState(false);
//   const [bizQty, setBizQty] = useState(1);
//   const [agree, setAgree] = useState(false);
//   const [first, setFirst] = useState('');
//   const [last, setLast] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');

//   // search + model code
//   const [q, setQ] = useState('');
//   const [showList, setShowList] = useState(false);
//   const [modelCode, setModelCode] = useState(''); // UPC/GTIN/MPN free text

//   // identifiers
//   const [imei, setImei] = useState('');
//   const [serial, setSerial] = useState('');

//   // barcode lookup state
//   const [lookupLoading, setLookupLoading] = useState(false);
//   const [lookupError, setLookupError] = useState('');
//   const [lookup, setLookup] = useState<any>(null);

//   // voice
//   const [listening, setListening] = useState(false);
//   const searchRef = useRef<HTMLInputElement>(null);
//   const [showLow, setShowLow] = useState(false);

//   // celebration + audio
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [showError, setShowError] = useState(false);
//   const [bannerText, setBannerText] = useState('');
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const cashAudioRef = useRef<HTMLAudioElement>(null);

//   // rewards
//   const [rewardCode, setRewardCode] = useState('');
//   const [showRewards, setShowRewards] = useState(false);

//   // 10-minute lock timer
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [quoteExpired, setQuoteExpired] = useState(false);

//   // Validation state
//   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
//   const [highlightCategory, setHighlightCategory] = useState(false);

//   // start at step 1
//   useEffect(() => { setStep(1); setMode('sell'); }, []);

//   // Confetti animation
//   const makeShot = (particleRatio: number, opts: any): void => {
//     const config = {...opts, origin: { y: 0.7 }, particleCount: Math.floor(200 * particleRatio)};
//     confetti(config);
//   };

//   const launchConfetti = (): void => {
//     makeShot(0.25, {spread: 26, startVelocity: 55});
//     makeShot(0.2, {spread: 60});
//     makeShot(0.35, {spread: 100, decay: 0.91, scalar: 0.8});
//     makeShot(0.1, {spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2});
//     makeShot(0.1, {spread: 120, startVelocity: 45});
//   };

//   // handle subcategory defaults
//   // Get category data from Supabase
//   const catSpec: any = useMemo(() => {
//     if (!categories.length) return {};
//     const cat = categories.find(c => c.key === category);
//     if (!cat) return {};
    
//     return {
//       label: cat.label,
//       subcategories: subcategories
//         .filter((sub: any) => sub.category_id === cat.id)
//         .reduce((acc: any, sub: any) => {
//           acc[sub.key] = {
//             label: sub.label,
//             items: devices.filter((d: any) => d.subcategory_id === sub.id)
//           };
//           return acc;
//         }, {}),
//       items: devices.filter((d: any) => d.category_id === cat.id && !d.subcategory_id)
//     };
//   }, [categories, subcategories, devices, category]);
//   const subcatKeys = useMemo(() => Object.keys(catSpec.subcategories || {}), [catSpec]);
//   useEffect(() => {
//     if (subcatKeys.length) setSubcategory(subcatKeys[0]); else setSubcategory('');
//     setSelected(null);
//     setShowList(false);
//   }, [category, subcatKeys]);

//   // items visible
//   const items = useMemo(() => {
//     let list: any[] = [];
//     if (catSpec.subcategories && subcategory && catSpec.subcategories[subcategory]) {
//       list = catSpec.subcategories[subcategory].items || [];
//     } else {
//       list = catSpec.items || [];
//     }
//     const minGated = (list || []).filter(d => Number(d.buy_min||0) >= MIN_PURCHASE && Number(d.resale_floor||0) >= MIN_RESALE);
//     const query = q.trim().toLowerCase();
//     if (!query) return minGated;
//     return minGated.filter(d => [d.label, d.brand, d.model].filter(Boolean).join(' ').toLowerCase().includes(query));
//   }, [catSpec, subcategory, q]);

//   const lowMatches = useMemo(() => {
//     let list: any[] = [];
//     if (catSpec.subcategories && subcategory && catSpec.subcategories[subcategory]) {
//       list = catSpec.subcategories[subcategory].items || [];
//     } else {
//       list = catSpec.items || [];
//     }
//     const query = q.trim().toLowerCase();
//     const lows = (list || []).filter((d: any) => {
//       const match = !query || [d.label, d.brand, d.model].filter(Boolean).join(' ').toLowerCase().includes(query);
//       const ok = Number(d.buy_min||0) >= MIN_PURCHASE && Number(d.resale_floor||0) >= MIN_RESALE;
//       return match && !ok;
//     });
//     return lows;
//   }, [catSpec, subcategory, q]);

//   // payout calculation using the new offer calculator logic
//   const [payout, setPayout] = useState(0);
  
//   useEffect(() => {
//     const calculatePayout = async () => {
//       if (!selected || mode !== 'sell') {
//         setPayout(0);
//         return;
//       }
      
//       try {
//         // Map condition to the correct format
//         let conditionType: 'Excellent' | 'Good' | 'Fair' = 'Excellent';
//         if (condition === 'Good') conditionType = 'Good';
//         else if (condition === 'Fair') conditionType = 'Fair';
        
//         // Use the first available storage option if storage is not set
//         const storageToUse = selected.storage || 
//                             (selected.storageOptions && selected.storageOptions.length > 0 ? selected.storageOptions[0] : '128GB');
        
//         // Get price from database using the new calculator
//         console.log('Calculating payout for:', {
//           deviceName: selected.label || selected.model || 'iPhone',
//           storage: selected.storage,
//           storageOptions: selected.storageOptions,
//           storageToUse: storageToUse,
//           condition: conditionType,
//           hasBox,
//           hasCharger,
//           unlocked,
//           battery,
//           selected: selected
//         });
        
//         const priceResult = await getPriceForDevice(
//           selected.label || selected.model || 'iPhone', // device name
//           storageToUse, // storage - use first available option
//           conditionType,
//           hasBox, // original box
//           hasCharger, // original charger
//           unlocked, // unlocked
//           battery // battery percentage
//         );
        
//         console.log('Price result:', priceResult);
        
//         if (!priceResult) {
//           setPayout(0);
//           return;
//         }
        
//         let finalOffer = priceResult.final_price || 0;
        
//         // Apply business quantity multiplier if applicable
//         if (isBusiness) {
//           finalOffer *= Math.max(1, Math.min(30, bizQty));
//         }
        
//         setPayout(Math.max(finalOffer, 0));
//       } catch (error) {
//         console.error('Error calculating payout:', error);
//         setPayout(0);
//       }
//     };
    
//     calculatePayout();
//   }, [selected, mode, battery, condition, hasCharger, hasBox, unlocked, isBusiness, bizQty]);

//   const eligible = useMemo(()=> selected ? (Number(selected.buy_min||0) >= MIN_PURCHASE && Number(selected.resale_floor||0) >= MIN_RESALE) : false, [selected]);

//   // lock timer when step3 sell
//   useEffect(() => {
//     let t: any;
//     const run = (step === 3 && mode === 'sell');
//     if (run) {
//       setQuoteExpired(false);
//       setTimeLeft(10 * 60); // 10 minutes
//       t = setInterval(() => {
//         setTimeLeft(s => {
//           if (s <= 1) { clearInterval(t); setQuoteExpired(true); return 0; }
//           return s - 1;
//         });
//       }, 1000);
//     }
//     return () => { if (t) clearInterval(t); };
//   }, [step, mode]);

//   // basic self-tests
//   useEffect(() => {
//     try {
//       const url = buildBarcodeLookupUrl('0123456789012');
//       if ((BARCODELOOKUP_KEY || BARCODELOOKUP_PROXY) && (!url || !/barcode=0123456789012/.test(url!))) console.warn('[PayMore Widget] buildBarcodeLookupUrl failed');
//       if (MIN_PURCHASE >= MIN_RESALE) console.warn('[PayMore Widget] MIN_PURCHASE should be < MIN_RESALE');
//     } catch (e) { console.warn('[PayMore Widget] self-test error', e); }
//   }, []);

//   function mmss(sec: number){
//     const m = Math.floor(sec / 60).toString().padStart(2,'0');
//     const s = (sec % 60).toString().padStart(2,'0');
//     return `${m}:${s}`;
//   }

//   // Validation functions
//   const validateEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validatePhone = (phone: string) => {
//     const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
//     return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
//   };

//   const validateField = (fieldName: string, value: string | number | boolean) => {
//     let error = '';
    
//     switch (fieldName) {
//       case 'first':
//       case 'last':
//         if (!String(value).trim()) {
//           error = 'This field is required';
//         } else if (String(value).trim().length < 2) {
//           error = 'Must be at least 2 characters';
//         }
//         break;
//       case 'email':
//         if (!String(value).trim()) {
//           error = 'Email is required';
//         } else if (!validateEmail(String(value))) {
//           error = 'Please enter a valid email';
//         }
//         break;
//       case 'phone':
//         if (!String(value).trim()) {
//           error = 'Phone number is required';
//         } else if (!validatePhone(String(value))) {
//           error = 'Please enter a valid phone number';
//         }
//         break;
//       case 'battery':
//         if (typeof value === 'number' && (value < 0 || value > 100)) {
//           error = 'Battery percentage must be between 0 and 100';
//         }
//         break;
//       case 'condition':
//         if (!String(value).trim()) {
//           error = 'Please select a condition';
//         }
//         break;
//       case 'agree':
//         if (!value) {
//           error = 'You must agree to the policies to continue';
//         }
//         break;
//     }
    
//     setValidationErrors(prev => ({
//       ...prev,
//       [fieldName]: error
//     }));
    
//     return !error;
//   };

//   const getInputClassName = (fieldName: string, value: string | number | boolean) => {
//     const baseClass = 'paymore-input';
//     const error = validationErrors[fieldName];
    
//     if (error) {
//       return `${baseClass} paymore-input-error`;
//     } else if (String(value).trim()) {
//       return `${baseClass} paymore-input-valid`;
//     } else {
//       return `${baseClass} paymore-input-empty`;
//     }
//   };

//   const canProceedToNextStep = () => {
//     if (step === 1) {
//       // Required fields: Category and Search (if user wants to search)
//       // Check if category is not empty and not the placeholder option
//       const hasValidCategory = category && category !== '';
//       return hasValidCategory && (q.trim() || selected);
//     }
//     if (step === 2) {
//       return first.trim() && last.trim() && email.trim() && phone.trim() && 
//              !validationErrors.first && !validationErrors.last && 
//              !validationErrors.email && !validationErrors.phone &&
//              !validationErrors.battery && !validationErrors.condition &&
//              !validationErrors.agree &&
//              // All checkboxes are required to be checked
//              isBusiness !== undefined && hasCharger !== undefined && hasBox !== undefined &&
//              // Agreement checkbox is required
//              agree;
//     }
//     if (step === 3) {
//       return agree && selected && eligible && !quoteExpired;
//     }
//     return false;
//   };

//   const handleContinueClick = () => {
//     if (canProceedToNextStep()) {
//       next();
//     } else {
//       // Validate all fields to show red borders
//       if (step === 1) {
//         // For step 1, we'll add validation for category and search
//         if (!category || category === '') {
//           setValidationErrors(prev => ({ ...prev, category: 'Please select a category' }));
//         }
//         if (!q.trim() && !selected) {
//           setValidationErrors(prev => ({ ...prev, search: 'Please enter a search term or select a device' }));
//         }
//       } else if (step === 2) {
//         validateField('first', first);
//         validateField('last', last);
//         validateField('email', email);
//         validateField('phone', phone);
//         validateField('battery', battery);
//         validateField('condition', condition);
//         validateField('agree', agree);
//       }
//     }
//   };

//   const handleBrowseModels = () => {
//     // Scroll to top of page
//     window.scrollTo({ top: 0, behavior: 'smooth' });
    
//     // Highlight category input
//     setHighlightCategory(true);
    
//     // Show list
//     setShowList(true);
    
//     // Remove highlight after 2 seconds
//     setTimeout(() => {
//       setHighlightCategory(false);
//     }, 2000);
//   };

//   function buildExportPayload(){
//     const eligible = selected ? (Number(selected.buy_min||0) >= MIN_PURCHASE && Number(selected.resale_floor||0) >= MIN_RESALE) : false;
//     return {
//       store: STORE_NAME,
//       mode,
//       category,
//       subcategory: subcategory || null,
//       device_key: selected?.key || null,
//       device_label: selected?.label || null,
//       brand: selected?.brand || null,
//       model: selected?.model || null,
//       gtin: selected?.gtin || null,
//       mpn: selected?.mpn || null,
//       model_code_entered: modelCode || null,
//       thresholds: { MIN_PURCHASE, MIN_RESALE, eligible },
//       pricing: { buy_min: selected?.buy_min || null, resale_floor: selected?.resale_floor || null },
//       details: { battery, condition, hasCharger, hasBox, unlocked },
//       identifiers: { imei: imei || null, serial: serial || null },
//       barcode_lookup: lookup ? {
//         barcode: lookup.barcode || null,
//         title: lookup.title || null,
//         brand: lookup.brand || null,
//         model: lookup.model || null,
//         mpn: lookup.mpn || null,
//         category: lookup.category || null,
//       } : null,
//       rewards: { code: rewardCode || null },
//       quote_cad: payout,
//       customer: { first, last, email, phone, isBusiness, bizQty },
//       created_at: new Date().toISOString(),
//     };
//   }

//   const doBarcodeLookup = useCallback(async (raw: string) => {
//     const code = String(raw||'').replace(/[^0-9]/g,'');
//     if (!code) { setLookup(null); setLookupError(''); return; }
//     const url = buildBarcodeLookupUrl(code);
//     if (!url) { setLookupError('BarcodeLookup API key or proxy not configured'); return; }
//     try {
//       setLookupLoading(true); setLookupError('');
//       const res = await fetch(url, { method:'GET' });
//       const text = await res.text();
//       let json: any = {};
//       try { json = JSON.parse(text); } catch {}
//       const p = (json.products && json.products[0]) || json.product || null;
//       if (!p) { setLookup(null); setLookupError('No product found for this code'); return; }
//       const normalized = {
//         barcode: p.barcode_number || p.barcode || code,
//         title: p.product_name || p.title || p.product_title || '',
//         brand: p.brand || p.manufacturer || '',
//         model: p.model || p.model_number || '',
//         mpn: p.mpn || p.part_number || '',
//         category: p.category || p.category_name || '',
//       };
//       setLookup(normalized);
//       const qHint = [normalized.brand, normalized.model].filter(Boolean).join(' ').trim();
//       if (qHint) setQ(qHint);
//       if (!modelCode && normalized.mpn) setModelCode(normalized.mpn);
//       try { const u = new SpeechSynthesisUtterance(`Found ${normalized.brand || ''} ${normalized.model || ''}`.trim()); u.lang = 'en-CA'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);} catch {}
//     } catch (e){
//       console.log('BarcodeLookup error', e);
//       setLookup(null); setLookupError('Lookup failed. Try again or enter details manually.');
//     } finally { setLookupLoading(false); }
//   }, [modelCode]);

//   // auto-lookup when 12–14 digits present
//   useEffect(() => {
//     const d = String(modelCode||'').replace(/[^0-9]/g,'');
//     if (!lookup && !lookupLoading && d.length >= 12 && d.length <= 14 && (BARCODELOOKUP_KEY || BARCODELOOKUP_PROXY)) {
//       doBarcodeLookup(d);
//     }
//   }, [modelCode, lookup, lookupLoading, doBarcodeLookup]);

//   // Image upload helper
//   async function handleImageUpload(file?: File | null){
//     if (!file) return;
//     if (typeof (window as any).BarcodeDetector === 'function'){
//       try{
//         const img = await createImageBitmap(file);
//         const detector = new (window as any).BarcodeDetector({ formats:["ean_13","upc_a","upc_e","ean_8","code_128","code_39","qr_code"] });
//         const codes = await detector.detect(img);
//         if (codes && codes[0] && codes[0].rawValue){
//           setModelCode(codes[0].rawValue);
//           doBarcodeLookup(codes[0].rawValue);
//           return;
//         }
//       }catch(e){ console.warn('Barcode detect failed from image', e); }
//     }
//     setLookupError('Could not read a barcode from the photo. Try a clearer barcode photo or enter the code.');
//   }

//   // Voice (Web Speech API)
//   function startVoice(){
//     const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert('Voice not supported in this browser.'); return; }
//     const r = new SR(); r.lang = 'en-CA'; r.interimResults = false; r.maxAlternatives = 1; setListening(true);
//     r.onresult = (ev: any) => { const text = ev.results[0][0].transcript || ''; setQ(text); if (searchRef.current) searchRef.current.focus(); try{ const u = new SpeechSynthesisUtterance(`Looking up ${text}`); u.lang='en-CA'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);}catch{} };
//     r.onerror = () => setListening(false);
//     r.onend = () => setListening(false);
//     r.start();
//   }

//   function next(){ 
//     // Validate current step before proceeding
//     if (step === 2) {
//       // Validate step 2 fields
//       validateField('battery', battery);
//       validateField('condition', condition);
      
//       // Check if validation passed
//       const hasErrors = validationErrors.battery || validationErrors.condition;
//       if (hasErrors) {
//         return; // Don't proceed if there are errors
//       }
//     }
    
//     setStep(s => Math.min(3, s + 1)); 
//   }
//   function back(){ setStep(s => Math.max(1, s - 1)); }

//   function resetAll(){
//     setStep(1); setMode('sell');
//     setCategory(''); setSubcategory(''); setSelected(null);
//     setHasCharger(false); setHasBox(false); setBattery(90); setCondition('');
//     setIsBusiness(false); setBizQty(1); setAgree(false);
//     setFirst(''); setLast(''); setEmail(''); setPhone('');
//     setModelCode(''); setQ(''); setImei(''); setSerial('');
//     setLookup(null); setLookupError(''); setLookupLoading(false);
//     setRewardCode('');
//     setValidationErrors({});
//   }

//   async function submit(){
//     setIsSubmitting(true);
//     const payload = buildExportPayload();
    
//     // Save quote to Supabase
//     let supabaseSuccess = false;
//     try {
//       await insertData('quotes', {
//         // Main quote information
//         store: payload.store,
//         mode: payload.mode,
//         category: payload.category,
//         subcategory: payload.subcategory,
        
//         // Device information
//         device_name: payload.device_label || payload.barcode_lookup?.title || null,
//         brand: payload.brand || payload.barcode_lookup?.brand || null,
//         model: payload.model || payload.barcode_lookup?.model || null,
//         model_code: payload.model_code_entered || payload.barcode_lookup?.mpn || null,
        
//         // Device details
//         condition: payload.details.condition || null,
//         battery_percentage: payload.details.battery || null,
//         has_original_box: payload.details.hasBox || false,
//         has_original_charger: payload.details.hasCharger || false,
//         unlocked: payload.details.unlocked || true,
        
//         // Identifiers
//         imei: payload.identifiers.imei || null,
//         serial_number: payload.identifiers.serial || null,
        
//         // Price and eligibility
//         quote_amount: payload.quote_cad || null,
//         is_eligible: payload.thresholds.eligible || false,
//         buy_min_threshold: payload.thresholds.MIN_PURCHASE,
//         resale_floor_threshold: payload.thresholds.MIN_RESALE,
        
//         // Customer information
//         customer_first_name: payload.customer.first || null,
//         customer_last_name: payload.customer.last || null,
//         customer_email: payload.customer.email || null,
//         customer_phone: payload.customer.phone || null,
//         is_business_customer: payload.customer.isBusiness || false,
//         business_quantity: payload.customer.bizQty || 1,
        
//         // Barcode lookup information
//         barcode: payload.barcode_lookup?.barcode || null,
//         barcode_title: payload.barcode_lookup?.title || null,
        
//         // Rewards
//         rewards_code: payload.rewards.code || null,
        
//         // Metadata
//         user_id: user?.id || null,
//         created_at: new Date().toISOString(),
//         status: 'pending'
//       });
//       console.log('Quote saved to Supabase successfully');
//       supabaseSuccess = true;
//     } catch (error) {
//       console.error('Error saving to Supabase:', error);
//       supabaseSuccess = false;
//     }
    
//     // Fallback only if Supabase failed
//     if (!supabaseSuccess) {
//       if (!SHEET_WEBHOOK) {
//         // Fallback: download sample JSON for testing
//         const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
//         const url = URL.createObjectURL(blob); const a = document.createElement('a');
//         a.href = url; a.download = 'paymore_quote_sample.json'; a.click(); URL.revokeObjectURL(url);
//       } else {
//         await postToSheet(payload);
//       }
//     }
    
//     // Show result screen
//     setIsSubmitting(false);
//     if (supabaseSuccess) {
//       setShowSuccess(true);
//       launchConfetti();
//     } else {
//       setShowError(true);
//     }
    
//     // Reward sequence
//     if (supabaseSuccess) {
//       setBannerText('Your quote has been saved successfully! Cash payment locked for 24 hours.');
//     } else {
//       setBannerText('Your cash payment has been locked down for 24 hours.');
//     }
//     try {
//       if (audioRef.current) { audioRef.current.currentTime = SOUND_START; await audioRef.current.play(); }
//       setTimeout(() => { if (cashAudioRef.current) cashAudioRef.current.play().catch(()=>{}); }, 400);
//     } catch {}
//     // Removed automatic redirect - user stays on success/error page
//   }

//   // const canContinue = useMemo(() => {
//   //   if (step === 1) return true; // optional step
//   //   if (step === 2) return true;
//   //   const hasContact = (agree && first && last && email && phone);
//   //   return hasContact && !!selected; // require device to lock
//   // }, [step, selected, agree, first, last, email, phone]);

//   const summaryMuted = step < 3;

//   // Show loading screen
//   if (isSubmitting) {
//     return (
//       <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
//           <p className="text-gray-600 font-medium">Processing your quote...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show success screen
//   if (showSuccess) {
//     return (
//       <SuccessPage 
//         onGoBack={() => window.location.assign(THANKYOU_URL)} 
//       />
//     );
//   }

//   // Show error screen
//   if (showError) {
//     return (
//       <ErrorPage 
//         onTryAgain={() => {
//           setShowError(false);
//           setStep(1);
//         }} 
//       />
//     );
//   }

//   return (
//     <Shell>
//       <audio ref={audioRef} src={SOUND_URL} preload="auto" />
//       <audio ref={cashAudioRef} src={CASH_SOUND_URL} preload="auto" />

//       {/* Stepper */}
//       <div className="paymore-stepper">
//         <div className="paymore-stepper-container">
//           <div className="paymore-step-item">
//             <div className={cn("paymore-step-number", step === 1 ? "paymore-step-number-active" : "paymore-step-number-inactive")}>1</div>
//             <div className="paymore-step-content">
//               <div className={cn("paymore-step-title", step !== 1 && "paymore-step-title-inactive")}>Select device</div>
//             </div>
//             <div className="paymore-step-info">
//               i
//               <div className="paymore-step-tooltip">
//                 <div className="paymore-step-tooltip-title">Select Device</div>
//                 <div className="paymore-step-tooltip-description">Pick a category, then choose the model. Use search or photo/scan.</div>
//               </div>
//             </div>
//           </div>
//           <ChevronRight className="h-4 w-4 paymore-step-arrow" />
//           <div className="paymore-step-item">
//             <div className={cn("paymore-step-number", step === 2 ? "paymore-step-number-active" : "paymore-step-number-inactive")}>2</div>
//             <div className="paymore-step-content">
//               <div className={cn("paymore-step-title", step !== 2 && "paymore-step-title-inactive")}>Enter details</div>
//             </div>
//             <div className="paymore-step-info">
//               i
//               <div className="paymore-step-tooltip">
//                 <div className="paymore-step-tooltip-title">Enter Details</div>
//                 <div className="paymore-step-tooltip-description">We'll text/email your locked quote. Business toggle available.</div>
//               </div>
//             </div>
//           </div>
//           <ChevronRight className="h-4 w-4 paymore-step-arrow" />
//           <div className="paymore-step-item">
//             <div className={cn("paymore-step-number", step === 3 ? "paymore-step-number-active" : "paymore-step-number-inactive")}>3</div>
//             <div className="paymore-step-content">
//               <div className={cn("paymore-step-title", step !== 3 && "paymore-step-title-inactive")}>Lock quote</div>
//             </div>
//             <div className="paymore-step-info">
//               i
//               <div className="paymore-step-tooltip">
//                 <div className="paymore-step-tooltip-title">Lock Quote</div>
//                 <div className="paymore-step-tooltip-description">10‑minute hold window.</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Step 1 */}
//       {step === 1 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Select your category & device</CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-4">
//             {/* Category */}
//             <div className="grid gap-2">
//               <Field label="Category">
//                 <select 
//                   value={category} 
//                   onChange={(e)=> {
//                     setCategory(e.target.value);
//                     if (e.target.value && e.target.value !== '') {
//                       setValidationErrors(prev => ({ ...prev, category: '' }));
//                     }
//                   }} 
//                   className={highlightCategory ? "paymore-select paymore-input-valid" : validationErrors.category ? "paymore-select paymore-input-error" : "paymore-select"}
//                   disabled={categoriesLoading}
//                 >
//                   <option value="">{categoriesLoading ? "Loading categories..." : "Select a category"}</option>
//                   {categories.map((cat) => (
//                     <option key={cat.key} value={cat.key}>{cat.label}</option>
//                   ))}
//                 </select>
//                 {validationErrors.category && <div className="text-xs text-red-600 mt-1">{validationErrors.category}</div>}
//                 {categoriesError && <div className="text-xs text-red-600 mt-1">Error loading categories: {categoriesError}</div>}
//               </Field>
//               {!!subcatKeys.length && (
//                 <Field label="Subcategory">
//                   <select value={subcategory} onChange={(e)=> setSubcategory(e.target.value)} className="paymore-select">
//                     {subcatKeys.map((k: string) => (<option key={k} value={k}>{catSpec.subcategories[k].label}</option>))}
//                   </select>
//                 </Field>
//               )}
//               <Field label="Search">
//                 <div className="flex items-center gap-2">
//                   <input 
//                     ref={searchRef} 
//                     value={q} 
//                     onChange={(e)=> {
//                       setQ(e.target.value);
//                       if (e.target.value.trim()) {
//                         setValidationErrors(prev => ({ ...prev, search: '' }));
//                       }
//                     }} 
//                     placeholder="Try: brand, model, capacity…" 
//                     className={validationErrors.search ? "paymore-input paymore-input-error" : "paymore-input"} 
//                   />
//                   <Button type="button" variant="outline" onClick={startVoice}><Mic className="h-4 w-4"/> {listening ? 'Listening…' : 'Talk to AI'}</Button>
//                 </div>
//                 {validationErrors.search && <div className="text-xs text-red-600 mt-1">{validationErrors.search}</div>}
//               </Field>
//             </div>

//             {/* Identifier helpers */}
//             <div className="grid gap-2">
//               <div className="grid gap-1">
//                 <span className="paymore-field-label">Upload Photo or Scan Barcode (optional)</span>
//                 <div className="flex items-center gap-2">
//                   <input id="pm-file" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e)=> handleImageUpload(e.target.files && e.target.files[0])} />
//                   <Button type="button" variant="outline" onClick={()=> (document.getElementById('pm-file') as HTMLInputElement)?.click()}><Upload className="h-4 w-4"/> Upload Photo</Button>
//                 </div>
//               </div>
//               <Field label="GTIN / MPN / Model code (optional)">
//                 <div className="flex items-center gap-2">
//                   <input value={modelCode} onChange={(e)=> setModelCode(e.target.value)} placeholder="UPC/GTIN, MPN, or model code" className="paymore-input"/>
//                   <Button type="button" variant="outline" onClick={()=> doBarcodeLookup(modelCode)} disabled={!modelCode}>Search code</Button>
//                 </div>
//               </Field>
//               <div className="paymore-tip">
//                 <div className="paymore-tip-icon">!</div>
//                 <div className="paymore-tip-text">On phones, dial <span className="font-mono font-semibold">*#06#</span> to show IMEI, or go to Settings → About.</div>
//               </div>
//               <div className="grid gap-4">
//                 <Field label="IMEI (optional)"><input inputMode="numeric" value={imei} onChange={(e)=> setImei(e.target.value.replace(/\D/g,''))} placeholder="15 digits" className="paymore-input"/></Field>
//                 <Field label="Serial # (optional)"><input value={serial} onChange={(e)=> setSerial(e.target.value)} placeholder="From Settings → About or device label" className="paymore-input"/></Field>
//               </div>
//               {lookupLoading && <div className="text-xs text-zinc-600">Looking up…</div>}
//               {lookupError && <div className="text-xs text-red-600">{lookupError}</div>}
//               {lookup && (
//                 <div className="rounded-lg border border-zinc-200 p-2 text-xs grid gap-1 bg-zinc-50">
//                   <div className="font-medium text-zinc-800">Found: {lookup.title || '—'}</div>
//                   <div className="grid grid-cols-2 gap-x-3">
//                     <div><span className="text-zinc-500">Brand:</span> {lookup.brand || '—'}</div>
//                     <div><span className="text-zinc-500">Model:</span> {lookup.model || '—'}</div>
//                     <div><span className="text-zinc-500">MPN:</span> {lookup.mpn || '—'}</div>
//                     <div><span className="text-zinc-500">GTIN:</span> {lookup.barcode || '—'}</div>
//                   </div>
//                   <div className="flex items-center gap-2 pt-1">
//                     <Button type="button" variant="outline" onClick={()=> setQ([lookup.brand, lookup.model].filter(Boolean).join(' ').trim())}>Search these keywords</Button>
//                     <Button type="button" variant="ghost" onClick={()=> setLookup(null)}>Clear</Button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Category hero when list is hidden and no category selected */}
//             {!q.trim() && !showList && !category && (
//               <div className="paymore-category-hero">
//                 <div className="paymore-category-icon">
//                   <img 
//                     src="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTUkMdMbWGpC7t-4GcTp9-iFscNprEBXqtaGAR1StT_Ec4N0MH6ktsLbUYSdCHPhg0rvXPO4j1MrAJ4Fh1x4IyeXDgYfUAf-fiZh9F9MawX02J-SuGPOxIvihYOa70EoIyqtRY63UsyhQ&usqp=CAc" 
//                     alt="Apple iPhone"
//                     onError={(e) => {
//                       // Fallback to icon if image fails to load
//                       e.currentTarget.style.display = 'none';
//                       if (e.currentTarget.parentElement) {
//                         e.currentTarget.parentElement.innerHTML = '<DeviceIcon name="smartphone" />';
//                       }
//                     }}
//                   />
//                 </div>
//                 <div className="paymore-category-content">
//                   <h3 className="paymore-category-title">{catSpec.label || 'Selected category'}</h3>
//                   <p className="paymore-category-description">Start typing your model or use photo/scan. Eligible items meet Buy ≥ {MIN_PURCHASE} • Resale ≥ {MIN_RESALE}.</p>
//                   <div className="paymore-category-button">
//                     <Button type="button" variant="outline" onClick={handleBrowseModels}>Browse models</Button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Device condition grading legend */}
//             {/* <div className="paymore-device-condition-block">
//               <div className="paymore-condition-title">Device Condition Guide</div>
//               <div className="paymore-condition-items">
//                 <div 
//                   className={`paymore-condition-item ${selectedCondition === 'ungraded' ? 'paymore-condition-selected' : ''}`}
//                   onClick={() => setSelectedCondition(selectedCondition === 'ungraded' ? '' : 'ungraded')}
//                 >
//                   <div className="paymore-condition-color paymore-condition-ungraded">
//                     {selectedCondition === 'ungraded' && <div className="paymore-condition-check">✓</div>}
//                   </div>
//                   <div className="paymore-condition-info">
//                     <div className="paymore-condition-label">Ungraded</div>
//                     <div className="paymore-condition-tooltip">Not yet assessed by our team</div>
//                   </div>
//                 </div>
//                 <div 
//                   className={`paymore-condition-item ${selectedCondition === 'excellent' ? 'paymore-condition-selected' : ''}`}
//                   onClick={() => setSelectedCondition(selectedCondition === 'excellent' ? '' : 'excellent')}
//                 >
//                   <div className="paymore-condition-color paymore-condition-excellent">
//                     {selectedCondition === 'excellent' && <div className="paymore-condition-check">✓</div>}
//                   </div>
//                   <div className="paymore-condition-info">
//                     <div className="paymore-condition-label">Excellent</div>
//                     <div className="paymore-condition-tooltip">Like new condition, minimal wear</div>
//                   </div>
//                 </div>
//                 <div 
//                   className={`paymore-condition-item ${selectedCondition === 'good' ? 'paymore-condition-selected' : ''}`}
//                   onClick={() => setSelectedCondition(selectedCondition === 'good' ? '' : 'good')}
//                 >
//                   <div className="paymore-condition-color paymore-condition-good">
//                     {selectedCondition === 'good' && <div className="paymore-condition-check">✓</div>}
//                   </div>
//                   <div className="paymore-condition-info">
//                     <div className="paymore-condition-label">Good</div>
//                     <div className="paymore-condition-tooltip">Minor wear, fully functional</div>
//                   </div>
//                 </div>
//                 <div 
//                   className={`paymore-condition-item ${selectedCondition === 'fair' ? 'paymore-condition-selected' : ''}`}
//                   onClick={() => setSelectedCondition(selectedCondition === 'fair' ? '' : 'fair')}
//                 >
//                   <div className="paymore-condition-color paymore-condition-fair">
//                     {selectedCondition === 'fair' && <div className="paymore-condition-check">✓</div>}
//                   </div>
//                   <div className="paymore-condition-info">
//                     <div className="paymore-condition-label">Fair</div>
//                     <div className="paymore-condition-tooltip">Visible wear, works well</div>
//                   </div>
//                 </div>
//                 <div 
//                   className={`paymore-condition-item ${selectedCondition === 'no-deal' ? 'paymore-condition-selected' : ''}`}
//                   onClick={() => setSelectedCondition(selectedCondition === 'no-deal' ? '' : 'no-deal')}
//                 >
//                   <div className="paymore-condition-color paymore-condition-no-deal">
//                     {selectedCondition === 'no-deal' && <div className="paymore-condition-check">✓</div>}
//                   </div>
//                   <div className="paymore-condition-info">
//                     <div className="paymore-condition-label">No Deal</div>
//                     <div className="paymore-condition-tooltip">Below our minimum thresholds</div>
//                   </div>
//                 </div>
//                 <div 
//                   className={`paymore-condition-item ${selectedCondition === 'donate' ? 'paymore-condition-selected' : ''}`}
//                   onClick={() => setSelectedCondition(selectedCondition === 'donate' ? '' : 'donate')}
//                 >
//                   <div className="paymore-condition-color paymore-condition-donate">
//                     {selectedCondition === 'donate' && <div className="paymore-condition-check">✓</div>}
//                   </div>
//                   <div className="paymore-condition-info">
//                     <div className="paymore-condition-label">Donate/Recycle</div>
//                     <div className="paymore-condition-tooltip">Free disposal service</div>
//                   </div>
//                 </div>
//               </div>
//             </div> */}

//             {/* Items grid */}
//             <div className="grid grid-cols-1 gap-2">
//               {(showList || q.trim() || category) && items.map((d: any) => (
//                 <button key={d.key} onClick={()=> setSelected(d)} className={cn("flex items-center justify-between rounded-xl border px-3 py-3 text-left",
//                   selected?.key===d.key ? "border-emerald-400 bg-emerald-50" : "border-zinc-200 hover:bg-zinc-50")}> 
//                   <div className="flex items-center gap-3">
//                     <DeviceImage 
//                       imageUrl={d.device_image} 
//                       icon={d.icon} 
//                       categoryIcon={categories.find(c => c.key === category)?.icon}
//                       size="medium"
//                     />
//                     <div>
//                       <div className="text-sm font-medium text-zinc-900">{d.label}</div>
//                       <div className="text-xs text-zinc-500">Buy floor <Money amount={d.buy_min}/> • Resale floor <Money amount={d.resale_floor}/></div>
//                     </div>
//                   </div>
//                   <ArrowRight className="h-4 w-4 text-zinc-400" />
//                 </button>
//               ))}
//               {((showList || q.trim() || category) && !items.length) && (
//                 lowMatches.length > 0 ? (
//                   <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
//                     We found matches below our minimums. You can still select one to Donate or Recycle.
//                     <div className="pt-2"><Button variant="outline" onClick={()=> setShowLow(true)}>Show lower‑value matches</Button></div>
//                   </div>
//                 ) : (
//                   <div className="text-xs text-zinc-500">No matches at this time. Try a different search or category.</div>
//                 )
//               )}
//               {showLow && category && (
//                 <div className="grid grid-cols-1 gap-2">
//                   {lowMatches.map((d: any) => (
//                     <button key={d.key} onClick={()=> setSelected(d)} className="flex items-center justify-between rounded-xl border px-3 py-3 text-left border-red-200 bg-red-50"> 
//                       <div className="flex items-center gap-3">
//                         <DeviceImage 
//                           imageUrl={d.device_image} 
//                           icon={d.icon} 
//                           categoryIcon={categories.find(c => c.key === category)?.icon}
//                           size="medium"
//                         />
//                         <div>
//                           <div className="text-sm font-medium text-zinc-900">{d.label}</div>
//                           <div className="text-xs text-red-700">Below minimums — Donate or Recycle</div>
//                         </div>
//                       </div>
//                       <ArrowRight className="h-4 w-4 text-red-400" />
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="paymore-button-group">
//               <div className="paymore-button-group-left">
//                 <Button variant="ghost" onClick={resetAll}><ArrowLeft className="h-4 w-4"/> Reset</Button>
//               </div>
//               <div className="paymore-button-group-right">
//                {/* <Button variant="outline" onClick={startVoice}><Mic className="h-4 w-4"/> {listening ? 'Listening…' : 'Talk to AI'}</Button> */}
//                 <Button 
//                   onClick={handleContinueClick} 
//                   className={canProceedToNextStep() ? "paymore-button-solid" : "paymore-button-solid paymore-button-inactive"}
//                 >
//                   Continue <ArrowRight className="h-4 w-4"/>
//                 </Button>
//               </div>
//             </div>
//             <div className="paymore-help-section">
//               <p className="paymore-help-text">
//                 No exact model? <button className="paymore-help-button" onClick={handleContinueClick}>Continue anyway</button> — we'll confirm in store.
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Step 2 */}
//       {step === 2 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Enter your details</CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-4">
//             <div className="grid grid-cols-2 gap-2">
//               <Field label="First name">
//                 <input 
//                   value={first} 
//                   onChange={(e)=> {
//                     setFirst(e.target.value);
//                     validateField('first', e.target.value);
//                   }} 
//                   className={getInputClassName('first', first)}
//                 />
//                 {validationErrors.first && <div className="text-xs text-red-600 mt-1">{validationErrors.first}</div>}
//               </Field>
//               <Field label="Last name">
//                 <input 
//                   value={last} 
//                   onChange={(e)=> {
//                     setLast(e.target.value);
//                     validateField('last', e.target.value);
//                   }} 
//                   className={getInputClassName('last', last)}
//                 />
//                 {validationErrors.last && <div className="text-xs text-red-600 mt-1">{validationErrors.last}</div>}
//               </Field>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <Field label="Email">
//                 <input 
//                   value={email} 
//                   onChange={(e)=> {
//                     setEmail(e.target.value);
//                     validateField('email', e.target.value);
//                   }} 
//                   className={getInputClassName('email', email)}
//                 />
//                 {validationErrors.email && <div className="text-xs text-red-600 mt-1">{validationErrors.email}</div>}
//               </Field>
//               <Field label="Phone">
//                 <input 
//                   value={phone} 
//                   onChange={(e)=> {
//                     setPhone(e.target.value);
//                     validateField('phone', e.target.value);
//                   }} 
//                   className={getInputClassName('phone', phone)}
//                 />
//                 {validationErrors.phone && <div className="text-xs text-red-600 mt-1">{validationErrors.phone}</div>}
//               </Field>
//             </div>
//             <div className="grid grid-cols-2 gap-2 mobile:gap-0">
//               <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="paymore-checkbox" checked={isBusiness} onChange={(e)=> setIsBusiness(e.target.checked)} /> Business</label>
//               {isBusiness && (
//                 <Field label="Quantity (est.)"><input type="number" min={1} max={30} value={bizQty} onChange={(e)=> setBizQty(Number(e.target.value||1))} className="paymore-input"/></Field>
//               )}
//             </div>
//             {/* device condition subset */}
//             <div className="grid gap-2">
//               <div className="grid grid-cols-2 gap-2 mobile:gap-0">
//                 <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="paymore-checkbox" checked={hasCharger} onChange={(e)=> setHasCharger(e.target.checked)} /> Charger included</label>
//                 <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="paymore-checkbox" checked={hasBox} onChange={(e)=> setHasBox(e.target.checked)} /> Box included</label>
//               </div>
//               <div className="grid grid-cols-1 gap-2 mt-2">
//                 <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="paymore-checkbox" checked={unlocked} onChange={(e)=> setUnlocked(e.target.checked)} /> Device is unlocked</label>
//               </div>
//               <div className="grid grid-cols-1 gap-2 mt-4 mb-4">
//                 <Field label="Battery % (if applicable)">
//                   <input 
//                     type="range" 
//                     min={0} 
//                     max={100} 
//                     step={1} 
//                     value={battery} 
//                     onChange={(e)=> {
//                       const newBattery = Number(e.target.value);
//                       setBattery(newBattery);
//                       validateField('battery', newBattery);
//                       // Update CSS custom property for progress
//                       e.target.style.setProperty('--progress', `${newBattery}%`);
//                     }} 
//                     className="paymore-range"
//                     style={{'--progress': `${battery}%`} as React.CSSProperties}
//                   />
//                   <div className="text-xs text-zinc-600 mt-1">Current: {battery}%</div>
//                   {validationErrors.battery && <div className="text-xs text-red-600 mt-1">{validationErrors.battery}</div>}
//                 </Field>
//                 <Field label="Condition">
//                   <select 
//                     value={condition} 
//                     onChange={(e)=> {
//                       setCondition(e.target.value as any);
//                       validateField('condition', e.target.value);
//                     }} 
//                     className={validationErrors.condition ? "paymore-select paymore-input-error" : "paymore-select"}
//                   >
//                     <option value="">Select condition</option>
//                     <option value="Like New">Like New</option>
//                     <option value="Good">Good</option>
//                     <option value="Fair">Fair</option>
//                   </select>
//                   {validationErrors.condition && <div className="text-xs text-red-600 mt-1">{validationErrors.condition}</div>}
//                 </Field>
//               </div>
//             </div>
//             <Field label="4‑digit commission / rewards code (optional)"><input value={rewardCode} maxLength={4} inputMode="numeric" onChange={(e)=> setRewardCode(e.target.value.replace(/\D/g,''))} placeholder="1234" className="paymore-input"/></Field>
//             <div className="flex items-center gap-3">
//               <label className="inline-flex items-center gap-2 text-sm">
//                 <input 
//                   type="checkbox" 
//                   className="paymore-checkbox" 
//                   checked={agree} 
//                   onChange={(e)=> {
//                     setAgree(e.target.checked);
//                     validateField('agree', e.target.checked);
//                   }} 
//                 /> 
//                 I agree to the store's verification & payout policies.
//               </label>
//               <button 
//                 type="button" 
//                 className="paymore-rewards-button" 
//                 onClick={() => window.open('https://torontodowntownon.paymore.ca/pages/affiliate-program', '_blank')}
//               >
//                 View rewards
//               </button>
//             </div>
//             {validationErrors.agree && <div className="text-xs text-red-600 mt-1">{validationErrors.agree}</div>}
//             <div className="paymore-button-group">
//               <div className="paymore-button-group-left">
//                 <Button variant="ghost" onClick={back}><ArrowLeft className="h-4 w-4"/> Back</Button>
//               </div>
//               <div className="paymore-button-group-right">
//                {/*  <Button variant="outline" onClick={startVoice}><Mic className="h-4 w-4"/> {listening ? 'Listening…' : 'Talk to AI'}</Button>*/ }
//                 <Button 
//                   onClick={handleContinueClick} 
//                   className={canProceedToNextStep() ? "paymore-button-solid" : "paymore-button-solid paymore-button-inactive"}
//                 >
//                   Continue <ArrowRight className="h-4 w-4"/>
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Step 3 */}
//       {step === 3 && (
//         <Card>
//           <CardHeader>
//             <div className="paymore-step3-header">
//               <CardTitle>Review & lock your quote</CardTitle>
//               <Badge>{quoteExpired ? 'Quote expired' : `Hold expires in ${mmss(timeLeft)}`}</Badge>
//             </div>
//             {bannerText && (<div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 text-sm">{bannerText}</div>)}
//           </CardHeader>
//           <CardContent className="grid gap-4">
//             <div className="grid gap-1">
//               <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50">
//                 <DeviceImage 
//                   imageUrl={selected?.device_image} 
//                   icon={selected?.icon} 
//                   categoryIcon={categories.find(c => c.key === category)?.icon}
//                   size="large"
//                 />
//                 <div>
//                   <div className="font-medium text-zinc-900">{selected?.label || '—'}</div>
//                   <div className="text-sm text-zinc-500">{selected?.brand} • {selected?.storage}</div>
//                 </div>
//               </div>
//               <Row label="Buy floor" value={<Money amount={selected?.buy_min || 0} />} muted={summaryMuted} />
//               <Row label="Resale floor" value={<Money amount={selected?.resale_floor || 0} />} muted={summaryMuted} />
//               <Row label="Battery" value={`${battery}%`} muted={summaryMuted} />
//               <Row label="Condition" value={`${condition}`} muted={summaryMuted} />
//               <Row label="Charger / Box" value={`${hasCharger ? 'Yes' : 'No'} • ${hasBox ? 'Yes' : 'No'}`} muted={summaryMuted} />
//               <Row label="Unlocked" value={`${unlocked ? 'Yes' : 'No'}`} muted={summaryMuted} />
//               <Row label="IMEI" value={`${imei || '—'}`} muted={summaryMuted} />
//               <Row label="Serial" value={`${serial || '—'}`} muted={summaryMuted} />
//               <Row label="Estimated payout" value={<Money amount={payout} />} muted={false} />
//             </div>
//             {selected && !eligible && (
//               <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 p-3 text-sm">
//                 This device is below our minimums for cash offers. We’d be happy to <span className="font-semibold">Donate or Recycle</span> it for you at the counter (certificate available for secure shred).
//               </div>
//             )}

//             <div className="rounded-lg border border-zinc-200 p-3 text-xs">
//               <div className="font-medium text-zinc-800">{STORE_NAME}</div>
//               <div className="text-zinc-600">577 Yonge St #102, Toronto, ON M4Y 1Z2</div>
//               <div className="flex items-center gap-3 pt-1">
//                 <a href={STORE_GOOGLE_MAPS} target="_blank" rel="noreferrer" className="paymore-rewards-button">Open in Google Maps</a>
//                 <span>or</span>
//                 <a href={`tel:${PAYMORE_LOCAL_E164}`} className="paymore-rewards-button">Call Us {PAYMORE_LOCAL_HUMAN}</a>
//               </div>
//             </div>

//             <div className="paymore-button-group">
//               <div className="paymore-button-group-left">
//                 <Button variant="ghost" onClick={back}><ArrowLeft className="h-4 w-4"/> Back</Button>
//               </div>
//               <div className="paymore-button-group-right">
//                 <Button onClick={submit} disabled={!agree || !selected || !eligible || quoteExpired || !condition}>Lock my quote</Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Rewards modal */}
//       {showRewards && (
//         <div className="paymore-rewards-overlay" onClick={()=> setShowRewards(false)}>
//           <div className="paymore-rewards-modal" onClick={(e)=> e.stopPropagation()}>
//             <div className="paymore-rewards-header">
//               <div className="paymore-rewards-title">🎉 Earn Points & Rewards</div>
//               <div className="paymore-rewards-subtitle">Unlock amazing benefits!</div>
//             </div>
//             <div className="paymore-rewards-content">
//               <div className="paymore-rewards-item">
//                 <div className="paymore-rewards-icon">💰</div>
//                 <div className="paymore-rewards-text">
//                   <div className="paymore-rewards-label">Close a quote</div>
//                   <div className="paymore-rewards-points">+50 points</div>
//                 </div>
//               </div>
//               <div className="paymore-rewards-item">
//                 <div className="paymore-rewards-icon">📱</div>
//                 <div className="paymore-rewards-text">
//                   <div className="paymore-rewards-label">Share on social</div>
//                   <div className="paymore-rewards-points">+20 per engagement</div>
//                 </div>
//               </div>
//               <div className="paymore-rewards-item">
//                 <div className="paymore-rewards-icon">👥</div>
//                 <div className="paymore-rewards-text">
//                   <div className="paymore-rewards-label">Refer a friend</div>
//                   <div className="paymore-rewards-points">+30 points</div>
//                 </div>
//               </div>
//               <div className="paymore-rewards-item">
//                 <div className="paymore-rewards-icon">⭐</div>
//                 <div className="paymore-rewards-text">
//                   <div className="paymore-rewards-label">Leave a review</div>
//                   <div className="paymore-rewards-points">+15 points</div>
//                 </div>
//               </div>
//               <div className="paymore-rewards-item">
//                 <div className="paymore-rewards-icon">📱</div>
//                 <div className="paymore-rewards-text">
//                   <div className="paymore-rewards-label">Upload more devices</div>
//                   <div className="paymore-rewards-points">+10 each</div>
//                 </div>
//               </div>
//               <div className="paymore-rewards-item">
//                 <div className="paymore-rewards-icon">📷</div>
//                 <div className="paymore-rewards-text">
//                   <div className="paymore-rewards-label">Barcode scans</div>
//                   <div className="paymore-rewards-points">+5 points</div>
//                 </div>
//               </div>
//             </div>
//             <div className="paymore-rewards-footer">
//               <Button variant="outline" onClick={()=> setShowRewards(false)}>Close</Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </Shell>
//   );
// }


// function Row({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }){
//   return (
//     <div className="flex items-center justify-between text-sm">
//       <div className={cn("", muted && "text-zinc-400")}>{label}</div>
//       <div className={cn("", muted && "text-zinc-400")}>{value}</div>
//     </div>
//   );
// }

// // simple spin css (inject once)
// if (typeof document !== 'undefined' && !document.getElementById('pm-spin-style')){
//   const style = document.createElement('style');
//   style.id = 'pm-spin-style';
//   style.innerHTML = `@keyframes spin-slow{from{transform:rotate(0)}to{transform:rotate(360deg)}}.animate-spin-slow{animation:spin-slow 1.6s linear infinite}`;
//   document.head.appendChild(style);
// }
