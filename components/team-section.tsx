"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import { players, staff, type Position } from "@/lib/data";
import { cn } from "@/lib/utils";
import { X, ZoomIn } from "lucide-react";

const positions: ("Todos" | Position)[] = [
  "Todos",
  "Portero",
  "Defensa",
  "Medio",
  "Delantero",
];

/* ─── Photo Lightbox ─── */
function PhotoLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-card-foreground shadow-lg transition-colors hover:bg-destructive hover:text-destructive-foreground"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative h-[70vh] w-full max-w-lg overflow-hidden rounded-2xl border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 95vw, 512px"
          priority
        />
      </motion.div>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground bg-card/80 border border-border rounded-lg px-4 py-2 backdrop-blur-sm">
        {alt}
      </p>
    </motion.div>
  );
}

/* ─── Player Card ─── */
function PlayerCard({
  player,
  index,
  onPhotoClick,
}: {
  player: (typeof players)[0];
  index: number;
  onPhotoClick: (src: string, alt: string) => void;
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
        {/* Avatar with zoom */}
        <button
          onClick={() => onPhotoClick(player.avatar, player.name)}
          className="relative mb-4 h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-border transition-colors duration-300 group-hover:border-accent"
          aria-label={`Ampliar foto de ${player.name}`}
        >
          <Image
            src={player.avatar}
            alt={player.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="96px"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-all duration-300 group-hover:bg-background/40">
            <ZoomIn className="h-5 w-5 text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </button>

        {/* Number badge */}
        <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {player.number}
        </div>

        <h3 className="text-lg font-bold text-card-foreground">
          {player.name}
        </h3>

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

/* ─── Main Section ─── */
export function TeamSection() {
  const [active, setActive] = useState<"Todos" | Position>("Todos");
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const filtered =
    active === "Todos"
      ? players
      : players.filter((p) => p.position === active);

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  return (
    <>
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
              <PlayerCard
                key={player.id}
                player={player}
                index={i}
                onPhotoClick={openLightbox}
              />
            ))}
          </div>

          {/* Cuerpo Tecnico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20 text-center"
          >
            <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Cuerpo Tecnico
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              Los que dirigen desde la banda (o rellenan botellas).
            </p>
          </motion.div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
            {staff.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:border-primary/40"
              >
                <div className="flex flex-col items-center text-center">
                  <button
                    onClick={() => openLightbox(member.avatar, member.name)}
                    className="relative mb-4 h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-border transition-colors duration-300 group-hover:border-accent"
                    aria-label={`Ampliar foto de ${member.name}`}
                  >
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="96px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-all duration-300 group-hover:bg-background/40">
                      <ZoomIn className="h-5 w-5 text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  </button>

                  <h3 className="text-lg font-bold text-card-foreground">
                    {member.name}
                  </h3>

                  <span className="mt-1 inline-flex rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    {member.role}
                  </span>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox portal */}
      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox
            src={lightbox.src}
            alt={lightbox.alt}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
