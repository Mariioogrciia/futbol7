"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useTeamData } from "@/components/providers/team-provider";
import { Trophy, Target, Shield, TrendingUp, Minus, X, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import StatsChart from "@/components/stats-chart";

/* ── Animated counter ── */
function AnimatedCounter({ target, inView }: { target: number; inView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span>{count}</span>;
}

/* ── Stat bar ── */
function StatBar({ label, value, max, colorClass, inView }: { label: string; value: number; max: number; colorClass: string; inView: boolean }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-bold text-text-secondary">{label}</span>
        <span className="text-sm font-black text-text-primary tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-secondary border border-border-subtle">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
    </div>
  );
}

/* ── KPI card ── */
function KpiCard({ icon: Icon, label, value, color, bg, delay, inView }: { icon: any; label: string; value: number; color: string; bg: string; delay: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface-card p-6 transition-all duration-400 hover:-translate-y-1 hover:border-border-default/80 shadow-elevated"
    >
      <div className={cn("absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <p className="text-4xl font-black text-text-primary tabular-nums leading-none mb-2">
        <AnimatedCounter target={value} inView={inView} />
      </p>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>
    </motion.div>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const { stats, topGoleadores } = useTeamData();

  const topScorerInfo = topGoleadores?.[0] ?? { nombre: "Nadie", goles_totales: 0 };

  const kpis = [
    { icon: Trophy, label: "Partidos jugados", value: stats.partidosJugados, color: "text-slate-400", bg: "bg-slate-500/10" },
    { icon: TrendingUp, label: "Victorias", value: stats.victorias, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Minus, label: "Empates", value: stats.empates, color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: X, label: "Derrotas", value: stats.derrotas, color: "text-red-400", bg: "bg-red-500/10" },
    { icon: Target, label: "Goles a favor", value: stats.golesFavor, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Shield, label: "Goles en contra", value: stats.golesContra, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  const maxBar = Math.max(stats.partidosJugados, 1);
  const maxGoals = Math.max(stats.golesFavor, stats.golesContra, 10);

  return (
    <section id="estadisticas" className="relative py-24 lg:py-32 overflow-hidden" ref={ref}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-900/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-teal-900/6 blur-[100px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">

        {/* ── Section hero header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent max-w-16" />
            <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-text-secondary border border-border-subtle px-4 py-2 rounded-full bg-bg-secondary">
              <Zap className="h-3 w-3 text-emerald-500" />
              Temporada 2025 · Rendimiento del Equipo
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-subtle to-transparent" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-text-primary leading-[0.95]">
                Estadísticas<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300">
                  de Temporada
                </span>
              </h2>
            </div>
            <p className="text-text-secondary text-lg font-medium leading-relaxed lg:max-w-xs lg:text-right">
              Números que hablan por sí solos. La historia de una temporada en datos.
            </p>
          </div>
          <div className="mt-10 h-px bg-gradient-to-r from-emerald-500/30 via-border-subtle to-transparent" />
        </motion.div>

        {/* ── Chart + spotlight row ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] mb-10">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[1.5rem] border border-border-default bg-surface-card p-8 shadow-elevated"
          >
            <p className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted mb-1">Distribución de resultados</p>
            <h3 className="text-xl font-black text-text-primary mb-6">Resumen de la Temporada</h3>
            <StatsChart />
          </motion.div>

          {/* Max scorer spotlight */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden rounded-[1.5rem] border border-border-default bg-surface-card p-8 flex flex-col items-center justify-center text-center shadow-elevated"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/60 via-yellow-400/40 to-transparent" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-5 h-16 w-16 flex items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Star className="h-8 w-8 text-amber-400" />
              </div>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-amber-500/70 mb-3">
                Máximo Goleador
              </p>
              <p className="text-2xl font-black text-text-primary tracking-tight leading-tight mb-4">
                {topScorerInfo.nombre}
              </p>
              <div className="flex flex-col items-center">
                <span className="text-6xl font-black text-amber-400 tabular-nums leading-none">
                  <AnimatedCounter target={topScorerInfo.goles_totales} inView={isInView} />
                </span>
                <span className="text-xs font-black tracking-[0.15em] uppercase text-text-muted mt-2">
                  Goles esta temporada
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── KPI grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.label} {...kpi} delay={i * 0.07} inView={isInView} />
          ))}
        </div>

        {/* ── Performance bars ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-[1.5rem] border border-border-default bg-surface-card p-8 shadow-elevated"
        >
          <p className="text-[10px] font-black tracking-[0.15em] uppercase text-text-muted mb-1">Análisis de rendimiento</p>
          <h3 className="text-xl font-black text-text-primary mb-8">Rendimiento en Detalle</h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-5">
              <StatBar label="Victorias" value={stats.victorias} max={maxBar} colorClass="bg-gradient-to-r from-emerald-500 to-teal-500" inView={isInView} />
              <StatBar label="Empates" value={stats.empates} max={maxBar} colorClass="bg-gradient-to-r from-amber-500 to-yellow-500" inView={isInView} />
              <StatBar label="Derrotas" value={stats.derrotas} max={maxBar} colorClass="bg-gradient-to-r from-red-500 to-rose-600" inView={isInView} />
            </div>
            <div className="flex flex-col gap-5">
              <StatBar label="Goles a favor" value={stats.golesFavor} max={maxGoals} colorClass="bg-gradient-to-r from-emerald-500 to-teal-500" inView={isInView} />
              <StatBar label="Goles en contra" value={stats.golesContra} max={maxGoals} colorClass="bg-gradient-to-r from-blue-500 to-indigo-600" inView={isInView} />
              <StatBar label="Diferencia"
                value={Math.max(stats.golesFavor - stats.golesContra, 0)}
                max={maxGoals}
                colorClass={stats.golesFavor >= stats.golesContra ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-red-400 to-rose-500"}
                inView={isInView}
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
