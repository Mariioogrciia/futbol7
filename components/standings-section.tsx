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
    <section className="py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5">
            <Trophy className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-accent">
              Liga 5a Division - Grupo Mixto
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Clasificacion
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Tabla de posiciones final de la temporada anterior.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 overflow-x-auto"
        >
          <div className="min-w-[700px]">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_40px_40px_40px_40px_48px_48px_48px_52px] items-center gap-1 rounded-t-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground sm:text-sm">
              <span className="text-center">Pos</span>
              <span>Equipo</span>
              <span className="text-center">PJ</span>
              <span className="text-center">G</span>
              <span className="text-center">E</span>
              <span className="text-center">P</span>
              <span className="text-center">GF</span>
              <span className="text-center">GC</span>
              <span className="text-center">DG</span>
              <span className="text-center">Pts</span>
            </div>

            {/* Table rows */}
            {standings.map((entry, i) => {
              const isImpersed = entry.team === "Impersed Cubiertas FC";
              const dg = entry.gf - entry.gc + entry.ps;

              return (
                <motion.div
                  key={entry.pos}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.04 }}
                  className={cn(
                    "grid grid-cols-[40px_1fr_40px_40px_40px_40px_48px_48px_48px_52px] items-center gap-1 border-b border-border px-4 py-3 text-sm transition-colors duration-200",
                    isImpersed
                      ? "bg-accent/10 font-bold"
                      : i % 2 === 0
                      ? "bg-card"
                      : "bg-secondary/50",
                    "hover:bg-accent/5"
                  )}
                >
                  {/* Position */}
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      entry.pos <= 3
                        ? "bg-accent/20 text-accent"
                        : entry.pos >= 13
                        ? "bg-red-500/15 text-red-500"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {entry.pos}
                  </span>

                  {/* Team name */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-card-foreground",
                        isImpersed && "text-accent font-extrabold"
                      )}
                    >
                      {entry.team}
                    </span>
                    {entry.sanction && (
                      <span
                        className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-500"
                        title={entry.sanction}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span className="hidden sm:inline">S</span>
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <span className="text-center text-muted-foreground">
                    {entry.played}
                  </span>
                  <span className="text-center text-emerald-600">
                    {entry.won}
                  </span>
                  <span className="text-center text-amber-600">
                    {entry.drawn}
                  </span>
                  <span className="text-center text-red-500">
                    {entry.lost}
                  </span>
                  <span className="text-center text-card-foreground">
                    {entry.gf}
                  </span>
                  <span className="text-center text-card-foreground">
                    {entry.gc}
                  </span>
                  <span
                    className={cn(
                      "text-center font-medium",
                      dg > 0
                        ? "text-emerald-600"
                        : dg < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {dg > 0 ? `+${dg}` : dg}
                  </span>
                  <span
                    className={cn(
                      "text-center font-bold",
                      isImpersed ? "text-accent" : "text-card-foreground"
                    )}
                  >
                    {entry.points}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-accent/20" />
            <span>Top 3</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500/15" />
            <span>Zona baja</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span>Sancion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-accent/30" />
            <span>Impersed Cubiertas FC</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
