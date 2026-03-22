import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Target, Zap, Star, Award } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EditableAvatar } from "@/components/editable-avatar";
import { EditableStats } from "@/components/editable-stats";
import { ModeToggle } from "@/components/mode-toggle";

interface PageProps {
    params: Promise<{ id: string }>;
}

const POSICION_CONFIG: Record<string, { label: string; color: string; from: string; to: string; bg: string }> = {
    Portero:    { label: "POR", color: "#f59e0b", from: "#f59e0b", to: "#d97706", bg: "rgba(245,158,11,0.08)" },
    Defensa:    { label: "DEF", color: "#3b82f6", from: "#3b82f6", to: "#2563eb", bg: "rgba(59,130,246,0.08)" },
    Medio:      { label: "MED", color: "#10b981", from: "#10b981", to: "#059669", bg: "rgba(16,185,129,0.08)" },
    Delantero:  { label: "DEL", color: "#ef4444", from: "#ef4444", to: "#dc2626", bg: "rgba(239,68,68,0.08)" },
    MED:        { label: "MED", color: "#10b981", from: "#10b981", to: "#059669", bg: "rgba(16,185,129,0.08)" },
    DEF:        { label: "DEF", color: "#3b82f6", from: "#3b82f6", to: "#2563eb", bg: "rgba(59,130,246,0.08)" },
    DEL:        { label: "DEL", color: "#ef4444", from: "#ef4444", to: "#dc2626", bg: "rgba(239,68,68,0.08)" },
    POR:        { label: "POR", color: "#f59e0b", from: "#f59e0b", to: "#d97706", bg: "rgba(245,158,11,0.08)" },
};

export default async function JugadorPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    if (!id) notFound();

    const { data: jugador, error } = await supabaseAdmin
        .from("jugadores").select("*").eq("id", id).single();
    if (error || !jugador) notFound();

    const initialStats = {
        ritmo:   jugador.stat_ritmo   ?? 50,
        tiro:    jugador.stat_tiro    ?? 50,
        pase:    jugador.stat_pase    ?? 50,
        regate:  jugador.stat_regate  ?? 50,
        defensa: jugador.stat_defensa ?? 50,
        fisico:  jugador.stat_fisico  ?? 50,
    };

    const overall = Math.round(
        (initialStats.ritmo + initialStats.tiro + initialStats.pase +
         initialStats.regate + initialStats.defensa + initialStats.fisico) / 6
    );

    const pos = POSICION_CONFIG[jugador.posicion] ?? {
        label: "—", color: "#64748b", from: "#10b981", to: "#059669", bg: "rgba(100,116,139,0.08)"
    };

    const imgSrc = jugador.foto_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(jugador.nombre)}&background=0a3a2a&color=34d399&size=600&bold=true`;

    return (
        <div className="min-h-screen bg-bg-primary relative overflow-x-hidden">

            {/* ── Fixed top controls ───────────────────────────── */}
            <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 bg-bg-primary/40 backdrop-blur-md border-b border-white/5">
                <Link href="/#equipo"
                    className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Plantilla
                </Link>
                <ModeToggle />
            </div>

            {/* ── CREATIVE HERO ─────────────────────────────────── */}
            <div className="relative w-full overflow-hidden" style={{ minHeight: "420px" }}>

                {/* Layer 1: Dark base */}
                <div className="absolute inset-0 bg-bg-primary" />

                {/* Layer 2: Blurred photo large fill */}
                <div className="absolute inset-0">
                    <img src={imgSrc} alt="" aria-hidden
                        className="absolute inset-0 w-full h-full object-cover object-top scale-110"
                        style={{ filter: "blur(32px) saturate(0.5)", opacity: 0.18 }} />
                </div>

                {/* Layer 3: Position gradient tint */}
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 30% 40%, ${pos.from}22 0%, transparent 65%)` }} />

                {/* Layer 4: Soccer field line art (SVG) */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <pattern id="field-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#field-lines)" />
                    {/* Center circle */}
                    <circle cx="50%" cy="50%" r="120" fill="none" stroke="white" strokeWidth="0.8"/>
                    {/* Penalty arc */}
                    <path d="M calc(50% - 80px) 0 Q 50% 120px calc(50% + 80px) 0" fill="none" stroke="white" strokeWidth="0.8"/>
                </svg>

                {/* Layer 5: Decorative hexagon shapes */}
                <svg className="absolute right-0 top-0 h-full w-1/2 opacity-[0.04]" viewBox="0 0 400 500">
                    {[[200,150,80],[290,280,55],[140,350,40],[320,80,35],[80,450,30]].map(([cx, cy, r], i) => (
                        <polygon key={i} points={
                            Array.from({length:6}, (_,j) => {
                                const a = (Math.PI/3)*j - Math.PI/6;
                                return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;
                            }).join(" ")
                        } fill="none" stroke="white" strokeWidth="0.8"/>
                    ))}
                </svg>

                {/* Layer 6: luminous line from left edge */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-0.5"
                    style={{ background: `linear-gradient(90deg, ${pos.from}80, transparent)` }} />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-8 blur-xl"
                    style={{ background: `${pos.from}30` }} />

                {/* Layer 7: bottom gradient into page */}
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-bg-primary" />

                {/* ── HERO CONTENT ── */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 flex flex-col md:flex-row items-end md:items-center gap-8">
                    {/* Photo Card */}
                    <div className="shrink-0">
                        <div className="relative">
                            {/* Glow halo */}
                            <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-30" style={{ background: `radial-gradient(ellipse, ${pos.from}, transparent 70%)` }} />
                            <div className="relative z-10">
                                <EditableAvatar
                                    jugadorId={jugador.id}
                                    currentFotoUrl={jugador.foto_url}
                                    jugadorNombre={jugador.nombre}
                                />
                            </div>
                            {/* Dorsal badge */}
                            <div className="absolute -bottom-3 -right-3 z-20 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-xl border border-white/10"
                                style={{ background: `linear-gradient(135deg, ${pos.from}, ${pos.to})` }}>
                                {jugador.dorsal || "—"}
                            </div>
                        </div>
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm"
                                style={{ color: pos.color, background: `${pos.color}18`, borderColor: `${pos.color}35` }}>
                                {jugador.posicion}
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-surface-card/30 border border-white/10 text-text-secondary backdrop-blur-sm">
                                <Award className="w-3 h-3" /> Impersed Cubiertas FC
                            </span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-text-primary tracking-tighter leading-none drop-shadow-sm">
                            {jugador.nombre}
                        </h1>
                        <p className="mt-3 text-text-secondary font-medium max-w-lg">
                            Compromiso, entrega y tercer tiempo garantizado. Miembro oficial del equipo.
                        </p>
                    </div>

                    {/* Overall badge */}
                    <div className="shrink-0 w-24 h-24 rounded-3xl flex flex-col items-center justify-center border shadow-xl backdrop-blur-sm"
                        style={{ background: pos.bg, borderColor: `${pos.color}30` }}>
                        <span className="text-4xl font-black leading-none" style={{ color: pos.color }}>{overall}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-text-muted">Overall</span>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ─────────────────────────────────── */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-2">

                    {/* Quick stats column */}
                    <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                        <div className="bg-surface-card/80 backdrop-blur-xl border border-border-default rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm col-span-1">
                            <Target className="w-5 h-5 text-emerald-500" />
                            <span className="text-3xl font-black text-text-primary">{jugador.goles || 0}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Goles</span>
                        </div>
                        <div className="bg-surface-card/80 backdrop-blur-xl border border-border-default rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm col-span-1">
                            <Star className="w-5 h-5 text-amber-500" />
                            <span className="text-3xl font-black text-text-primary">{overall}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Overall</span>
                        </div>
                        <div className="bg-surface-card/80 backdrop-blur-xl border border-border-default rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm col-span-2"
                            style={{ borderColor: `${pos.color}25`, background: pos.bg }}>
                            <Zap className="w-5 h-5" style={{ color: pos.color }} />
                            <span className="text-2xl font-black" style={{ color: pos.color }}>{jugador.posicion}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Posición</span>
                        </div>
                    </div>

                    {/* Stats card */}
                    <div className="lg:col-span-2 bg-surface-card/80 backdrop-blur-xl border border-border-default rounded-[2rem] shadow-elevated overflow-hidden">
                        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, #10b981, #0d9488, transparent)` }} />
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-7">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                <h3 className="text-xl font-black text-text-primary tracking-tight">Carta de Habilidades</h3>
                                <div className="flex-1 h-px bg-border-subtle" />
                                <Zap className="w-4 h-4 text-emerald-500" />
                            </div>
                            <EditableStats
                                jugadorId={jugador.id}
                                canEdit={true}
                                initialStats={initialStats}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
