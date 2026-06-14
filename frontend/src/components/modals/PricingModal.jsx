import { useEffect } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    badge: 'Get Started',
    badgeClass: 'bg-white/10 text-white/70 border-white/20',
    price: 0,
    features: [
      { text: '20 AI Credits/month', included: true },
      { text: '10 Job Applications tracking', included: true },
      { text: 'Basic Job Search', included: true },
      { text: 'AI Chat (1 credit/message)', included: true },
      { text: 'Cover Letter (2 credits each)', included: true },
      { text: 'Resume Review (3 credits each)', included: true },
    ],
    cta: 'Current Plan',
    disabled: true,
    buttonClass: 'border border-white/20 text-white/50 bg-transparent cursor-not-allowed',
    cardClass: 'border-white/10',
    isPro: false,
    isUltimate: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular',
    badgeClass: 'bg-purple-500/25 text-purple-200 border-purple-500/50',
    price: 299,
    features: [
      { text: '200 AI Credits/month', included: true },
      { text: 'Unlimited Job Tracking', included: true },
      { text: 'Advanced Job Search', included: true },
      { text: 'Unlimited AI Chat', included: true },
      { text: 'Unlimited Cover Letters', included: true },
      { text: 'Unlimited Resume Reviews', included: true },
      { text: 'Apply with AI (Extension)', included: true },
      { text: 'Mock Interview AI (5/day)', included: true },
    ],
    cta: 'Upgrade to Pro',
    disabled: false,
    buttonClass: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white shadow-[0_0_24px_rgba(139,92,246,0.4)] hover:opacity-95',
    cardClass: 'border-[#8B5CF6]/50 shadow-[0_0_40px_rgba(139,92,246,0.2)]',
    isPro: true,
    isUltimate: false,
  },
  {
    id: 'max',
    name: 'Max',
    badge: 'Power User',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    price: 599,
    features: [
      { text: 'Unlimited AI Credits', included: true },
      { text: 'Unlimited Everything in Pro', included: true },
      { text: 'Mock Interview AI (Unlimited)', included: true },
      { text: 'Priority Support (24hr)', included: true },
      { text: 'Early Access to New Features', included: true },
      { text: 'Advanced Analytics Dashboard', included: true },
      { text: 'LinkedIn Profile Optimization', included: true },
      { text: '1 Career Coaching Session/month', included: true },
    ],
    cta: 'Upgrade to Max',
    disabled: false,
    buttonClass: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white hover:opacity-95',
    cardClass: 'border-white/10',
    isPro: false,
    isUltimate: false,
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    badge: 'Family & Friends',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    price: 999,
    features: [
      { text: 'Everything in Max', included: true },
      { text: 'Up to 5 Members', included: true },
      { text: 'Each member gets full Pro access', included: true },
      { text: 'Shared Job Tracking Dashboard', included: true },
      { text: 'Family Admin Panel', included: true },
      { text: 'Priority Support (12hr)', included: true },
      { text: 'Unlimited AI Credits for all members', included: true },
      { text: 'All AI Features for all members', included: true },
      { text: 'Early Access to New Features', included: true },
    ],
    cta: 'Get Ultimate',
    disabled: false,
    buttonClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:opacity-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    cardClass: 'border-amber-500/40',
    isPro: false,
    isUltimate: true,
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
            className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md"
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
              className="w-full max-w-6xl my-6 rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.15), transparent 70%)',
                }}
              />

              <div className="relative px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
                <h2 className="text-xl font-bold text-white">Choose your plan</h2>
                <button
                  type="button"
                  onClick={() => setPricingModalOpen(false)}
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="relative p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">
                  {PLANS.map((plan, idx) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className={`
                        relative flex flex-col bg-[#0f0f1a] rounded-2xl p-6 border transition-all duration-300
                        hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]
                        ${plan.cardClass}
                      `}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${plan.badgeClass}`}
                        >
                          {plan.badge}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-white mt-4 mb-3">{plan.name}</h3>
                      <div className="flex items-baseline gap-0.5 mb-6">
                        <span className="text-lg font-semibold text-white/80">₹</span>
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-sm text-white/40 ml-0.5">/mo</span>
                      </div>

                      <ul className="space-y-2.5 mb-8 flex-1">
                        {plan.features.map((f) => (
                          <li key={f.text} className="flex items-start gap-2 text-[13px]">
                            {f.included ? (
                              <CheckCircle2
                                size={16}
                                className="text-[#8B5CF6] shrink-0 mt-0.5"
                                strokeWidth={2}
                              />
                            ) : (
                              <XCircle size={16} className="text-white/20 shrink-0 mt-0.5" />
                            )}
                            <span className={f.included ? 'text-white/75' : 'text-white/25 line-through'}>
                              {f.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        disabled={plan.disabled}
                        onClick={() => handleUpgrade(plan)}
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${plan.buttonClass}`}
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
