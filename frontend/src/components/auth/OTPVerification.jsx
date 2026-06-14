import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function OTPVerification({ phone, onVerify, onResend }) {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    
    // Auto focus next
    if (index < 5) inputs.current[index + 1]?.focus();
    
    // Auto verify when all 6 digits entered
    if (newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async (code) => {
    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL ?? '/api';
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: code })
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
        // Pass data.token and also the user object if available
        onVerify(data.token, data.user);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(Array(6).fill(''));
        inputs.current[0]?.focus();
      }
    } catch(e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-[#0f0f1a] border border-white/10 rounded-3xl p-8 text-center"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">📱</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Verify your number</h2>
        <p className="text-white/50 text-sm mb-8">
          We've sent a 6-digit code to<br/>
          <span className="text-white font-medium">{phone}</span>
        </p>

        {/* OTP Boxes */}
        <motion.div
          animate={error ? { x: [-8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center gap-3 mb-6"
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-bold bg-white/5 text-white outline-none transition-all duration-200 ${
                digit 
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' 
                  : error 
                    ? 'border-rose-500/60 bg-rose-500/5'
                    : 'border-white/15 focus:border-[#8B5CF6]/60 focus:bg-[#8B5CF6]/5'
              }`}
            />
          ))}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose-400 text-sm mb-4"
          >
            {error}
          </motion.p>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-white/40 text-sm mb-4">Verifying...</p>
        )}

        {/* Success */}
        {isVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-emerald-400 text-sm mb-4 flex items-center justify-center gap-2"
          >
            ✅ Verified successfully!
          </motion.div>
        )}

        {/* Resend */}
        <p className="text-white/40 text-sm">
          Didn't receive the code?{' '}
          <button
            onClick={onResend}
            className="text-[#8B5CF6] font-semibold hover:text-purple-300 transition-colors"
          >
            Resend
          </button>
        </p>
      </motion.div>
    </div>
  );
}
