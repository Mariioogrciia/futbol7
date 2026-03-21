"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTeamData } from "@/components/providers/team-provider";
import { Trophy, Zap, Star } from "lucide-react";

/* ── Avatar initials fallback ── */
function PlayerAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "lg" ? "h-16 w-16 text-lg" : size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  return (
    <div className={cn("rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 shrink-0", sz)}>
      {initials}
    </div>
  );
}

/* ── Position badge ── */
const positionColors: Record<string, string> = {
  Portero: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Defensa: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Medio: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Delantero: "bg-red-500/10 text-red-400 border-red-500/20",
};

function PositionBadge({ position }: { position: string }) {
  const color = positionColors[position] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20";
  return (
    <span className={cn("text-[9px] font-black tracking-[0.12em] uppercase px-2 py-0.5 rounded-lg border", color)}>
      {position}
    </span>
  );
}

/* ── Podium card (top 3) ── */
function PodiumCard({ scorer, rank, index }: { scorer: any; rank: number; index: number }) {
  const medalConfigs = [
    { ring: "ring-2 ring-amber-400/40", glow: "shadow-[0_0_32px_rgba(251,191,36,0.15)]", numColor: "text-amber-400", barColor: "bg-gradient-to-r from-amber-400 to-yellow-500", label: "Oro", labelColor: "text-amber-400", height: "lg:py-10" },
    { ring: "ring-1 ring-slate-400/30", glow: "shadow-[0_0_20px_rgba(148,163,184,0.1)]", numColor: "text-slate-300", barColor: "bg-gradient-to-r from-slate-400 to-slate-500", label: "Plata", labelColor: "text-slate-400", height: "lg:py-8" },
    { ring: "ring-1 ring-amber-700/30", glow: "shadow-[0_0_20px_rgba(180,83,9,0.1)]", numColor: "text-amber-700", barColor: "bg-gradient-to-r from-amber-700 to-orange-700", label: "Bronce", labelColor: "text-amber-700", height: "lg:py-6" },
  ];
  const c = medalConfigs[rank - 1] ?? medalConfigs[2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className={cn(
        "relative flex flex-col items-center rounded-[1.5rem] border border-border-default bg-surface-card p-6 py-8 text-center transition-all duration-400 hover:-translate-y-1 shadow-soft",
        c.ring, c.glow, c.height
      )}
    >
      {/* Rank number — editorial large */}
      <div className={cn("text-7xl font-black leading-none opacity-[0.05] absolute top-4 right-5 select-none", c.numColor)}>
        {rank}
      </div>

      {/* Medal label */}
      <div className="mb-4">
        <span className={cn("text-[9px] font-black tracking-[0.2em] uppercase", c.labelColor)}>
          {c.label}
        </span>
      </div>

      {/* Avatar */}
      <PlayerAvatar name={scorer.nombre} size="lg" />

      {/* Name */}
      <h3 className="mt-4 text-base font-black text-text-primary tracking-tight leading-tight px-2">
        {scorer.nombre}
      </h3>

      {/* Position */}
      <div className="mt-2">
        <PositionBadge position={scorer.posicion} />
      </div>

      {/* Goals — the main number */}
      <div className="mt-5">
        <div className={cn("text-5xl font-black tabular-nums leading-none", c.numColor)}>
          {scorer.goles_totales}
        </div>
        <div className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted mt-1.5">
          Goles
        </div>
      </div>

      {/* Accent bar */}
      <div className={cn("absolute bottom-0 left-8 right-8 h-[2px] rounded-full", c.barColor)} />
    </motion.div>
  );
}

/* ── Main section ── */
export function TopScorersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { topGoleadores: scorers, loading } = useTeamData();

  const top3 = scorers.slice(0, 3);
  const rest = scorers.slice(3);

  return (
    <section id="goleadores" className="relative py-24 lg:py-32 overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-emerald-800/8 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-5xl px-4 lg:px-8 relative z-10">

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-14 lg:mb-20"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent max-w-16" />
            <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-text-secondary border border-border-subtle px-4 py-2 rounded-full bg-bg-secondary">
              <Trophy className="h-3 w-3 text-amber-500" />
              Temporada 2025 · Máximos Anotadores
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-subtle to-transparent" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-text-primary leading-[0.95]">
                Tabla de<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400">
                  Goleadores
                </span>
              </h2>
            </div>
            <div className="lg:max-w-xs lg:text-right">
              <p className="text-text-secondary text-lg font-medium leading-relaxed">
                Los que meten el balón donde las arañas tejen sus redes. O lo intentan.
              </p>
              {!loading && (
                <p className="mt-3 text-sm font-black text-slate-600 uppercase tracking-[0.12em]">
                  {scorers.length} Anotadores registrados
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 h-px bg-gradient-to-r from-amber-500/30 via-border-subtle to-transparent" />
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">Cargando goleadores...</p>
          </div>
        ) : scorers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl opacity-20 mb-4">⚽</span>
            <p className="text-slate-400 font-black text-xl">Sin goles registrados aún</p>
          </div>
        ) : (
          <>
            {/* ── Top 3 Podium ── */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                {top3.map((scorer: any, i: number) => (
                  <PodiumCard key={scorer.id} scorer={scorer} rank={i + 1} index={i} />
                ))}
              </div>
            )}

            {/* ── Full ranking table ── */}
            {rest.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="rounded-[1.5rem] border border-border-default bg-surface-card overflow-hidden shadow-elevated"
              >
                {/* Table header */}
                <div className="grid grid-cols-[48px_1fr_auto_80px] sm:grid-cols-[48px_1fr_120px_80px_80px] px-6 py-4 border-b border-white/[0.05]">
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-slate-600">#</span>
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-slate-600">Jugador</span>
                  <span className="hidden sm:block text-[10px] font-black tracking-[0.15em] uppercase text-slate-600">Posición</span>
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-slate-600 text-center">Dorsal</span>
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-slate-600 text-center">Goles</span>
                </div>

                {/* Table rows */}
                <div className="divide-y divide-white/[0.04]">
                  {rest.map((scorer: any, i: number) => {
                    const rank = i + 4;
                    return (
                      <motion.div
                        key={scorer.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: i * 0.05 }}
                        className="group grid grid-cols-[48px_1fr_auto_80px] sm:grid-cols-[48px_1fr_120px_80px_80px] px-6 py-4 items-center transition-colors duration-200 hover:bg-white/[0.03]"
                      >
                        {/* Rank */}
                        <span className="text-sm font-black text-slate-600 tabular-nums">{rank}</span>

                        {/* Player */}
                        <div className="flex items-center gap-3 min-w-0">
                          <PlayerAvatar name={scorer.nombre} size="sm" />
                          <span className="text-sm font-bold text-text-primary truncate">{scorer.nombre}</span>
                        </div>

                        {/* Position (hidden mobile) */}
                        <div className="hidden sm:flex">
                          <PositionBadge position={scorer.posicion} />
                        </div>

                        {/* Dorsal */}
                        <div className="flex justify-center">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-bg-secondary border border-border-subtle text-xs font-black text-text-secondary">
                            {scorer.dorsal || "–"}
                          </span>
                        </div>

                        {/* Goals */}
                        <div className="flex justify-center">
                          <span className="text-xl font-black text-emerald-400 tabular-nums">
                            {scorer.goles_totales}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
