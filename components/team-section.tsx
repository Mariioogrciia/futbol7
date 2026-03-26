"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTeamData } from "@/components/providers/team-provider";
import { staff, players as staticPlayers, type Position } from "@/lib/data";
import { cn } from "@/lib/utils";
import { X, ZoomIn, ArrowRight } from "lucide-react";

const positions: ("Todos" | Position)[] = [
  "Todos",
  "Portero",
  "Defensa",
  "Medio",
  "Delantero",
];

const positionConfig: Record<string, { color: string; badge: string; accent: string }> = {
  Portero:   { color: "text-amber-600 dark:text-amber-400",   badge: "bg-amber-500/10 text-amber-600 border-amber-500/15 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",   accent: "#f59e0b" },
  Defensa:   { color: "text-blue-600 dark:text-blue-400",    badge: "bg-blue-500/10 text-blue-600 border-blue-500/15 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",     accent: "#3b82f6" },
  Medio:     { color: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/15 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30", accent: "#10b981" },
  Delantero: { color: "text-red-600 dark:text-red-400",     badge: "bg-red-500/10 text-red-600 border-red-500/15 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",         accent: "#ef4444" },
};

/* ─── Photo Lightbox ─── */
function PhotoLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white shadow-lg transition-colors hover:bg-white/10"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative h-[75vh] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 640px) 95vw, 448px" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <p className="absolute bottom-6 left-6 text-xl font-black text-white tracking-tight">{alt}</p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Player Card ─── */
function PlayerCard({ player, index, onPhotoClick }: { player: any; index: number; onPhotoClick: (src: string, alt: string) => void }) {
  const pos = positionConfig[player.posicion] || { color: "text-slate-400", badge: "bg-white/5 text-slate-400 border-white/10", accent: "#64748b" };
  const imgSrc = player.foto_url || player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.nombre)}&background=0a3a2a&color=34d399&size=400&bold=true`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border-subtle bg-surface-card transition-all duration-500 hover:-translate-y-2 hover:border-accent-primary-hover hover:shadow-elevated cursor-pointer"
    >
      {/* Photo area */}
      <button
        onClick={() => onPhotoClick(imgSrc, player.nombre)}
        className="relative block w-full overflow-hidden cursor-zoom-in"
        aria-label={`Ampliar foto de ${player.nombre}`}
        style={{ aspectRatio: "3/4" }}
      >
        <Image
          src={imgSrc}
          alt={player.nombre}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 dark:to-black/30" />

        {/* Zoom hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/30 backdrop-blur-sm rounded-full p-3 border border-white/10">
            <ZoomIn className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Dorsal — editorial treatment top-left */}
        <div className="absolute top-4 left-5 z-10">
          <span className="text-5xl font-black text-text-primary/10 dark:text-white/20 leading-none tracking-tighter select-none"
            style={{ fontVariantNumeric: "tabular-nums" }}>
            {player.dorsal || "—"}
          </span>
        </div>

        {/* Position badge — top-right */}
        <div className="absolute top-4 right-4 z-10">
          <span className={cn("text-[10px] font-black tracking-[0.12em] uppercase px-3 py-1.5 rounded-xl border backdrop-blur-sm", pos.badge)}>
            {player.posicion}
          </span>
        </div>

        {/* Name overlaid at bottom of photo */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
            {player.nombre}
          </h3>
        </div>
      </button>

      {/* Info panel */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 border-t border-border-subtle">
        <p className="text-sm text-text-secondary font-medium leading-relaxed flex-1 mb-4">
          {player.descripcion || "Jugador de Impersed Cubiertas FC."}
        </p>

        <Link
          href={`/jugador/${player.id}`}
          className="group/cta inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-secondary text-text-secondary text-sm font-bold tracking-wide transition-all duration-300 hover:bg-accent-soft hover:border-accent-primary-hover hover:text-text-accent"
          onClick={(e) => e.stopPropagation()}
        >
          Ver Perfil
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Staff Card ─── */
function StaffCard({ member, index, onPhotoClick }: { member: any; index: number; onPhotoClick: (src: string, alt: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-border-subtle bg-surface-card transition-all duration-500 hover:-translate-y-1 hover:border-accent-primary-hover hover:shadow-elevated"
    >
      <button
        onClick={() => onPhotoClick(member.avatar, member.name)}
        className="relative block w-full overflow-hidden cursor-zoom-in"
        aria-label={`Ampliar foto de ${member.name}`}
        style={{ aspectRatio: "4/3" }}
      >
        <Image
          src={member.avatar}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/30 backdrop-blur-sm rounded-full p-3 border border-white/10">
            <ZoomIn className="h-5 w-5 text-white" />
          </div>
        </div>
        {/* Name overlaid */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight">{member.name}</h3>
        </div>
      </button>
      <div className="px-5 pt-3 pb-5 border-t border-border-subtle">
        <span className="text-[10px] font-black tracking-[0.12em] uppercase px-3 py-1.5 rounded-xl border bg-accent-soft text-text-accent border-accent-primary-hover/20">
          {member.role}
        </span>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary font-medium">{member.description}</p>
      </div>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export function TeamSection() {
  const [active, setActive] = useState<"Todos" | Position>("Todos");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { jugadores: players, loading } = useTeamData();

  const playersWithAvatars = players.map(player => {
    const normalize = (str?: string) =>
      (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const playerName = normalize(player.nombre);
    const match = staticPlayers.find(sp => {
      const spName = normalize(sp.name);
      const nameParts = playerName.split(" ");
      return spName === playerName ||
        (spName.includes(nameParts[0]) && (nameParts.length > 1 ? spName.includes(nameParts[1]) : true));
    });
    return { ...player, avatar: match?.avatar || null, descripcion: match?.description || null };
  });

  const filtered = active === "Todos" ? playersWithAvatars : playersWithAvatars.filter(p => p.posicion === active);
  const openLightbox = useCallback((src: string, alt: string) => setLightbox({ src, alt }), []);

  const filterAccentColor: Record<string, string> = {
    Portero: "hover:text-amber-400 data-[active=true]:text-amber-400",
    Defensa: "hover:text-blue-400 data-[active=true]:text-blue-400",
    Medio: "hover:text-emerald-400 data-[active=true]:text-emerald-400",
    Delantero: "hover:text-red-400 data-[active=true]:text-red-400",
    Todos: "hover:text-white data-[active=true]:text-white",
  };

  const filterBarColor: Record<string, string> = {
    Portero: "bg-amber-500",
    Defensa: "bg-blue-500",
    Medio: "bg-emerald-500",
    Delantero: "bg-red-500",
    Todos: "bg-accent-primary",
  };

  return (
    <>
      <section id="equipo" className="relative py-24 lg:py-32 overflow-hidden" ref={ref}>
        {/* Section background ambiance */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[20%] right-[5%] w-[45%] h-[50%] bg-emerald-800/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] -left-[5%] w-[35%] h-[40%] bg-teal-800/8 blur-[100px] rounded-full" />
        </div>

        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">

          {/* ── Cinematic Hero Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative mb-16 lg:mb-20"
          >
            {/* Top eyebrow badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-border-subtle max-w-16" />
              <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-text-secondary border border-border-subtle px-4 py-2 rounded-full bg-bg-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                Temporada 2025 · Impersed Cubiertas FC
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-subtle to-border-subtle" />
            </div>

            {/* Main title row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-text-primary leading-[0.95]">
                  La<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-300">
                    Plantilla
                  </span>
                </h2>
              </div>
              <div className="lg:max-w-xs lg:text-right">
                <p className="text-text-secondary text-lg font-medium leading-relaxed">
                  Los jugadores que construyen cada victoria. Carácter, técnica y compromiso en cada convocatoria.
                </p>
                {!loading && (
                  <p className="mt-3 text-sm font-black text-text-secondary opacity-60 uppercase tracking-[0.12em]">
                    {playersWithAvatars.length} Futbolistas
                  </p>
                )}
              </div>
            </div>

            {/* Thin separator */}
            <div className="mt-12 h-px bg-gradient-to-r from-accent-primary/30 via-border-subtle to-transparent" />
          </motion.div>

          {/* ── Position Filters ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 bg-surface-card/80 backdrop-blur-xl border border-border-subtle rounded-2xl p-2 shadow-soft w-full md:w-auto">
              {positions.map((pos) => {
                const isActive = active === pos;
                return (
                  <button
                    key={pos}
                    onClick={() => setActive(pos)}
                    data-active={isActive}
                    className={cn(
                      "relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                      isActive
                        ? "bg-bg-secondary text-text-primary shadow-sm border border-border-subtle"
                        : "text-text-muted hover:text-text-primary",
                      !isActive && filterAccentColor[pos]
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="filter-indicator"
                        className={cn("absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full", filterBarColor[pos])}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {pos}
                   </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Player Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-slate-500 font-medium text-sm">Cargando plantilla...</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl opacity-20 mb-4">⚽</span>
                <p className="text-slate-400 font-black text-xl">Sin jugadores en esta posición</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((player, i) => (
                  <PlayerCard key={player.id} player={player} index={i} onPhotoClick={openLightbox} />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* ── Staff Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-28"
          >
            {/* Staff header */}
            <div className="flex items-center gap-5 mb-10">
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted mb-2">Realidad Técnica</p>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tighter text-text-primary">
                  Cuerpo Técnico
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-border-subtle to-transparent mt-6" />
            </div>
            <p className="text-text-secondary font-medium mb-10 max-w-md">
              Los que dirigen desde la banda (o rellenan las botellas cuando toca).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl mx-auto sm:mx-0">
              {staff.map((member, i) => (
                <StaffCard key={member.id} member={member} index={i} onPhotoClick={openLightbox} />
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* Lightbox portal */}
      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
