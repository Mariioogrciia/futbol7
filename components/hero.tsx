"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Users, ArrowRightLeft } from "lucide-react";
import Image from "next/image";
import { useTeamData } from "@/components/providers/team-provider";
import { Termometro } from "@/components/termometro";

type KitType = "jugador" | "portero";

export function Hero() {
    // ---- Slider State ----
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 2; // 0 = Intro, 1 = Team Kits

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

    // ---- Hero Data ----
    const { stats, jugadores } = useTeamData();

    const quickStats = [
        { label: "Partidos jugados", value: stats.partidosJugados.toString() },
        { label: "Victorias", value: stats.victorias.toString() },
        { label: "Goles esta temporada", value: stats.golesFavor.toString() },
        { label: "Jugadores", value: jugadores.length.toString() },
    ];

    // ---- Team Kits State & Logic ----
    const [activeKit, setActiveKit] = useState<KitType>("jugador");

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        let mouseX = (e.clientX - rect.left) / width - 0.5;
        let mouseY = (e.clientY - rect.top) / height - 0.5;

        mouseX = Math.max(-0.5, Math.min(0.5, mouseX));
        mouseY = Math.max(-0.5, Math.min(0.5, mouseY));

        x.set(mouseX);
        y.set(mouseY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const toggleKit = () => {
        setActiveKit(prev => prev === "jugador" ? "portero" : "jugador");
    };

    const isJugador = activeKit === "jugador";
    const glowColorPlayer = "bg-emerald-500/15";
    const glowColorGoalkeeper = "bg-yellow-500/15";

    return (
        <section
            id="inicio"
            className="relative flex flex-col items-center justify-center min-h-[95vh] lg:min-h-screen overflow-hidden bg-primary pb-16"
        >
            {/* --- Unified Background --- */}
            {/* Gradient Glows from TeamKits */}
            <div className={`absolute top-1/4 right-0 h-[800px] w-[800px] rounded-full blur-[150px] mix-blend-screen transition-colors duration-1000 ${isJugador ? glowColorPlayer : glowColorGoalkeeper} pointer-events-none`} />
            <div className={`absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full blur-[150px] mix-blend-screen transition-colors duration-1000 ${isJugador ? glowColorPlayer : glowColorGoalkeeper} pointer-events-none`} />

            {/* Subtle light effects from old Hero */}
            <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

            {/* Seamless Grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                    backgroundAttachment: "fixed"
                }}
            />

            {/* Slider container */}
            <div className="relative w-full max-w-7xl mx-auto px-12 lg:px-16 mt-24 z-10 flex-1 flex items-center">
                <AnimatePresence mode="wait">
                    {currentSlide === 0 ? (
                        /* =========================================
                              PART 1: HERO INTRO & STATS
                        ========================================= */
                        <motion.div
                            key="slide-intro"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="w-full"
                        >
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                {/* Text content */}
                                <div className="flex flex-col items-start">
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

                                    <div className="mt-6">
                                        <Termometro />
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-4">
                                        <button
                                            onClick={nextSlide}
                                            className="group inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
                                        >
                                            Ver Nuestra Piel
                                            <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                        <a
                                            href="#equipo"
                                            className="group inline-flex items-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-foreground/10 hover:border-primary-foreground/30"
                                        >
                                            <Users className="mr-2 h-4 w-4" />
                                            Ver plantilla
                                        </a>
                                    </div>
                                </div>

                                {/* Stats cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    {quickStats.map((stat, i) => (
                                        <div
                                            key={stat.label}
                                            className="group rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-primary-foreground/10"
                                        >
                                            <p className="text-3xl font-bold text-accent lg:text-4xl">
                                                {stat.value}
                                            </p>
                                            <p className="mt-1 text-sm text-primary-foreground/60">
                                                {stat.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* =========================================
                              PART 2: TEAM KITS 3D PRESENTATION
                        ========================================= */
                        <motion.div
                            key="slide-kits"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="w-full"
                        >
                            <div className="grid items-center gap-16 lg:grid-cols-2">

                                {/* Left Column: Text & Actions */}
                                <div className="flex flex-col items-start">
                                    <h2 className="text-balance text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl">
                                        La Piel de <br />
                                        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isJugador ? 'from-emerald-400 to-emerald-600' : 'from-yellow-400 to-yellow-600'} transition-colors duration-500`}>
                                            Impersed FC
                                        </span>
                                    </h2>

                                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80 font-medium">
                                        Nuestra armadura oficial diseñada para las leyendas del césped (o al menos, los que más lo intentan).
                                    </p>

                                    {/* Actions */}
                                    <div className="mt-10 flex flex-wrap items-center gap-4">
                                        <button
                                            onClick={toggleKit}
                                            className="group inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white/90 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/30"
                                        >
                                            <ArrowRightLeft className="mr-2 h-5 w-5 opacity-70 group-hover:rotate-180 transition-transform duration-500" />
                                            {isJugador ? "Equipación Portero" : "Equipación Campo"}
                                        </button>
                                        <a
                                            href="#partidos"
                                            className={`group inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isJugador ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50 hover:shadow-emerald-500/30' : 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/50 hover:shadow-yellow-500/30'}`}
                                        >
                                            Ir a partidos
                                            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </a>
                                    </div>

                                    {/* Styled Radios */}
                                    <div className="mt-8 flex items-center gap-6">
                                        <button
                                            onClick={() => setActiveKit("jugador")}
                                            className={`flex items-center gap-2 text-sm font-black tracking-wider uppercase transition-colors duration-300 ${isJugador ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'text-white/40 hover:text-white/60'}`}
                                        >
                                            <div className={`h-4 w-4 rounded-full border-2 border-current flex items-center justify-center ${isJugador ? 'bg-transparent' : 'bg-transparent'}`}>
                                                {isJugador && <div className="h-2 w-2 rounded-full bg-emerald-400" />}
                                            </div>
                                            JUGADOR
                                        </button>
                                        <button
                                            onClick={() => setActiveKit("portero")}
                                            className={`flex items-center gap-2 text-sm font-black tracking-wider uppercase transition-colors duration-300 ${!isJugador ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-white/40 hover:text-white/60'}`}
                                        >
                                            <div className={`h-4 w-4 rounded-full border-2 border-current flex items-center justify-center ${!isJugador ? 'bg-transparent' : 'bg-transparent'}`}>
                                                {!isJugador && <div className="h-2 w-2 rounded-full bg-yellow-400" />}
                                            </div>
                                            PORTERO
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: 3D Kit */}
                                <div
                                    className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full flex items-center justify-center perspective-[1200px]"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <motion.div
                                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                                        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                                        drag
                                        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                                        dragElastic={0.1}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeKit}
                                                initial={{ y: 150, opacity: 0, scale: 0.8 }}
                                                animate={{ y: [-15, 15, -15], opacity: 1, scale: 1 }}
                                                exit={{ y: -100, opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                                transition={{
                                                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                                                    opacity: { duration: 0.5 },
                                                    scale: { type: "spring", bounce: 0.5, duration: 1 }
                                                }}
                                                className="relative w-[100%] h-[100%] z-20"
                                            >
                                                <Image
                                                    src={isJugador ? "/images/equipacion-blanca.png" : "/images/equipacion-amarilla.png"}
                                                    alt={isJugador ? "Equipación Jugador Impersed FC" : "Equipación Portero Impersed FC"}
                                                    fill
                                                    className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.8)] pointer-events-none"
                                                    priority
                                                />

                                                {/* Floating shadow at the bottom */}
                                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/40 blur-xl rounded-[100%]"></div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Slider Navigation (Left/Right Overlay Arrows) */}
            <div className="absolute inset-y-0 left-0 flex items-center justify-start px-2 lg:px-4 pointer-events-none z-20">
                <button
                    onClick={prevSlide}
                    className="pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-black/20 text-white/50 hover:bg-black/40 hover:text-white backdrop-blur-md transition-all transform hover:scale-110"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center justify-end px-2 lg:px-4 pointer-events-none z-20">
                <button
                    onClick={nextSlide}
                    className="pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-black/20 text-white/50 hover:bg-black/40 hover:text-white backdrop-blur-md transition-all transform hover:scale-110"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* Slider Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
                {[0, 1].map((index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-accent' : 'w-2.5 bg-white/30 hover:bg-white/50'}`}
                        aria-label={`Ir a la diapositiva ${index + 1}`}
                    />
                ))}
            </div>

            {/* Unified Bottom fade to general background */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        </section>
    );
}
