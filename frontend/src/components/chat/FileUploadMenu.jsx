import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useUIStore from '../../store/useUIStore';

const FILE_ACCEPT = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp';

const FileUploadMenu = ({ onFileSelect, positionedByParent = false }) => {
  const { plusPopupOpen, setPlusPopupOpen, setConnectModalOpen } = useUIStore();
  const popupRef = useRef(null);
  const fileInputRef = useRef(null);
  const [portalPos, setPortalPos] = useState(null);

  useEffect(() => {
    if (!plusPopupOpen || !positionedByParent) {
      setPortalPos(null);
      return;
    }
    const updatePosition = () => {
      const btn = document.querySelector('[data-plus-trigger]');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setPortalPos({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 8,
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [plusPopupOpen, positionedByParent]);

  useEffect(() => {
    if (!plusPopupOpen) return;
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        const plusBtn = event.target.closest('[data-plus-trigger]');
        if (!plusBtn) setPlusPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [plusPopupOpen, setPlusPopupOpen]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect?.(file);
      setPlusPopupOpen(false);
    }
    e.target.value = '';
  };

  const openConnect = () => {
    setPlusPopupOpen(false);
    setConnectModalOpen(true);
  };

  const menuContent = (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className="w-[220px] origin-bottom-left"
      style={
        positionedByParent && portalPos
          ? {
              position: 'fixed',
              left: portalPos.left,
              bottom: portalPos.bottom,
              zIndex: 9999,
            }
          : undefined
      }
    >
      <div className="rounded-xl border border-white/10 bg-[#12121c]/98 backdrop-blur-xl p-1.5 shadow-2xl shadow-purple-500/10">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <Upload size={17} className="text-purple-400 shrink-0" />
          Upload File
        </button>
        <button
          type="button"
          onClick={openConnect}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <Link2 size={17} className="text-purple-400 shrink-0" />
          Connect Account
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={FILE_ACCEPT}
        onChange={handleFile}
      />
    </motion.div>
  );

  if (!plusPopupOpen) return null;

  if (positionedByParent) {
    if (!portalPos) return null;
    return createPortal(
      <AnimatePresence>{menuContent}</AnimatePresence>,
      document.body
    );
  }

  return (
    <AnimatePresence>
      <div className="absolute bottom-full left-0 mb-2 w-[220px] z-50">{menuContent}</div>
    </AnimatePresence>
  );
};

export default FileUploadMenu;
