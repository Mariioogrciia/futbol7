"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Users } from "lucide-react";
import { useTeamData } from "@/components/providers/team-provider";
import { Termometro } from "@/components/termometro";

const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568";

export function Hero() {
  const { stats, jugadores } = useTeamData();

  const quickStats = [
    { label: "Partidos jugados", value: stats.partidosJugados.toString() },
    { label: "Victorias", value: stats.victorias.toString() },
    { label: "Goles esta temporada", value: stats.golesFavor.toString() },
    { label: "Jugadores", value: jugadores.length.toString() },
  ];

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(90_65%_50%_/_0.12),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(160_80%_20%_/_0.3),_transparent_60%)]" />

      {/* Stadium light effects */}
      <div className="absolute -top-20 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute -bottom-20 right-1/4 h-96 w-96 rounded-full bg-accent/8 blur-3xl" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-32 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5">
              <span className="mr-2 h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-accent">
                Temporada 2025/26
              </span>
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] sm:text-5xl lg:text-6xl xl:text-7xl">
              La pasion por el{" "}
              <span className="relative">
                futbol
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-accent/60 drop-shadow-md" />
              </span>{" "}
              nos une
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-medium">
              Somos Impersed Cubiertas FC, no ganamos ni a las canicas pero como se dice la intención
              es lo que cuenta, le ponemos ganas que no es poco. Conoce aquí a los valientes que componen
              el equipo así como los resultados y próximos partidos.
            </p>

            <Termometro />

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#partidos"
                className="group inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
              >
                Ver proximos partidos
                <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#equipo"
                className="group inline-flex items-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-foreground/10 hover:border-primary-foreground/30"
              >
                <Users className="mr-2 h-4 w-4" />
                Ver plantilla
              </a>
            </div>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="grid grid-cols-2 gap-4"
          >
            {quickStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="group rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-primary-foreground/10"
              >
                <p className="text-3xl font-bold text-accent lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-primary-foreground/60">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
