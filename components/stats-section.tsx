"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useTeamData } from "@/components/providers/team-provider";
import { supabase } from "@/lib/supabase";

const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568"; // <-- tu equipo_id
import {
  Trophy,
  Target,
  Shield,
  TrendingUp,
  Minus,
  X,
  Star,
} from "lucide-react";
import { stats } from "@/lib/data";
import StatsChart from "@/components/stats-chart";

function AnimatedCounter({
  target,
  inView,
}: {
  target: number;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span>{count}</span>;
}

function StatBar({
  label,
  value,
  max,
  color,
  inView,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  inView: boolean;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-card-foreground">{label}</span>
        <span className="font-bold text-card-foreground">{value}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const { stats, topGoleadores } = useTeamData();

  const topScorerInfo = topGoleadores && topGoleadores.length > 0 ? topGoleadores[0] : { nombre: 'Nadie', goles_totales: 0 };

  const statCards = [
    {
      icon: Trophy,
      label: "Partidos jugados",
      value: stats.partidosJugados,
      accent: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: TrendingUp,
      label: "Victorias",
      value: stats.victorias,
      accent: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Minus,
      label: "Empates",
      value: stats.empates,
      accent: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      icon: X,
      label: "Derrotas",
      value: stats.derrotas,
      accent: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      icon: Target,
      label: "Goles a favor",
      value: stats.golesFavor,
      accent: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Shield,
      label: "Goles en contra",
      value: stats.golesContra,
      accent: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <section id="estadisticas" className="py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Estadísticas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Números que hablan por sí solos esta temporada.
          </p>
        </motion.div>

        {/* Gráfico de pastel de estadísticas */}
        <div className="mt-8 flex justify-center">
          <StatsChart />
        </div>

        {/* Stat cards grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={`h-6 w-6 ${stat.accent}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-card-foreground">
                  <AnimatedCounter target={stat.value} inView={isInView} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bars + top scorer */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-8 shadow-sm"
          >
            <h3 className="mb-6 text-lg font-bold text-card-foreground">
              Rendimiento
            </h3>
            <div className="flex flex-col gap-5">
              <StatBar
                label="Victorias"
                value={stats.victorias}
                max={Math.max(stats.partidosJugados, 1)}
                color="bg-accent"
                inView={isInView}
              />
              <StatBar
                label="Empates"
                value={stats.empates}
                max={Math.max(stats.partidosJugados, 1)}
                color="bg-muted-foreground/40"
                inView={isInView}
              />
              <StatBar
                label="Derrotas"
                value={stats.derrotas}
                max={Math.max(stats.partidosJugados, 1)}
                color="bg-muted-foreground/20"
                inView={isInView}
              />
              <StatBar
                label="Goles a favor"
                value={stats.golesFavor}
                max={Math.max(stats.golesFavor, stats.golesContra, 10)}
                color="bg-accent"
                inView={isInView}
              />
              <StatBar
                label="Goles en contra"
                value={stats.golesContra}
                max={Math.max(stats.golesFavor, stats.golesContra, 10)}
                color="bg-primary/40"
                inView={isInView}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center justify-center rounded-xl border border-accent/20 bg-primary p-8 text-center shadow-sm"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Star className="h-8 w-8 text-accent" />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/60">
              Máximo goleador
            </p>
            <p className="mt-2 text-2xl font-bold text-primary-foreground">
              {topScorerInfo.nombre}
            </p>
            <p className="mt-1 text-5xl font-bold text-accent">
              <AnimatedCounter target={topScorerInfo.goles_totales} inView={isInView} />
            </p>
            <p className="mt-1 text-sm text-primary-foreground/60">
              goles esta temporada
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
