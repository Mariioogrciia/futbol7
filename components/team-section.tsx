"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { players, type Position } from "@/lib/data";
import { cn } from "@/lib/utils";

const positions: ("Todos" | Position)[] = [
  "Todos",
  "Portero",
  "Defensa",
  "Medio",
  "Delantero",
  "Banca o Mister(feka)"
];

function PlayerCard({
  player,
  index,
}: {
  player: (typeof players)[0];
  index: number;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:border-primary/40"
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-border transition-colors duration-300 group-hover:border-accent">
          <Image
            src={player.avatar}
            alt={player.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>

        {/* Number badge */}
        <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {player.number}
        </div>

        <h3 className="text-lg font-bold text-card-foreground">{player.name}</h3>

        <span className="mt-1 inline-flex rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
          {player.position}
        </span>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {player.description}
        </p>
      </div>
    </motion.div>
  );
}

export function TeamSection() {
  const [active, setActive] = useState<"Todos" | Position>("Todos");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const filtered =
    active === "Todos"
      ? players
      : players.filter((p) => p.position === active);

  return (
    <section id="equipo" className="py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Nuestra Plantilla
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Conoce a los jugadores que hacen posible cada victoria en el campo.
          </p>
        </motion.div>

        {/* Position filters */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setActive(pos)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                active === pos
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
              )}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Player grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((player, i) => (
            <PlayerCard key={player.id} player={player} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
