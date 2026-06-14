import anime from 'animejs';

// Floating Particles Animation
export const animateFloatingParticles = (containerSelector) => {
  const particles = document.querySelectorAll(`${containerSelector} .particle`);
  
  particles.forEach((particle, index) => {
    anime({
      targets: particle,
      y: [0, -30, 0],
      x: [0, Math.sin(index) * 20, 0],
      opacity: [0.3, 0.8, 0.3],
      duration: 3000 + Math.random() * 2000,
      delay: index * 50,
      easing: 'easeInOutQuad',
      loop: true,
    });
  });
};

// Morphing Blob Animation
export const animateMorphingBlobs = (selector) => {
  const blobs = document.querySelectorAll(selector);
  
  blobs.forEach((blob, index) => {
    anime({
      targets: blob,
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
      duration: 8000 + index * 1000,
      easing: 'easeInOutQuad',
      loop: true,
    });
  });
};

// Word Stagger Animation
export const animateWordStagger = (containerSelector) => {
  const words = document.querySelectorAll(`${containerSelector} .word`);
  
  anime({
    targets: words,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 600,
    delay: anime.stagger(100),
    easing: 'easeOutQuad',
  });
};

// Counter Animation (from 0 to target)
export const animateCounter = (selector, target, duration = 2000) => {
  return anime({
    targets: { value: 0 },
    value: target,
    round: 1,
    duration,
    easing: 'easeOutQuad',
    update(anim) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.textContent = Math.round(anim.progress * target);
      });
    },
  });
};

// Card Stagger on Scroll
export const animateCardStaggerOnScroll = (containerSelector) => {
  const cards = document.querySelectorAll(`${containerSelector} .card`);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          easing: 'easeOutQuad',
        });
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
    
    anime({
      targets: path,
      strokeDashoffset: [length, 0],
      duration: 1000 + index * 100,
      delay: index * 150,
      easing: 'easeInOutQuad',
    });
  });
};

// Mic Pulse Rings Animation
export const animateMicPulseRings = (containerSelector) => {
  const rings = document.querySelectorAll(`${containerSelector} .pulse-ring`);
  
  rings.forEach((ring, index) => {
    anime({
      targets: ring,
      r: [5, 25],
      opacity: [0.8, 0],
      duration: 1500,
      delay: index * 200,
      easing: 'easeOutQuad',
      loop: true,
    });
  });
};

// Typing Bounce Dots Animation
export const animateTypingDots = (containerSelector) => {
  const dots = document.querySelectorAll(`${containerSelector} .dot`);
  
  anime({
    targets: dots,
    translateY: [0, -8, 0],
    duration: 600,
    delay: anime.stagger(100),
    easing: 'easeInOutQuad',
    loop: true,
  });
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
    
    anime({
      targets: path,
      strokeDashoffset: [length, 0],
      duration: 800,
      easing: 'easeOutQuad',
    });
  });
};

// Form Shake Animation (for errors)
export const animateFormShake = (selector) => {
  anime({
    targets: selector,
    translateX: [0, -8, 8, -4, 4, 0],
    duration: 400,
    easing: 'easeInOutQuad',
  });
};

// Input Focus Glow Animation
export const animateInputFocusGlow = (selector) => {
  anime({
    targets: selector,
    boxShadow: [
      '0 0 0 0 rgba(139, 92, 246, 0.1)',
      '0 0 20px 5px rgba(139, 92, 246, 0.3)',
    ],
    duration: 400,
    easing: 'easeOutQuad',
  });
};

// Button Ripple Effect
export const animateButtonRipple = (event) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  button.appendChild(ripple);
  
  anime({
    targets: ripple,
    scale: [0, 1],
    opacity: [0.5, 0],
    duration: 600,
    easing: 'easeOutQuad',
    complete() {
      ripple.remove();
    },
  });
};

// Scroll Reveal Animation
export const animateScrollReveal = (selector, options = {}) => {
  const elements = document.querySelectorAll(selector);
  const {
    duration = 800,
    delay = 0,
    stagger = 50,
    direction = 'up', // 'up', 'down', 'left', 'right'
  } = options;
  
  const translateMap = {
    up: { y: [40, 0] },
    down: { y: [-40, 0] },
    left: { x: [40, 0] },
    right: { x: [-40, 0] },
  };
  
  elements.forEach((el, index) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anime({
            targets: el,
            opacity: [0, 1],
            ...translateMap[direction],
            duration,
            delay: delay + index * stagger,
            easing: 'easeOutCubic',
          });
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(el);
  });
};

// Infinite Float Animation
export const animateInfiniteFloat = (selector) => {
  anime({
    targets: selector,
    translateY: [0, -20, 0],
    duration: 3000,
    easing: 'easeInOutQuad',
    loop: true,
  });
};

// Gradient Shift Animation
export const animateGradientShift = (selector) => {
  anime({
    targets: selector,
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    duration: 6000,
    easing: 'easeInOutQuad',
    loop: true,
  });
};

// Number Count-up with Format
export const animateCountUp = (selector, target, options = {}) => {
  const { duration = 2000, delay = 0 } = options;
  
  return anime({
    targets: { value: 0 },
    value: target,
    round: 1,
    duration,
    delay,
    easing: 'easeOutQuad',
    update(anim) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const formatted = Math.round(anim.progress * target).toLocaleString();
        el.textContent = formatted;
      });
    },
  });
};

// Cleanup function to remove all anime instances
export const cleanupAnimations = () => {
  anime.set('*', {
    autoplay: false,
  });
  anime.timeline().pause();
};

// Get all running animations
export const getRunningAnimations = () => {
  return anime.running;
};
