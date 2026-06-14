import { useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

export const AI_MODELS = [
  { id: 'hirenext-flash', name: 'HirenextAI Flash', description: 'Fast & efficient' },
  { id: 'hirenext-pro', name: 'HirenextAI Pro', description: 'Most capable' },
];

const ModelSelector = ({ selectedModel, onSelect, open, onOpenChange }) => {
  const { t } = useTranslation();
  const current = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-model-selector]')) onOpenChange(false);
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, onOpenChange]);

  return (
    <div className="relative" data-model-selector>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`
          flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full text-[12px] font-medium
          border transition-all duration-200
          ${open
            ? 'bg-purple-500/15 border-purple-500/40 text-white'
            : 'bg-white/[0.04] border-white/10 text-white/70 hover:border-purple-500/30 hover:bg-white/[0.07] hover:text-white'}
        `}
      >
        <span className="max-w-[110px] truncate">{current.name}</span>
        <ChevronDown
          size={14}
          className={`text-white/50 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-0 mb-2 w-[260px] z-50 origin-bottom-left"
          >
            <div className="rounded-2xl border border-white/10 bg-[#12121c]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">AI Model</p>
              </div>
              <div className="p-1.5">
                {AI_MODELS.map((model) => {
                  const selected = selectedModel === model.id && !model.disabled;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      disabled={model.disabled}
                      onClick={() => {
                        if (!model.disabled) {
                          onSelect(model.id);
                          onOpenChange(false);
                        }
                      }}
                      className={`
                        w-full text-left px-3 py-3 rounded-xl flex gap-3 items-start transition-colors
                        ${model.disabled ? 'opacity-45 cursor-not-allowed' : 'hover:bg-white/[0.06]'}
                        ${selected ? 'bg-purple-500/12 ring-1 ring-purple-500/25' : ''}
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white/95">{model.name}</p>
                        <p className="text-[11px] text-white/40 mt-0.5 leading-snug">{model.description}</p>
                      </div>
                      {selected && (
                        <Check size={16} className="text-purple-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="px-3 py-2 text-[10px] text-center text-white/25 border-t border-white/[0.06]">
                {t('moreComingSoon')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
