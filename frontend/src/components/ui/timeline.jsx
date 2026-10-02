import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent, useInView } from "framer-motion";
import { Check } from "lucide-react";

export function ScrollTimelineTrack({ containerRef, lineXClass = "left-6 md:left-8", topOffset = 22, bottomOffset = 22 }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Smooth spring physics for the line painting animation (60fps feel)
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 18,
    restDelta: 0.001
  });

  return (
    <div 
      className={`absolute ${lineXClass} w-[3px] bg-[#E8E8E8] -translate-x-1/2 rounded-full overflow-hidden`}
      style={{
        top: `${topOffset}px`,
        bottom: `${bottomOffset}px`,
      }}
    >
      <motion.div
        style={{ scaleY }}
        className="w-full bg-[#000000] h-full origin-top rounded-full"
      />
    </div>
  );
}

export function TimelineNode({ scrollYProgress, index, total, nodeClass = "left-6 md:left-8 top-[12px]" }) {
  const [active, setActive] = useState(false);
  const threshold = total > 1 ? index / (total - 1) : 0;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0px" });

  // Handle initial page load scroll position state
  useEffect(() => {
    const latestVal = scrollYProgress.get();
    if (latestVal >= threshold) {
      setActive(true);
    }
  }, [scrollYProgress, threshold]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isInView || latest >= 0.99 || latest <= 0.01) {
      if (latest >= threshold) {
        setActive(true);
      } else {
        setActive(false);
      }
    }
  });

  return (
    <div 
      ref={ref}
      className={`absolute ${nodeClass} -translate-x-1/2 z-10 flex items-center justify-center w-[22px] h-[22px] overflow-visible`}
    >
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="active"
            initial={{ scale: 0.8, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.8, rotate: 12, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-[22px] h-[22px] rounded-full bg-black border-2 border-black flex items-center justify-center shadow-[0_0_8px_rgba(0,0,0,0.06)]"
          >
            <Check className="w-[11px] h-[11px] text-white stroke-[3.5px]" />
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            className="w-[22px] h-[22px] rounded-full bg-white border-2 border-black"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
