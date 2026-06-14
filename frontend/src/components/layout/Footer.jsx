import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../Logo";
import { Mail, Phone, MapPin } from "lucide-react";
import { Linkedin, Instagram, Twitter, Youtube } from "./socialIcons";

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Updates", href: "/updates" },
];

const supportLinks = [
  { label: "Help Center", href: "/help" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Refund Policy", href: "/refund-policy" },
];

const socials = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

function FooterLink({ href, label }) {
  return (
    <Link
      to={href}
      className="footer-link-arrow group inline-flex items-center text-white/55 text-[13px] transition-all duration-300 ease-out hover:text-[#8B5CF6] hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.38)]"
    >
      <span>{label}</span>
    </Link>
  );
}

function ContactItem({
  icon: Icon,
  eyebrow,
  children,
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3.5 py-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[#8B5CF6]/35 hover:bg-[#8B5CF6]/[0.07] hover:shadow-[0_14px_34px_rgba(139,92,246,0.16)]">
      <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]">
        <Icon className="w-3.5 h-3.5 text-[#8B5CF6]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-white/30 uppercase font-bold tracking-wide">{eyebrow}</p>
        {children}
      </div>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.018] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8B5CF6]/20 hover:bg-white/[0.035]">
      <h4 className="text-white text-[11px] font-bold uppercase tracking-widest mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <FooterLink href={href} label={label} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="contact" className="bg-[#050508]/95 border-t border-white/[0.05] relative z-10 overflow-hidden mt-auto backdrop-blur-xl">
      <style>{`
        .footer-link-arrow::after {
          content: "\\2197";
          display: inline-block;
          margin-left: 0.25rem;
          opacity: 0;
          transform: translateX(-5px);
          color: #8B5CF6;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .footer-link-arrow:hover::after,
        .footer-link-arrow:focus-visible::after {
          opacity: 1;
          transform: translateX(3px);
        }
      `}</style>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/65 to-transparent" />
      <div className="absolute -top-32 left-1/2 h-56 w-[760px] -translate-x-1/2 rounded-full bg-[#8B5CF6]/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-8%] h-48 w-72 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-7 pb-5 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.85fr_0.85fr_0.85fr] gap-5 lg:gap-7 mb-5">
          <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8B5CF6]/20 hover:bg-white/[0.04]">
            <Link to="/" className="inline-block transition-opacity hover:opacity-80">
              <Logo size="sm" />
            </Link>
            <p className="text-white/40 text-[13px] leading-relaxed max-w-[260px]">
              The intelligent hiring ecosystem powering the next generation of careers and recruiting.
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/42 transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/50 hover:shadow-[0_10px_26px_rgba(139,92,246,0.25)]"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Support" links={supportLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 rounded-2xl bg-white/[0.018] border border-white/[0.05] p-2 mb-4 backdrop-blur-md">
          <ContactItem icon={Mail} eyebrow="Email">
            <a href="mailto:support@hirenextai.com" className="text-[13px] text-white hover:text-[#8B5CF6] transition-colors">support@hirenextai.com</a>
          </ContactItem>
          <ContactItem icon={Phone} eyebrow="Phone">
            <a href="tel:+918287742269" className="text-[13px] text-white hover:text-[#8B5CF6] transition-colors">+91 82877 42269</a>
          </ContactItem>
          <ContactItem icon={MapPin} eyebrow="Location">
            <p className="text-[13px] text-white truncate">Greater Noida, India</p>
          </ContactItem>
        </div>

        <div className="pt-4 border-t border-white/[0.05] flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
          <p className="text-white/30 text-[12px] w-full sm:w-auto">
            Copyright 2026 HireNextAI. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/20">
            <Link to="/privacy-policy" className="text-white/30 text-[12px] hover:text-[#8B5CF6] transition-colors duration-300">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="text-white/30 text-[12px] hover:text-[#8B5CF6] transition-colors duration-300">Terms</Link>
            <span>&bull;</span>
            <Link to="/contact" className="text-white/30 text-[12px] hover:text-[#8B5CF6] transition-colors duration-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
