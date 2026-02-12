"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Home,
  Plane,
  Shield,
  History,
} from "lucide-react";
import { leagueMatches, type Match } from "@/lib/data";
import { cn } from "@/lib/utils";

function ResultBadge({ match }: { match: Match }) {
  if (!match.result) return null;

  const config = {
    victoria: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      label: "Victoria",
    },
    derrota: {
      bg: "bg-red-500/15",
      text: "text-red-400",
      border: "border-red-500/30",
      label: "Derrota",
    },
    empate: {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      border: "border-amber-500/30",
      label: "Empate",
    },
  };

  const c = config[match.result];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span
        className={cn(
          "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider",
          c.bg,
          c.text,
          c.border
        )}
      >
        {c.label}
      </span>
      <span
        className={cn(
          "text-2xl font-black tabular-nums tracking-tight",
          c.text
        )}
      >
        {match.goalsFor} - {match.goalsAgainst}
      </span>
    </div>
  );
}

function LeagueMatchRow({ match, index }: { match: Match; index: number }) {
  const isDescanso = match.rival === "Descanso";

  const dotColor = !match.result
    ? "border-muted-foreground/40 bg-muted-foreground/40"
    : match.result === "victoria"
    ? "border-emerald-500 bg-emerald-500"
    : match.result === "derrota"
    ? "border-red-500 bg-red-500"
    : "border-amber-500 bg-amber-500";

  const cardBorder = !match.result
    ? "border-border"
    : match.result === "victoria"
    ? "border-emerald-500/30 ring-1 ring-emerald-500/10"
    : match.result === "derrota"
    ? "border-red-500/30 ring-1 ring-red-500/10"
    : "border-amber-500/30 ring-1 ring-amber-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group relative"
    >
      {/* Timeline dot */}
      <div className="absolute -left-[41px] top-6 hidden lg:block">
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 transition-colors duration-300",
            dotColor
          )}
        />
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-5",
          cardBorder
        )}
      >
        {/* Jornada header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Jornada {match.jornada}
            </span>
            {!isDescanso && (
              <>
                <span className="text-xs text-muted-foreground">{"/"}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    match.isHome
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {match.isHome ? (
                    <Home className="h-3 w-3" />
                  ) : (
                    <Plane className="h-3 w-3" />
                  )}
                  {match.isHome ? "Local" : "Visitante"}
                </span>
              </>
            )}
          </div>
        </div>

        {isDescanso ? (
          <p className="text-sm italic text-muted-foreground">
            Impersed Cubiertas FC descanso esta jornada.
          </p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-card-foreground sm:text-lg">
                {match.isHome ? "Impersed Cubiertas FC" : match.rival}
                <span className="mx-2 font-normal text-muted-foreground">
                  vs
                </span>
                {match.isHome ? match.rival : "Impersed Cubiertas FC"}
              </h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3 text-accent" />
                  {match.date}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 text-accent" />
                  {match.time}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 text-accent" />
                  <span className="truncate">{match.location}</span>
                </div>
              </div>
            </div>

            <ResultBadge match={match} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function LeagueHistorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const played = leagueMatches.filter(
    (m) => m.status === "Jugado" && m.rival !== "Descanso"
  );
  const wins = played.filter((m) => m.result === "victoria").length;
  const losses = played.filter((m) => m.result === "derrota").length;
  const draws = played.filter((m) => m.result === "empate").length;
  const gf = played.reduce((sum, m) => sum + (m.goalsFor ?? 0), 0);
  const ga = played.reduce((sum, m) => sum + (m.goalsAgainst ?? 0), 0);

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
            <History className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-accent">
              Liga 5a Division - Grupo Mixto
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Resultados Anteriores
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Historial completo de Impersed Cubiertas FC en la Liga de Futbol 7,
            5a Division.
          </p>
        </motion.div>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <span className="text-sm text-muted-foreground">PJ</span>
            <span className="text-lg font-bold text-card-foreground">
              {played.length}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-card px-4 py-2">
            <span className="text-sm text-emerald-400">V</span>
            <span className="text-lg font-bold text-emerald-400">{wins}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-card px-4 py-2">
            <span className="text-sm text-amber-400">E</span>
            <span className="text-lg font-bold text-amber-400">{draws}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-card px-4 py-2">
            <span className="text-sm text-red-400">D</span>
            <span className="text-lg font-bold text-red-400">{losses}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <span className="text-sm text-muted-foreground">Goles</span>
            <span className="text-lg font-bold text-card-foreground">
              {gf} - {ga}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-card px-4 py-2">
            <span className="text-sm text-muted-foreground">Pts</span>
            <span className="text-lg font-bold text-primary">
              {wins * 3 + draws}
            </span>
          </div>
        </motion.div>

        {/* Match list */}
        <div className="relative mt-12 lg:ml-8">
          <div className="absolute left-0 top-0 hidden h-full w-px bg-border lg:block" />
          <div className="grid gap-4 lg:pl-10">
            {leagueMatches.map((match, i) => (
              <LeagueMatchRow key={match.id} match={match} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
