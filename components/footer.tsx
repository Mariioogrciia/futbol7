"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const footerLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Equipo", href: "#equipo" },
  { label: "Partidos", href: "#partidos" },
  { label: "Estadísticas", href: "#estadisticas" },
  { label: "Galería", href: "#galeria" },
];

function SocialIcon({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 shadow-sm"
      aria-label="Red social"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-[#040811] border-t border-white/[0.03] overflow-hidden">
      {/* Ambient footer glow */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-emerald-500/[0.03] to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">

          {/* ── Brand ── */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 p-1 bg-white/5">
                <Image
                  src="/images/Escudo.png"
                  alt="Impersed Cubiertas FC"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-lg font-black tracking-tighter text-white">
                Impersed <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Cubiertas FC</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-slate-500">
              Un equipo unido por la pasión del fútbol 7. Compitiendo con corazón, garra y estilo desde 2025.
            </p>
          </div>

          {/* ── Links ── */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
              Navegación
            </h3>
            <nav className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-slate-500 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* ── Social ── */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
              Redes Sociales
            </h3>
            <div className="flex gap-3">
              <SocialIcon href="https://www.instagram.com/impersedcubiertas?igsh=MXFzbmVwOG9jOG13dA==">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* ── Developer ── */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
              Desarrollado por
            </h3>
            <p className="text-sm font-bold text-slate-300">
              Mario García <span className="text-slate-500 font-medium">(Fende21)</span>
            </p>
            <div className="mt-4 flex gap-3">
              <SocialIcon href="https://www.instagram.com/mariioogrciia?igsh=bDJyczFienU3aHI5">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://www.tiktok.com/@mariioogrciia?_r=1&_t=ZN-93s13xBhBdj">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </SocialIcon>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-600">
            © {new Date().getFullYear()} Impersed Cubiertas FC. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-700">
            <span>Powered by</span>
            <span className="text-emerald-500/80">Antigravity AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
