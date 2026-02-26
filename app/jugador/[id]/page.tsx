import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Target, Shield, HeartPulse } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EditableAvatar } from "@/components/editable-avatar";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Genera estadísticas aleatorias pero consistentes basadas en el ID del jugador
function generateRadarStats(id: string) {
    let seed = 0;
    for (let i = 0; i < id.length; i++) {
        seed += id.charCodeAt(i);
    }

    const random = (min: number, max: number, offset: number) => {
        const val = Math.sin(seed + offset) * 10000;
        return Math.floor((val - Math.floor(val)) * (max - min + 1)) + min;
    };

    return [
        { label: "Ritmo", value: random(40, 95, 1) },
        { label: "Tiro", value: random(30, 90, 2) },
        { label: "Pase", value: random(40, 90, 3) },
        { label: "Regate", value: random(30, 85, 4) },
        { label: "Defensa", value: random(15, 85, 5) },
        { label: "Físico", value: random(50, 99, 6) }
    ];
}

function RadarChart({ data }: { data: { label: string, value: number }[] }) {
    const size = 300;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.35;
    const max = 100;

    const points = data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
        const r = (d.value / max) * radius;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(" ");

    const levels = 5;
    const gridPolygons = Array.from({ length: levels }).map((_, level) => {
        const r = (radius / levels) * (level + 1);
        const pts = data.map((_, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(" ");
        return <polygon key={level} points={pts} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth="1" />;
    });

    return (
        <div className="relative w-full max-w-sm mx-auto aspect-square text-foreground flex items-center justify-center">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
                {gridPolygons}
                {data.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    return (
                        <line
                            key={i}
                            x1={cx} y1={cy}
                            x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)}
                            stroke="currentColor" strokeOpacity={0.1} strokeWidth="1"
                        />
                    );
                })}

                <polygon points={points} fill="#10b981" fillOpacity={0.3} stroke="#10b981" strokeWidth="3" />

                {data.map((d, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    const r = (d.value / max) * radius;
                    return (
                        <circle
                            key={i}
                            cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)}
                            r="4" fill="#10b981"
                        />
                    );
                })}

                {data.map((d, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    const r = radius * 1.25;
                    const labelX = cx + r * Math.cos(angle);
                    const labelY = cy + r * Math.sin(angle);
                    return (
                        <text
                            key={i}
                            x={labelX} y={labelY}
                            fill="currentColor"
                            fontSize="12"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            <tspan x={labelX} dy="-5">{d.label}</tspan>
                            <tspan x={labelX} dy="15" fill="#10b981">{d.value}</tspan>
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

export default async function JugadorPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    if (!id) notFound();

    const { data: jugador, error } = await supabaseAdmin
        .from("jugadores")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !jugador) {
        notFound();
    }

    const chartData = generateRadarStats(jugador.id);
    const avatarImage = jugador.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(jugador.nombre)}&background=0D8ABC&color=fff&size=200`;

    return (
        <div className="min-h-screen bg-background">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(160_80%_20%_/_0.3),_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(90_65%_50%_/_0.2),_transparent_60%)]" />
            </div>

            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-24">
                <Link
                    href="/#equipo"
                    className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-white mb-6 backdrop-blur-md bg-black/20 border border-primary-foreground/10 px-4 py-2 rounded-full transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a la plantilla
                </Link>

                <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
                    <div className="p-8 sm:p-12 md:flex gap-12 items-start">

                        <div className="shrink-0 flex flex-col items-center">
                            <EditableAvatar
                                jugadorId={jugador.id}
                                currentFotoUrl={jugador.foto_url}
                                jugadorNombre={jugador.nombre}
                            />
                            <div className="mt-6 flex flex-col items-center">
                                <div className="text-5xl font-black text-foreground">{jugador.dorsal || "-"}</div>
                                <div className="text-sm font-bold text-accent uppercase tracking-widest mt-1">{jugador.posicion}</div>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-0 flex-1">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-4">
                                {jugador.nombre}
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Miembro oficial de Impersed Cubiertas FC. Entrega, pasión y tercer tiempo garantizado.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-muted rounded-xl p-4 border border-border flex flex-col items-center justify-center text-center shadow-sm">
                                    <Target className="h-5 w-5 text-accent mb-2" />
                                    <span className="text-3xl font-bold">{jugador.goles || 0}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Goles</span>
                                </div>
                                <div className="bg-muted rounded-xl p-4 border border-border flex flex-col items-center justify-center text-center shadow-sm">
                                    <HeartPulse className="h-5 w-5 text-rose-500 mb-2" />
                                    <span className="text-3xl font-bold">{chartData.find(d => d.label === "Físico")?.value}%</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Físico</span>
                                </div>
                            </div>

                            <div className="border-t border-border pt-10 mt-10">
                                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-accent" /> Carta de Habilidades
                                </h3>
                                <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background rounded-3xl p-8 border border-border shadow-inner">
                                    <RadarChart data={chartData} />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
