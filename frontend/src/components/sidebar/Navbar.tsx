import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Megaphone, Rocket } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { tForLanguage, type TranslationKey } from "@/lib/i18n";

const t = (key: TranslationKey) => tForLanguage("en", key);

const navLinks = [
  { href: "/", label: t("home") },
  { href: "/features", label: t("features") },
  { href: "/pricing", label: t("pricing") },
  { href: "/updates", label: t("updates"), highlight: true },
  { href: "/about", label: t("about") },
  { href: "/contact", label: t("contact") },
];

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#06060d]/88 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="hidden select-none items-center gap-1.5 rounded-full border border-purple-500/30 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-300 sm:inline-flex">
            <Rocket className="h-3 w-3" />
            V2 Live
          </span>
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          <div className="flex items-center gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="group relative py-2 text-sm font-medium text-white/68 transition-colors duration-200 hover:text-[#8B5CF6]"
              >
                <span className="inline-flex items-center gap-1.5">
                  {item.href === "/updates" && <Megaphone className="h-3.5 w-3.5 text-indigo-400" />}
                  {item.label}
                  {item.highlight && (
                    <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                      NEW
                    </span>
                  )}
                </span>
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-white/10" />

          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary h-10 px-5 text-sm">
              {t("go_dashboard")}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-white/76 transition-colors hover:text-white">
                {t("sign_in")}
              </Link>
              <Link href="/register" className="btn-primary h-10 px-5 text-sm transition-all hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]">
                {t("get_started")}
              </Link>
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
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-300">
              <Rocket className="h-3 w-3" />
              V2 Live
            </div>

            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl px-3 py-2.5 text-sm font-medium text-white/72 transition-all hover:bg-white/[0.05] hover:text-white"
              >
                <span className="inline-flex items-center gap-2">
                  {item.href === "/updates" && <Megaphone className="h-4 w-4 text-indigo-400" />}
                  {item.label}
                  {item.highlight && (
                    <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>
                  )}
                </span>
              </Link>
            ))}

            <div className="h-px bg-white/6" />

            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block btn-primary px-5 py-2.5 text-center text-sm">
                {t("go_dashboard")}
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block rounded-2xl px-3 py-2.5 text-sm font-medium text-white/72 transition-all hover:bg-white/[0.05] hover:text-white">
                  {t("sign_in")}
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block btn-primary px-5 py-2.5 text-center text-sm">
                  {t("get_started")}
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
