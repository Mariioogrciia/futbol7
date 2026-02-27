"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface EditableStatsProps {
    jugadorId: string;
    canEdit: boolean;
    initialStats: {
        ritmo: number;
        tiro: number;
        pase: number;
        regate: number;
        defensa: number;
        fisico: number;
    };
}

export function EditableStats({ jugadorId, canEdit, initialStats }: EditableStatsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState(initialStats);
    const [isSaving, setIsSaving] = useState(false);
    const [canEditReal, setCanEditReal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: userData } = await supabase
                    .from('usuarios')
                    .select('rol, jugador_id')
                    .eq('id', session.user.id)
                    .single();

                if (userData?.rol === 'admin' || userData?.jugador_id === jugadorId) {
                    setCanEditReal(true);
                }
            }
        };
        checkAuth();
    }, [jugadorId]);

    const chartData = [
        { label: "Ritmo", value: stats.ritmo },
        { label: "Tiro", value: stats.tiro },
        { label: "Pase", value: stats.pase },
        { label: "Regate", value: stats.regate },
        { label: "Defensa", value: stats.defensa },
        { label: "Físico", value: stats.fisico }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No estás autenticado");

            const res = await fetch('/api/players/stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    jugador_id: jugadorId,
                    stats
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al actualizar estadísticas");
            }

            toast.success("Estadísticas actualizadas con éxito");
            setIsEditing(false);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative w-full">
            {canEditReal && !isEditing && (
                <div className="absolute top-0 right-0 z-10">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm"
                    >
                        <Edit2 className="h-4 w-4" /> Editar
                    </button>
                </div>
            )}

            {isEditing ? (
                <div className="bg-card rounded-2xl p-6 border border-border mt-4 w-full animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                        <h4 className="text-xl font-bold flex items-center gap-2">
                            Ajustar Estadísticas
                        </h4>
                        <button onClick={() => { setIsEditing(false); setStats(initialStats); }} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-secondary">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pt-2">
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="space-y-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold uppercase tracking-widest text-foreground capitalize">
                                        {key}
                                    </label>
                                    <span className="text-xl font-black text-primary bg-primary/10 px-3 py-1 rounded-md min-w-[3rem] text-center">
                                        {value}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="99"
                                    value={value}
                                    onChange={(e) => setStats(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            onClick={() => { setIsEditing(false); setStats(initialStats); }}
                            className="px-6 py-3 rounded-xl border border-border hover:bg-secondary font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                            Guardar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background rounded-3xl p-8 border border-border shadow-inner">
                    <RadarChart data={chartData} />
                </div>
            )}
        </div>
    );
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
