"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Layers,
  ChevronRight,
} from "lucide-react";
import { matches } from "@/lib/data";
import { cn } from "@/lib/utils";

function MatchCard({
  match,
  index,
}: {
  match: (typeof matches)[0];
  index: number;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -6, y: x * 6 });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
            match.isNext
              ? "border-accent bg-accent shadow-md shadow-accent/30"
              : "border-border bg-card group-hover:border-accent"
          )}
        />
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl",
          match.isNext
            ? "border-accent/40 ring-1 ring-accent/20"
            : "border-border hover:border-primary/30"
        )}
      >
        {match.isNext && (
          <div className="mb-4 inline-flex items-center rounded-full bg-accent/10 px-3 py-1">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-accent">
              Proximo partido
            </span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-card-foreground">
              vs {match.rival}
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-accent" />
                {match.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-accent" />
                {match.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                {match.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="h-4 w-4 text-accent" />
                {match.fieldType}
              </div>
            </div>
          </div>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              match.status === "Confirmado"
                ? "bg-accent/10 text-accent"
                : "bg-muted text-muted-foreground"
            )}
          >
            {match.status}
          </span>
        </div>

        <button className="mt-5 group/btn inline-flex items-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 hover:shadow-md">
          Ver detalles
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function MatchesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      id="partidos"
      className="bg-secondary py-24 lg:py-32"
      ref={ref}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Proximos Partidos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Calendario de enfrentamientos de la temporada actual.
          </p>
        </motion.div>

        {/* Timeline layout */}
        <div className="relative mt-12 lg:ml-8">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 hidden h-full w-px bg-border lg:block" />

          <div className="grid gap-6 lg:pl-10">
            {matches.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} />
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <button className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:bg-primary/90">
            Ver calendario completo
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
