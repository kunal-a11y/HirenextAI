import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Megaphone } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { Logo } from "../Logo";
import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";

const navLinks = [
  { href: "/", labelKey: "home", sectionId: "home" },
  { href: "/features", labelKey: "features" },
  { href: "/extension", labelKey: "extension" },
  { href: "/pricing", labelKey: "pricing" },
  { href: "/updates", labelKey: "updates", highlight: true },
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
];

export function Navbar() {
  const { isAuthenticated, token: storeToken } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const token = storeToken || localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      navigate("/");
    }
  };

  const handleNavLink = (sectionId) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed inset-x-0 top-0 z-[1000] border-b transition-all duration-300 ${
        scrolled 
          ? "border-white/10 bg-[#030307]/95 backdrop-blur-2xl shadow-lg" 
          : "border-white/[0.06] bg-[#06060d]/60 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo size="sm" onClick={handleLogoClick} />

        <div className="hidden items-center gap-5 md:flex">
          <div className="flex items-center gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => {
                  if (item.href === "/features") {
                    e.preventDefault();
                    navigate("/features");
                  } else if (item.href === "/extension") {
                    e.preventDefault();
                    navigate("/extension");
                  } else if (item.href === "/pricing") {
                    e.preventDefault();
                    navigate("/pricing");
                  } else if (item.href === "/about") {
                    e.preventDefault();
                    navigate("/about");
                  } else if (item.href === "/contact") {
                    e.preventDefault();
                    navigate("/contact");
                  } else if (item.sectionId) {
                    e.preventDefault();
                    handleNavLink(item.sectionId);
                  }
                }}
                aria-label={t(item.labelKey)}
                className="group relative py-2 text-sm font-medium text-white/68 transition-colors duration-200 hover:text-[#8B5CF6]"
              >
                <span className="inline-flex items-center gap-1.5">
                  {item.href === "/updates" && (
                    <Megaphone 
                      size={14} 
                      className="mr-[5px] inline-block"
                      style={{ 
                        color: '#A78BFA',
                        animation: 'megaphoneFade 3s ease infinite',
                        transformOrigin: 'bottom center'
                      }} 
                    />
                  )}
                  {t(item.labelKey)}
                  {item.highlight && (
                    <span 
                      style={{ 
                        background: 'rgba(139,92,246,0.2)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#A78BFA',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '99px',
                        letterSpacing: '0.05em',
                        animation: 'badgePulse 2s ease infinite'
                      }}
                    >
                      NEW
                    </span>
                  )}
                </span>
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-white/10" />

          {token ? (
            <button onClick={() => navigate('/chat')} className="btn-primary h-10 px-5 text-sm flex items-center justify-center">
              Chat Now
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/login')} 
                className="border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl h-10 px-5 text-sm transition-all flex items-center justify-center"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className="btn-primary h-10 px-5 text-sm transition-all hover:shadow-[0_0_24px_rgba(139,92,246,0.35)] flex items-center justify-center"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        <button
          className="rounded-xl p-2 text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 border-t border-white/6 bg-[#06060d]/95 px-4 py-5 backdrop-blur-xl md:hidden"
          >
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                aria-label={t(item.labelKey)}
                onClick={(e) => {
                  setMobileOpen(false);
                  if (item.href === "/features") {
                    e.preventDefault();
                    navigate("/features");
                  } else if (item.href === "/extension") {
                    e.preventDefault();
                    navigate("/extension");
                  } else if (item.href === "/pricing") {
                    e.preventDefault();
                    navigate("/pricing");
                  } else if (item.href === "/about") {
                    e.preventDefault();
                    navigate("/about");
                  } else if (item.href === "/contact") {
                    e.preventDefault();
                    navigate("/contact");
                  } else if (item.sectionId) {
                    e.preventDefault();
                    handleNavLink(item.sectionId);
                  }
                }}
                className="block rounded-2xl px-3 py-2.5 text-sm font-medium text-white/72 transition-all hover:bg-white/[0.05] hover:text-white"
              >
                <span className="inline-flex items-center gap-2">
                  {item.href === "/updates" && (
                    <Megaphone 
                      size={14} 
                      className="mr-[5px] inline-block"
                      style={{ 
                        color: '#A78BFA',
                        animation: 'megaphoneFade 3s ease infinite',
                        transformOrigin: 'bottom center'
                      }} 
                    />
                  )}
                  {t(item.labelKey)}
                  {item.highlight && (
                    <span 
                      style={{ 
                        background: 'rgba(139,92,246,0.2)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#A78BFA',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '99px',
                        letterSpacing: '0.05em',
                        animation: 'badgePulse 2s ease infinite'
                      }}
                    >
                      NEW
                    </span>
                  )}
                </span>
              </Link>
            ))}

            <div className="h-px bg-white/6" />

            {token ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/chat');
                }}
                className="block w-full btn-primary px-5 py-2.5 text-center text-sm font-medium text-white"
              >
                Chat Now
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/login');
                  }}
                  className="block w-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white py-2.5 rounded-xl text-center text-sm font-medium transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/register');
                  }}
                  className="block w-full btn-primary py-2.5 rounded-xl text-center text-sm font-medium text-white"
                >
                  Get Started
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes megaphoneFade {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          45% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0;
            transform: scale(0.8);
          }
          55% {
            opacity: 1;
            transform: scale(1.1);
          }
          60% {
            transform: scale(1);
          }
        }
      `}</style>
    </motion.nav>
  );
}
