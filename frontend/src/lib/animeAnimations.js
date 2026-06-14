// Simplified animation utilities using requestAnimationFrame
// Compatible with modern browsers and works without complex anime.js setup

// Floating Particles Animation
export const animateFloatingParticles = (containerSelector) => {
  const particles = document.querySelectorAll(`${containerSelector} .particle`);
  
  particles.forEach((particle, index) => {
    const animationDuration = 3000 + Math.random() * 2000;
    const startTime = Date.now();
    const startY = Math.random() * 30;
    const startX = Math.sin(index) * 20;
    const endY = -30;
    const endX = Math.cos(index) * 30;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % animationDuration) / animationDuration;
      
      const y = startY + (endY - startY) * Math.sin(progress * Math.PI);
      const x = startX + (endX - startX) * Math.sin(progress * Math.PI);
      const opacity = 0.3 + 0.5 * Math.sin(progress * Math.PI);
      
      particle.style.transform = `translate(${x}px, ${y}px)`;
      particle.style.opacity = opacity;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  });
};

// Morphing Blob Animation
export const animateMorphingBlobs = (selector) => {
  const blobs = document.querySelectorAll(selector);
  
  blobs.forEach((blob, index) => {
    let rotation = 0;
    let scale = 1;
    const duration = 8000 + index * 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      
      rotation = progress * 360;
      scale = 1 + 0.2 * Math.sin(progress * Math.PI * 2);
      
      blob.style.transform = `rotate(${rotation}deg) scale(${scale})`;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  });
};

// Word Stagger Animation - for sequential text reveals
export const animateWordStagger = (containerSelector) => {
  const words = document.querySelectorAll(`${containerSelector} .word`);
  const staggerDelay = 100;
  
  words.forEach((word, index) => {
    setTimeout(() => {
      word.style.opacity = '1';
      word.style.transform = 'translateY(0)';
      word.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    }, staggerDelay * index);
  });
};

// Counter Animation
export const animateCounter = (selector, target, duration = 2000) => {
  const elements = document.querySelectorAll(selector);
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(progress * target);
    
    elements.forEach(el => {
      el.textContent = value;
    });
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

// Card Stagger on Scroll
export const animateCardStaggerOnScroll = (containerSelector) => {
  const cards = document.querySelectorAll(`${containerSelector} .card`);
  const staggerDelay = 100;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cardIndex = Array.from(cards).indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        }, staggerDelay * cardIndex);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  cards.forEach(card => observer.observe(card));
};

// SVG Path Drawing Animation
export const animateSVGPathDraw = (selector) => {
  const paths = document.querySelectorAll(`${selector} path`);
  
  paths.forEach((path, index) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    
    setTimeout(() => {
      const startTime = Date.now();
      const duration = 1000;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        path.style.strokeDashoffset = length * (1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }, index * 150);
  });
};

// Mic Pulse Rings Animation
export const animateMicPulseRings = (containerSelector) => {
  const rings = document.querySelectorAll(`${containerSelector} .pulse-ring`);
  
  rings.forEach((ring, index) => {
    setTimeout(() => {
      const startTime = Date.now();
      const duration = 1500;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        
        const r = 5 + progress * 20;
        const opacity = 0.8 * (1 - progress);
        
        ring.setAttribute('r', r);
        ring.style.opacity = opacity;
        
        requestAnimationFrame(animate);
      };
      
      animate();
    }, index * 200);
  });
};

// Typing Bounce Dots Animation
export const animateTypingDots = (containerSelector) => {
  const dots = document.querySelectorAll(`${containerSelector} .dot`);
  const staggerDelay = 100;
  
  const animate = () => {
    dots.forEach((dot, index) => {
      const startTime = Date.now();
      const duration = 600;
      
      const doAnimate = () => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        const y = -8 * Math.sin(progress * Math.PI);
        
        dot.style.transform = `translateY(${y}px)`;
        
        requestAnimationFrame(doAnimate);
      };
      
      setTimeout(doAnimate, staggerDelay * index);
    });
  };
  
  animate();
};

// Checkmark Draw Animation
export const animateCheckmarkDraw = (selector) => {
  const checkmarks = document.querySelectorAll(selector);
  
  checkmarks.forEach((checkmark) => {
    const path = checkmark.querySelector('path');
    if (!path) return;
    
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    
    const startTime = Date.now();
    const duration = 800;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      path.style.strokeDashoffset = length * (1 - progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  });
};

// Form Shake Animation
export const animateFormShake = (selector) => {
  const element = document.querySelector(selector);
  if (!element) return;
  
  const shakeSequence = [0, -8, 8, -4, 4, 0];
  const startTime = Date.now();
  const duration = 400;
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;
    
    if (progress < 1) {
      const index = Math.floor(progress * (shakeSequence.length - 1));
      const currentX = shakeSequence[index];
      element.style.transform = `translateX(${currentX}px)`;
      requestAnimationFrame(animate);
    } else {
      element.style.transform = 'translateX(0)';
    }
  };
  
  animate();
};

// Input Focus Glow Animation
export const animateInputFocusGlow = (selector) => {
  const element = document.querySelector(selector);
  if (!element) return;
  
  const startTime = Date.now();
  const duration = 400;
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const shadow = `0 0 ${20 * progress}px ${5 * progress}px rgba(139, 92, 246, ${0.3 * progress})`;
    element.style.boxShadow = shadow;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

// Scroll Reveal Animation
export const animateScrollReveal = (selector, options = {}) => {
  const elements = document.querySelectorAll(selector);
  const {
    duration = 800,
    delay = 0,
    stagger = 50,
    direction = 'up',
  } = options;
  
  const directionMap = {
    up: { startY: 40, endY: 0 },
    down: { startY: -40, endY: 0 },
    left: { startX: 40, endX: 0 },
    right: { startX: -40, endX: 0 },
  };
  
  const config = directionMap[direction];
  
  elements.forEach((el, index) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            const startTime = Date.now();
            
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              if (config.startY !== undefined) {
                const y = config.startY + (config.endY - config.startY) * progress;
                el.style.transform = `translateY(${y}px)`;
              } else {
                const x = config.startX + (config.endX - config.startX) * progress;
                el.style.transform = `translateX(${x}px)`;
              }
              
              el.style.opacity = progress;
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            
            animate();
          }, delay + index * stagger);
          
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(el);
  });
};

// Infinite Float Animation
export const animateInfiniteFloat = (selector) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((el) => {
    const startTime = Date.now();
    const duration = 3000;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      const y = -20 * Math.sin(progress * Math.PI * 2);
      
      el.style.transform = `translateY(${y}px)`;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  });
};

// Gradient Shift Animation
export const animateGradientShift = (selector) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((el) => {
    const startTime = Date.now();
    const duration = 6000;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = ((elapsed % duration) / duration) * 100;
      
      el.style.backgroundPosition = `${progress}% 50%`;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  });
};

// Number Count-up
export const animateCountUp = (selector, target, options = {}) => {
  const { duration = 2000, delay = 0 } = options;
  
  setTimeout(() => {
    animateCounter(selector, target, duration);
  }, delay);
};

// Get all animated elements (simple tracking)
export const getRunningAnimations = () => {
  return [];
};
