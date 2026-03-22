"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Trophy, AlertTriangle } from "lucide-react";
import { standings } from "@/lib/data";
import { cn } from "@/lib/utils";

export function StandingsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="clasificacion" className="relative py-24 lg:py-32 overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-emerald-900/6 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-5xl px-4 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent max-w-16" />
            <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-text-secondary border border-border-subtle px-4 py-2 rounded-full bg-bg-secondary">
              <Trophy className="h-3 w-3 text-emerald-500" />
              Liga 5ª División · Temporada 2024/25
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-subtle to-transparent" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-text-primary leading-[0.95]">
                Tabla de<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300">
                  Posiciones
                </span>
              </h2>
            </div>
            <p className="text-text-secondary text-lg font-medium leading-relaxed lg:max-w-xs lg:text-right">
              Resultados y clasificación final de la temporada anterior.
            </p>
          </div>
          <div className="mt-10 h-px bg-gradient-to-r from-emerald-500/30 via-border-subtle to-transparent" />
        </motion.div>

        {/* ── Table Container ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-[1.5rem] border border-border-default bg-surface-card overflow-hidden overflow-x-auto shadow-elevated"
        >
          <div className="min-w-[640px]">
            {/* Table Header */}
            <div className="grid grid-cols-[48px_1fr_40px_40px_40px_40px_48px_48px_48px_60px] px-6 py-4 border-b border-border-subtle bg-bg-secondary items-center">
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted text-center">#</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted">Equipo</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted text-center">PJ</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted text-center">G</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted text-center">E</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted text-center">P</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted text-center">GF</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted text-center">GC</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted text-center">DG</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-text-secondary text-center">Pts</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/[0.03]">
              {standings.map((entry, i) => {
                const isImpersed = entry.team === "Impersed Cubiertas FC";
                const dg = entry.gf - entry.gc + (entry.ps || 0);

                return (
                  <motion.div
                    key={entry.pos}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.04 }}
                    className={cn(
                      "grid grid-cols-[48px_1fr_40px_40px_40px_40px_48px_48px_48px_60px] px-6 py-3.5 items-center transition-all duration-200",
                      isImpersed
                        ? "bg-emerald-500/[0.07] border-l-2 border-l-emerald-500"
                        : "hover:bg-bg-secondary",
                      "border-border-subtle"
                    )}
                  >
                    {/* Position */}
                    <div className="flex justify-center">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black tabular-nums border",
                        entry.pos <= 3
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                          : entry.pos >= 13
                            ? "bg-red-500/10 text-red-500 border-red-500/15"
                            : "bg-surface-card text-text-secondary border-border-subtle"
                      )}>
                        {entry.pos}
                      </span>
                    </div>

                    {/* Team Name */}
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={cn(
                        "truncate text-sm font-bold",
                        isImpersed ? "text-text-primary font-black" : "text-text-primary"
                      )}>
                        {entry.team}
                      </span>
                      {entry.sanction && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-500 border border-amber-500/20 shrink-0" title={entry.sanction}>
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span className="hidden sm:inline">Sanción</span>
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <span className="text-center text-xs font-bold text-text-secondary/60 tabular-nums">{entry.played}</span>
                    <span className="text-center text-xs font-bold text-emerald-500/80 tabular-nums">{entry.won}</span>
                    <span className="text-center text-xs font-bold text-amber-500/80 tabular-nums">{entry.drawn}</span>
                    <span className="text-center text-xs font-bold text-red-500/80 tabular-nums">{entry.lost}</span>
                    <span className="text-center text-xs font-bold text-text-secondary tabular-nums">{entry.gf}</span>
                    <span className="text-center text-xs font-bold text-text-secondary/60 tabular-nums">{entry.gc}</span>

                    {/* DG */}
                    <div className="flex justify-center">
                      <span className={cn(
                        "text-xs font-black tabular-nums",
                        dg > 0 ? "text-emerald-400" : dg < 0 ? "text-red-400" : "text-text-secondary/60"
                      )}>
                        {dg > 0 ? `+${dg}` : dg}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="flex justify-center">
                      <span className={cn(
                        "text-sm font-black tabular-nums",
                        isImpersed ? "text-emerald-400" : "text-text-primary"
                      )}>
                        {entry.points}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Legend ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] font-black tracking-[0.12em] uppercase text-slate-600"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500/30 border border-emerald-500/40" />
            <span>Ascenso / Playoffs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500/20 border border-red-500/30" />
            <span>Zona Peligro</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-amber-500/70" />
            <span>Sanción Puntos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-4 rounded-sm bg-emerald-500/20 border border-emerald-500/30" />
            <span className="text-emerald-400">Nuestro Club</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
