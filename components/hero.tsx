"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Users, ArrowRight, ArrowRightLeft, Shield } from "lucide-react";
import Image from "next/image";
import { useTeamData } from "@/components/providers/team-provider";
import { Termometro } from "@/components/termometro";
import { cn } from "@/lib/utils";

type KitType = "jugador" | "portero";

/* ── Shared slide wrapper ── */
function SlideWrapper({ children, slideKey, dir }: { children: React.ReactNode; slideKey: string; dir: number }) {
    return (
        <motion.div
            key={slideKey}
            initial={{ opacity: 0, x: dir > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir > 0 ? -60 : 60 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
}

export function Hero() {
    // ── Slider ──
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideDir, setSlideDir] = useState(1);
    const totalSlides = 2;

    const goTo = (idx: number) => {
        setSlideDir(idx > currentSlide ? 1 : -1);
        setCurrentSlide(idx);
    };
    const nextSlide = () => goTo((currentSlide + 1) % totalSlides);
    const prevSlide = () => goTo((currentSlide - 1 + totalSlides) % totalSlides);

    // ── Data ──
    const { stats, jugadores } = useTeamData();
    const quickStats = [
        { label: "Partidos jugados", value: stats.partidosJugados },
        { label: "Victorias",        value: stats.victorias },
        { label: "Goles favor",      value: stats.golesFavor },
        { label: "Jugadores",        value: jugadores.length },
    ];

    // ── Kit 3D ──
    const [activeKit, setActiveKit] = useState<KitType>("jugador");
    const isJugador = activeKit === "jugador";

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5)));
        y.set(Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5)));
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <section
            id="inicio"
            className="relative flex flex-col items-center justify-center min-h-[95vh] lg:min-h-screen overflow-hidden bg-primary pb-16"
        >
            {/* ── Ambient glow system ── */}
            <div className={cn(
                "absolute top-1/4 right-0 h-[700px] w-[700px] rounded-full blur-[140px] opacity-20 transition-all duration-1000 pointer-events-none",
                isJugador ? "bg-emerald-500" : "bg-amber-400"
            )} />
            <div className={cn(
                "absolute -bottom-32 -left-16 h-[500px] w-[500px] rounded-full blur-[120px] opacity-15 transition-all duration-1000 pointer-events-none",
                isJugador ? "bg-teal-600" : "bg-yellow-600"
            )} />
            <div className="absolute top-12 left-1/3 h-64 w-64 rounded-full bg-accent/[0.06] blur-3xl pointer-events-none" />

            {/* ── Subtle grid overlay ── */}
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
                    backgroundSize: "64px 64px",
                    backgroundAttachment: "fixed",
                }}
            />

            {/* ── Slide container ── */}
            <div className="relative w-full max-w-7xl mx-auto px-10 lg:px-16 mt-24 z-10 flex-1 flex items-center">
                <AnimatePresence mode="wait">
                    {currentSlide === 0 ? (
                        /* ══════════════════════════════════════
                           SLIDE 1 — Intro & Stats
                        ══════════════════════════════════════ */
                        <SlideWrapper slideKey="slide-intro" dir={slideDir}>
                            <div className="grid items-center gap-12 lg:grid-cols-2">

                                {/* Left: copy */}
                                <div className="flex flex-col items-start">
                                    {/* Eyebrow badge */}
                                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 backdrop-blur-sm">
                                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                        <span className="text-xs font-black tracking-[0.15em] uppercase text-white/70">
                                            Temporada 2025/26
                                        </span>
                                    </div>

                                    {/* Headline */}
                                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.95] tracking-tighter text-white drop-shadow-2xl">
                                        La pasión por el{" "}
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                                            fútbol
                                        </span>
                                        {" "}nos une
                                    </h1>

                                    {/* Body */}
                                    <p className="mt-6 max-w-md text-base leading-relaxed text-white/65 font-medium lg:text-lg">
                                        Somos Impersed Cubiertas FC. No ganamos ni a las canicas, pero le ponemos ganas que no es poco. Conoce a los valientes que componen el equipo.
                                    </p>

                                    {/* Form / Termometro */}
                                    <div className="mt-6">
                                        <Termometro />
                                    </div>

                                    {/* CTAs */}
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <button
                                            onClick={nextSlide}
                                            className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-black tracking-wide text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30 hover:brightness-110"
                                        >
                                            Ver nuestra piel
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                        <a
                                            href="#equipo"
                                            className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/6 px-6 py-3 text-sm font-bold text-white/80 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/25 hover:text-white"
                                        >
                                            <Users className="h-4 w-4" />
                                            Ver plantilla
                                        </a>
                                    </div>
                                </div>

                                {/* Right: stats grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                    {quickStats.map((stat, i) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                                            className="group relative rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/8 hover:border-white/15 overflow-hidden"
                                        >
                                            {/* Left accent bar */}
                                            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-accent/50 group-hover:bg-accent transition-colors duration-300" />
                                            <p className="text-4xl font-black text-white tabular-nums lg:text-5xl">
                                                {stat.value}
                                            </p>
                                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-white/45">
                                                {stat.label}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </SlideWrapper>
                    ) : (
                        /* ══════════════════════════════════════
                           SLIDE 2 — Team Kits
                        ══════════════════════════════════════ */
                        <SlideWrapper slideKey="slide-kits" dir={slideDir}>
                            <div className="grid items-center gap-12 lg:gap-20 lg:grid-cols-2">

                                {/* Left: copy & controls */}
                                <div className="flex flex-col items-start">
                                    {/* Eyebrow badge */}
                                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 backdrop-blur-sm">
                                        <Shield className="h-3 w-3 text-white/60" />
                                        <span className="text-xs font-black tracking-[0.15em] uppercase text-white/70">
                                            Equipación Oficial · 2025
                                        </span>
                                    </div>

                                    {/* Headline */}
                                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.95] tracking-tighter text-white">
                                        La Piel de{" "}
                                        <span className={cn(
                                            "text-transparent bg-clip-text bg-gradient-to-r transition-all duration-700",
                                            isJugador
                                                ? "from-emerald-400 via-teal-300 to-emerald-400"
                                                : "from-amber-400 via-yellow-300 to-amber-400"
                                        )}>
                                            Impersed FC
                                        </span>
                                    </h2>

                                    {/* Body */}
                                    <p className="mt-6 max-w-md text-base leading-relaxed text-white/65 font-medium lg:text-lg">
                                        Nuestra armadura oficial — diseñada para las leyendas del césped (o al menos, los que más lo intentan).
                                    </p>

                                    {/* Kit pill-switch */}
                                    <div className="mt-8 inline-flex items-center gap-1 rounded-2xl border border-white/12 bg-white/5 p-1.5 backdrop-blur-sm">
                                        {(["jugador", "portero"] as KitType[]).map((kit) => {
                                            const isActive = activeKit === kit;
                                            return (
                                                <button
                                                    key={kit}
                                                    onClick={() => setActiveKit(kit)}
                                                    className={cn(
                                                        "px-5 py-2 rounded-xl text-xs font-black tracking-[0.12em] uppercase transition-all duration-300",
                                                        isActive
                                                            ? kit === "jugador"
                                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                            : "text-white/40 hover:text-white/70"
                                                    )}
                                                >
                                                    {kit === "jugador" ? "Jugador" : "Portero"}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* CTA row */}
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <a
                                            href="#partidos"
                                            className={cn(
                                                "group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black tracking-wide text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
                                                isJugador
                                                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50 hover:shadow-emerald-500/30"
                                                    : "bg-amber-600 hover:bg-amber-500 shadow-amber-900/50 hover:shadow-amber-500/30"
                                            )}
                                        >
                                            Ir a Partidos
                                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </a>
                                        <button
                                            onClick={() => setActiveKit(isJugador ? "portero" : "jugador")}
                                            className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/6 px-6 py-3 text-sm font-bold text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/25 hover:text-white"
                                        >
                                            <ArrowRightLeft className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                                            {isJugador ? "Ver portero" : "Ver jugador"}
                                        </button>
                                    </div>
                                </div>

                                {/* Right: 3D Kit */}
                                <div
                                    className="relative h-[380px] sm:h-[480px] lg:h-[560px] w-full flex items-center justify-center"
                                    style={{ perspective: "1200px" }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Ground glow */}
                                    <div className={cn(
                                        "absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-24 blur-3xl rounded-[100%] transition-all duration-700 opacity-30",
                                        isJugador ? "bg-emerald-500" : "bg-amber-400"
                                    )} />

                                    <motion.div
                                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                                        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                                        drag
                                        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                                        dragElastic={0.08}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeKit}
                                                initial={{ y: 80, opacity: 0, scale: 0.85 }}
                                                animate={{ y: [-12, 12, -12], opacity: 1, scale: 1 }}
                                                exit={{ y: -80, opacity: 0, scale: 0.85, transition: { duration: 0.3 } }}
                                                transition={{
                                                    y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                                                    opacity: { duration: 0.5 },
                                                    scale: { type: "spring", bounce: 0.45, duration: 0.9 },
                                                }}
                                                className="relative w-full h-full z-20"
                                            >
                                                <Image
                                                    src={isJugador ? "/images/equipacion-blanca.png" : "/images/equipacion-amarilla.png"}
                                                    alt={isJugador ? "Equipación Jugador Impersed FC" : "Equipación Portero Impersed FC"}
                                                    fill
                                                    className="object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.7)] pointer-events-none"
                                                    priority
                                                />
                                                {/* Hard shadow */}
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-6 bg-black/50 blur-xl rounded-[100%]" />
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.div>
                                </div>

                            </div>
                        </SlideWrapper>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Arrow navigation ── */}
            <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/50 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/25 hover:text-white hover:scale-110"
                aria-label="Anterior"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/50 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/25 hover:text-white hover:scale-110"
                aria-label="Siguiente"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            {/* ── Slide indicators ── */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                {[0, 1].map((i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={cn(
                            "rounded-full transition-all duration-300",
                            currentSlide === i
                                ? "w-7 h-1.5 bg-accent"
                                : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
                        )}
                    />
                ))}
            </div>

            {/* ── Bottom fade to page background ── */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        </section>
    );
}
