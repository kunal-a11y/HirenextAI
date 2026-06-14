import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, CheckCircle } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({ analytics: false, preference: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
          setShowBanner(true);
        } else {
          const parsed = JSON.parse(consent);
          setPreferences({
            analytics: !!parsed.analytics,
            preference: !!parsed.preference
          });
          setShowBanner(false);
        }
      } catch (e) {
        setShowBanner(true);
      }
    };

    checkConsent();

    window.addEventListener("show-cookie-banner", checkConsent);
    return () => {
      window.removeEventListener("show-cookie-banner", checkConsent);
    };
  }, []);

  const acceptAll = () => {
    const consent = { necessary: true, analytics: true, preference: true };
    try {
      localStorage.setItem("cookie_consent", JSON.stringify(consent));
    } catch (e) {}
    setPreferences({ analytics: true, preference: true });
    setShowBanner(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const acceptNecessary = () => {
    const consent = { necessary: true, analytics: false, preference: false };
    try {
      localStorage.setItem("cookie_consent", JSON.stringify(consent));
    } catch (e) {}
    setPreferences({ analytics: false, preference: false });
    setShowBanner(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const savePreferences = () => {
    const consent = { necessary: true, analytics: preferences.analytics, preference: preferences.preference };
    try {
      localStorage.setItem("cookie_consent", JSON.stringify(consent));
    } catch (e) {}
    setShowBanner(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      {/* FIXED COOKIE CONSENT BANNER */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="max-w-5xl mx-auto bg-[#0f0f18] border border-white/10 rounded-2xl p-5 md:p-7 shadow-[0_-8px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Cookie className="w-5 h-5 text-amber-400" />
                    <span className="text-white font-bold text-base">Cookie Preferences</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                      We respect your privacy
                    </span>
                  </div>
                  <p className="text-white/50 text-sm font-light leading-relaxed max-w-xl">
                    We use cookies to keep you logged in, understand how you use HirenextAI, and remember your preferences. You control what we store.
                  </p>
                  
                  <div className="flex flex-wrap gap-5 mt-4">
                    <div
                      onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <div
                        style={{ backgroundColor: preferences.analytics ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}
                        className="relative w-10 h-5 rounded-full transition-colors duration-300"
                      >
                        <motion.div
                          animate={{ x: preferences.analytics ? 20 : 2 }}
                          transition={{ type: "spring", stiffness: 500 }}
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                        />
                      </div>
                      <span className="text-white/60 text-xs font-medium">Analytics cookies</span>
                    </div>

                    <div
                      onClick={() => setPreferences(p => ({ ...p, preference: !p.preference }))}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <div
                        style={{ backgroundColor: preferences.preference ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}
                        className="relative w-10 h-5 rounded-full transition-colors duration-300"
                      >
                        <motion.div
                          animate={{ x: preferences.preference ? 20 : 2 }}
                          transition={{ type: "spring", stiffness: 500 }}
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                        />
                      </div>
                      <span className="text-white/60 text-xs font-medium">Preference cookies</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                  <button onClick={acceptNecessary} className="btn-secondary py-2.5 px-5 text-sm text-white whitespace-nowrap w-full sm:w-auto">
                    Necessary Only
                  </button>
                  <button onClick={savePreferences} className="btn-secondary py-2.5 px-5 text-sm text-white whitespace-nowrap w-full sm:w-auto">
                    Save Preferences
                  </button>
                  <button onClick={acceptAll} className="btn-primary py-2.5 px-5 text-sm whitespace-nowrap w-full sm:w-auto text-white">
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION TOAST */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-24 right-6 z-[9999] inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#0f0f18]/95 border border-emerald-500/30 text-emerald-400 text-sm font-semibold shadow-[0_8px_30px_rgba(16,185,129,0.15)] backdrop-blur-xl"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-white/90">Cookie preferences saved!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
