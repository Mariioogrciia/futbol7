"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  ChevronRight,
  Home,
  Plane,
  Shield,
} from "lucide-react";
import { matches, type Match } from "@/lib/data";
import { cn } from "@/lib/utils";

function ResultBadge({ match }: { match: Match }) {
  if (match.status !== "Jugado" || !match.result) return null;

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
      <span className={cn("text-2xl font-black tabular-nums tracking-tight", c.text)}>
        {match.goalsFor} - {match.goalsAgainst}
      </span>
    </div>
  );
}

function StatusBadge({ match }: { match: Match }) {
  if (match.status === "Jugado") return null;

  if (match.status === "Proximo") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="inline-flex items-center rounded-full bg-accent/10 border border-accent/30 px-3 py-1">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Proximo
          </span>
        </div>
      </div>
    );
  }

  return (
    <span className="rounded-full bg-muted border border-border px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Pendiente
    </span>
  );
}

function MatchCard({ match, index }: { match: Match; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -6, y: x * 6 });
  };

  const dotColor =
    match.status === "Jugado"
      ? match.result === "victoria"
        ? "border-emerald-500 bg-emerald-500"
        : match.result === "derrota"
        ? "border-red-500 bg-red-500"
        : "border-amber-500 bg-amber-500"
      : match.status === "Proximo"
      ? "border-accent bg-accent shadow-md shadow-accent/30"
      : "border-border bg-card group-hover:border-accent";

  const cardBorder =
    match.status === "Jugado"
      ? match.result === "victoria"
        ? "border-emerald-500/30 ring-1 ring-emerald-500/10"
        : match.result === "derrota"
        ? "border-red-500/30 ring-1 ring-red-500/10"
        : "border-amber-500/30 ring-1 ring-amber-500/10"
      : match.status === "Proximo"
      ? "border-accent/40 ring-1 ring-accent/20"
      : "border-border hover:border-primary/30";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group relative"
    >
      {/* Timeline dot */}
      <div className="absolute -left-[41px] top-8 hidden lg:block">
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 transition-colors duration-300",
            dotColor
          )}
        />
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-6",
          cardBorder
        )}
      >
        {/* Jornada header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Jornada {match.jornada}
            </span>
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
          </div>
          <StatusBadge match={match} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-card-foreground sm:text-xl">
              {match.isHome ? "Impersed Cubiertas FC" : match.rival}
              <span className="mx-2 text-muted-foreground font-normal">vs</span>
              {match.isHome ? match.rival : "Impersed Cubiertas FC"}
            </h3>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-accent" />
                {match.date}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-accent" />
                {match.time}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="truncate">{match.location}</span>
              </div>
            </div>
          </div>

          <ResultBadge match={match} />
        </div>
      </div>
    </motion.div>
  );
}

export function MatchesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const played = matches.filter((m) => m.status === "Jugado");
  const wins = played.filter((m) => m.result === "victoria").length;
  const losses = played.filter((m) => m.result === "derrota").length;
  const draws = played.filter((m) => m.result === "empate").length;
  const gf = played.reduce((sum, m) => sum + (m.goalsFor ?? 0), 0);
  const ga = played.reduce((sum, m) => sum + (m.goalsAgainst ?? 0), 0);

  return (
    <section id="partidos" className="bg-secondary py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5">
            <Trophy className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-accent">
              Copa Futbol 7 - Grupo F
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Calendario de Copa
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Todos los partidos de Impersed Cubiertas FC en la Copa de Futbol 7, Grupo F.
          </p>
        </motion.div>

        {/* Mini stats bar */}
        {played.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2">
              <span className="text-sm text-muted-foreground">PJ</span>
              <span className="text-lg font-bold text-card-foreground">{played.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card border border-emerald-500/20 px-4 py-2">
              <span className="text-sm text-emerald-400">V</span>
              <span className="text-lg font-bold text-emerald-400">{wins}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card border border-amber-500/20 px-4 py-2">
              <span className="text-sm text-amber-400">E</span>
              <span className="text-lg font-bold text-amber-400">{draws}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card border border-red-500/20 px-4 py-2">
              <span className="text-sm text-red-400">D</span>
              <span className="text-lg font-bold text-red-400">{losses}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2">
              <span className="text-sm text-muted-foreground">Goles</span>
              <span className="text-lg font-bold text-card-foreground">
                {gf} - {ga}
              </span>
            </div>
          </motion.div>
        )}

        {/* Timeline layout */}
        <div className="relative mt-12 lg:ml-8">
          <div className="absolute left-0 top-0 hidden h-full w-px bg-border lg:block" />
          <div className="grid gap-5 lg:pl-10">
            {matches.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
