import { useEffect } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    badge: 'FREE',
    badgeClass: 'from-zinc-150 to-neutral-200 text-neutral-800 border-neutral-300',
    price: 0,
    features: [
      { text: 'HirenextAI 0.1 model access', included: true },
      { text: '5,000 Daily Credits', included: true },
      { text: 'ATS Resume Builder', included: true },
      { text: 'Basic ATS Resume Analysis', included: true },
      { text: 'Job Search & Tracking', included: true },
      { text: 'AI Career Assistant', included: true },
    ],
    cta: 'Current Plan',
    disabled: true,
    buttonClass: 'border border-neutral-200 text-neutral-400 bg-transparent cursor-not-allowed',
    cardClass: 'border-neutral-200 bg-white',
  },
  {
    id: 'plus',
    name: 'Plus',
    badge: 'POPULAR',
    badgeClass: 'from-blue-500 to-indigo-650 text-white border-transparent',
    price: 149,
    features: [
      { text: 'HirenextAI Flash model access', included: true },
      { text: 'Faster response speeds', included: true },
      { text: '20,000 Monthly Credits', included: true },
      { text: 'Better ATS Resume Analysis', included: true },
      { text: 'Unlimited Job Search', included: true },
      { text: 'AI Cover Letters & Roadmaps', included: true },
    ],
    cta: 'Upgrade to Plus',
    disabled: false,
    buttonClass: 'bg-black text-white hover:bg-neutral-800 font-bold shadow-sm',
    cardClass: 'border-black bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)]',
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'PRO',
    badgeClass: 'from-purple-500 to-indigo-650 text-white border-transparent',
    price: 299,
    features: [
      { text: 'HirenextAI Pro model access', included: true },
      { text: 'Unlimited Credits (Fair Usage)', included: true },
      { text: 'Fastest AI Responses', included: true },
      { text: 'Premium Resume Intelligence', included: true },
      { text: 'Advanced Interview AI', included: true },
      { text: 'Recruiter Dashboard access', included: true },
    ],
    cta: 'Upgrade to Pro',
    disabled: false,
    buttonClass: 'bg-black text-white hover:bg-neutral-800 font-bold shadow-sm',
    cardClass: 'border-neutral-200 bg-white',
  },
];

const PricingModal = () => {
  const { pricingModalOpen, setPricingModalOpen } = useUIStore();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setPricingModalOpen(false);
    };
    if (pricingModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [pricingModalOpen, setPricingModalOpen]);

  const handleUpgrade = (plan) => {
    if (!plan.disabled) {
      window.location.href = '/pricing';
    }
  };

  return (
    <AnimatePresence>
      {pricingModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-white/80 backdrop-blur-md"
            onClick={() => setPricingModalOpen(false)}
          />
          <div
            className="fixed inset-0 z-[1101] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setPricingModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-full max-w-5xl my-6 rounded-2xl border border-neutral-150 bg-neutral-50 shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-50 border border-neutral-150 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-all z-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)',
                }}
              />

              <div className="relative px-6 py-5 flex items-center justify-between border-b border-neutral-150 bg-white">
                <h2 className="text-base font-extrabold text-black">Choose your plan</h2>
                <button
                  type="button"
                  onClick={() => setPricingModalOpen(false)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {PLANS.map((plan, idx) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className={` relative flex flex-col bg-white rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.02)] ${plan.cardClass} `}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={`whitespace-nowrap text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border bg-gradient-to-r shadow-sm ${plan.badgeClass}`}
                        >
                          {plan.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-black mt-4 mb-1 flex items-center gap-1.5">
                        {plan.name}
                        {plan.id === 'plus' && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 text-blue-750 font-extrabold uppercase tracking-wider">Popular</span>}
                      </h3>
                      <div className="flex items-baseline gap-0.5 mb-6">
                        <span className="text-sm font-semibold text-neutral-400">₹</span>
                        <span className="text-4xl font-extrabold text-black">{plan.price}</span>
                        <span className="text-xs text-neutral-400 font-bold uppercase ml-0.5">/mo</span>
                      </div>

                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((f) => (
                          <li key={f.text} className="flex items-start gap-2.5 text-xs font-medium">
                            {f.included ? (
                              <CheckCircle2
                                size={15}
                                className="text-emerald-550 shrink-0 mt-0.5"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <XCircle size={15} className="text-neutral-200 shrink-0 mt-0.5" />
                            )}
                            <span className={f.included ? 'text-neutral-700' : 'text-neutral-400 line-through'}>
                              {f.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        disabled={plan.disabled}
                        onClick={() => handleUpgrade(plan)}
                        className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${plan.buttonClass}`}
                      >
                        {plan.cta}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;
