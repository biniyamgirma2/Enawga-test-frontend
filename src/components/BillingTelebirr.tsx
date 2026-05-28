import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShieldCheck, CreditCard, ChevronRight, HelpCircle, ArrowRight,
  Info, QrCode, Coins, Smartphone, Check, ArrowLeft, RefreshCw, Smartphone as PhoneIcon
} from 'lucide-react';
import { PlanType } from '../types/rag';

export const BillingTelebirr: React.FC = () => {
  const { 
    currentUser, billingTransactions, initiateTelebirrPayment, 
    simulateTelebirrCallback, cancelSubscription 
  } = useApp();

  const [activePlanSelection, setActivePlanSelection] = useState<PlanType>('pro');
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  
  // Sandbox Simulator state
  const [sandboxVisible, setSandboxVisible] = useState(false);
  const [telebirrMobileNum, setTelebirrMobileNum] = useState(currentUser?.telebirr_phone || '0912123456');
  const [telebirrPin, setTelebirrPin] = useState('1234');
  const [secCode, setSecCode] = useState('8832');
  const [simulatingCallback, setSimulatingCallback] = useState(false);

  const priceTiers = [
    {
      id: 'free' as PlanType,
      name: 'Free Starter',
      price: '0 ETB',
      frequency: '/ perpetual',
      features: [
        '100K token monthly quota limit',
        '1 project namespace only',
        'Max 1 file per project (5MB limit)',
        'Regex markdown parsing',
        'N/A headles REST API limits',
        'No Automated custom chatbots',
        'No connected GitHub auto-sync'
      ]
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro Automation',
      price: '1,100 ETB',
      frequency: '/ month',
      features: [
        '5M token monthly quota limit',
        'Up to 5 active API projects',
        'Max 20 documents (50MB limits)',
        '3 automated customer chatbots',
        'Up to 3 GitHub repos auto-sync',
        '60 req / min developer APIs',
        'Secure password protected bots'
      ],
      premium: true
    },
    {
      id: 'enterprise' as PlanType,
      name: 'Corporate RAG',
      price: '4,500 ETB',
      frequency: '/ month',
      features: [
        '50M token monthly quota limit',
        'Unlimited projects & namespaces',
        'Max 500MB file uploads support',
        'Unlimited automated customer chatbots',
        'Unlimited connected GitHub pipelines',
        '600 req / min high speed APIs',
        'Enterprise metered billing lines',
        'Custom domain support'
      ]
    }
  ];

  // The 12 parameters list (Section 4.3)
  const telebirrRequiredParams = [
    { index: 1, key: "appId", source: "Ethio Telecom environment config", desc: "Unique hash identifier for your merchant project." },
    { index: 2, key: "appKey", source: "Ethio Telecom environment config", desc: "Private key string used for SHA-256 signatures calculation." },
    { index: 3, key: "shortCode", source: "Ethio Telecom environment config", desc: "Merchant trade short code assigned on active approval." },
    { index: 4, key: "nonce", source: "Transaction Payload Generator", desc: "Unique random 32 character string (`uuid4().hex`)." },
    { index: 5, key: "timestamp", source: "Transaction Payload Generator", desc: "Unix timestamp in milliseconds. Checks drift window (+/-60s)." },
    { index: 6, key: "outTradeNo", source: "Transaction Payload Generator", desc: "Your unique database order UUID code for deduplication (dedup key)." },
    { index: 7, key: "totalAmount", source: "Plan Pricing Database", desc: "Cost strictly formatted in ETB string with 2 decimals (e.g. '1100.00')." },
    { index: 8, key: "subject", source: "Plan Pricing Database", desc: "Order description (e.g. 'RAG Platform Pro Plan - Monthly')." },
    { index: 9, key: "timeoutExpress", source: "Default Configuration", desc: "Payment lifespan. Typically set to '30' or '60' minutes." },
    { index: 10, key: "notifyUrl", source: "Merchant Server env config", desc: "Asynchronous webhook callback POST address for confirmation (Section 4.7)." },
    { index: 11, key: "returnUrl", source: "Merchant Server env config", desc: "Browser redirection destination once payment completes." },
    { index: 12, key: "receiveName", source: "Ethio Telecom environment config", desc: "Exact company registered trade name with Ethio Telecom." },
  ];

  const handleCheckoutInit = async (plan: 'pro' | 'enterprise') => {
    try {
      const resp = await initiateTelebirrPayment(plan);
      setOutTradeNo(resp.out_trade_no);
      setCheckoutUrl(resp.to_pay_url);
      setSandboxVisible(true);
    } catch (err: any) {
      alert(err?.message || String(err));
    }
  };

  const executeSandboxTrigger = async (success: boolean) => {
    if (!outTradeNo) return;
    setSimulatingCallback(true);
    
    // Simulating intermediate latency while BullMQ worker handles notification verification (Section 17)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await simulateTelebirrCallback(outTradeNo, success);
    
    setSimulatingCallback(false);
    setSandboxVisible(false);
    setOutTradeNo(null);
    setCheckoutUrl(null);
  };

  return (
    <div className="space-y-8 text-slate-100 pb-16">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Telebirr Billing & Subscription</h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Standardized Ethio Telecom H5 C2B Web checkout gateway. Sign payment requests server-side, encrypt with RSA-2048, and handle notify callbacks.
        </p>
      </div>

      {/* Main Pricing Matrix tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {priceTiers.map((tier) => {
          const isCurrentActive = currentUser?.plan === tier.id;
          return (
            <div 
              key={tier.id}
              className={`bg-slate-950 border rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                tier.premium 
                  ? 'border-indigo-500 scale-102 shadow-lg shadow-indigo-600/5' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {tier.premium && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-[8px] font-mono font-bold tracking-widest uppercase text-indigo-400">
                  RECOMMENDED
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">{tier.name}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-bold text-white tracking-tight">{tier.price}</span>
                    <span className="text-xs text-slate-500 font-normal">{tier.frequency}</span>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 space-y-2.5">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-slate-400 font-sans leading-relaxed">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                {tier.id === 'free' ? (
                  <button 
                    disabled 
                    className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl text-xs font-semibold"
                  >
                    Default Basic Accs.
                  </button>
                ) : isCurrentActive ? (
                  <div className="space-y-2">
                    <div className="w-full text-center py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Active Subscription
                    </div>
                    <button
                      onClick={cancelSubscription}
                      className="w-full py-1.5 hover:bg-red-500/5 text-slate-500 hover:text-red-400 text-[10px] font-mono border border-transparent hover:border-red-500/10 rounded-lg cursor-pointer"
                    >
                      Disable automatic renewing (Downgrade)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckoutInit(tier.id as 'pro' | 'enterprise')}
                    className={`w-full py-2.5 font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 active:translate-y-[1px] transition-transform cursor-pointer shadow-md ${
                      tier.premium 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10' 
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    Select Plan (Telebirr Pay)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main detail specifications area layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 column parameters details checklist */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-indigo-400" />
            <h3 className="text-md font-semibold text-white">The 12 Required API Parameters Checklist</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Section 4.3 outlines the exact parameters required on every telebirr payment payload. Our backend constructs them server-side; signs with an appKey, and wraps into an encrypted RSA payload.
          </p>

          <div className="space-y-3 font-mono text-[10px]">
            {telebirrRequiredParams.map((param) => (
              <div 
                key={param.index}
                className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1 group hover:border-slate-800 transition-colors"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-indigo-400">{param.index}. {param.key}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[9px] border border-slate-850 text-slate-500 font-mono">
                    {param.source}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                  {param.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 column transactional history listing */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Telebirr Trade History</h3>
          
          {billingTransactions.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No payments processed yet under your profile.</p>
          ) : (
            <div className="space-y-4">
              {billingTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="p-4 bg-slate-900 border border-slate-850/60 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Trade receipt</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded border ${
                      tx.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : tx.status === 'failed' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-200">RAG Platform {tx.plan.toUpperCase()} Plan</p>
                    <p className="text-indigo-400 font-bold">{tx.amount_etb} ETB</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/40 text-[9px] font-mono text-slate-500">
                    <p className="truncate">OutTradeNo: <strong className="text-slate-400 select-all">{tx.out_trade_no}</strong></p>
                    {tx.telebirr_trade_no && (
                      <p className="truncate">TelebirrTradeID: <strong className="text-slate-400 select-all">{tx.telebirr_trade_no}</strong></p>
                    )}
                    <p className="text-slate-550 pt-1">
                      {tx.status === 'active' ? `Expires: ${new Date(tx.expires_at).toLocaleDateString()}` : `Processed: ${new Date(tx.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Telebirr H5 Checkout Simulated Paywall overlay modal */}
      <AnimatePresence>
        {sandboxVisible && checkoutUrl && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-sky-400"
            >
              {activePlanSelection && (
                <>
                  {/* Top telebirr branding container bar */}
                  <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.5 bg-white/20 rounded-md font-sans font-bold text-xs uppercase text-white tracking-widest flex items-center gap-1">
                        telebirr
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-black/25 px-2 py-0.5 rounded text-sky-200">
                        H5 Sandbox
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSandboxVisible(false);
                        setOutTradeNo(null);
                        setCheckoutUrl(null);
                      }}
                      className="text-white/80 hover:text-white font-semibold text-xs bg-black/10 px-2 py-1 rounded"
                    >
                      Close Sim
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Details and amounts */}
                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-mono">Total Transaction amount</p>
                      <h3 className="text-2xl font-extrabold text-sky-600 font-sans">
                        {checkoutUrl.includes('plan=pro') ? '1,100.00 ETB' : '4,500.00 ETB'}
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-mono mt-1 select-all truncate">tradeNo: {outTradeNo}</p>
                    </div>

                    {/* Step parameters calculated info panel */}
                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-left space-y-1.5">
                      <h5 className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" /> Signature Verification
                      </h5>
                      <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                        Backend constructed transaction, hashed appKey with SHA-256 and encrypted the payload into standard RSA-2048 bytes (Section 4.4 payload).
                      </p>
                    </div>

                    {/* Phone inputs form simulating client billing entry */}
                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Telebirr Mobile number</label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            value={telebirrMobileNum}
                            onInput={(e) => setTelebirrMobileNum(e.currentTarget.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                            placeholder="09xxxxxxxx"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Passcode PIN</label>
                          <input 
                            type="password"
                            maxLength={4}
                            value={telebirrPin}
                            onInput={(e) => setTelebirrPin(e.currentTarget.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none text-center tracking-widest font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Security Code</label>
                          <input 
                            type="text"
                            value={secCode}
                            onInput={(e) => setSecCode(e.currentTarget.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Execution triggers callback actions */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => executeSandboxTrigger(true)}
                        disabled={simulatingCallback}
                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 hover:scale-101 text-white font-extrabold rounded-xl text-xs transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {simulatingCallback ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-white flex-shrink-0" />
                        ) : 'Confirm H5 payment (SUCCESS)'}
                      </button>
                      
                      <button
                        onClick={() => executeSandboxTrigger(false)}
                        disabled={simulatingCallback}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1 bg-transparent border border-rose-200 cursor-pointer"
                      >
                        Decline Trade (FAIL Simulation)
                      </button>
                    </div>

                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
