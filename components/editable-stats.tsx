"use client";

import { useState, useEffect } from "react";
import { Edit2, Save, X, Loader2, Wind, Target, Zap, Move, Lock, Dumbbell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditableStatsProps {
    jugadorId: string;
    canEdit: boolean;
    initialStats: {
        ritmo: number; tiro: number; pase: number;
        regate: number; defensa: number; fisico: number;
    };
}

const STAT_META: Record<string, { label: string; IconComp: any; short: string }> = {
    ritmo:   { label: "Ritmo",    IconComp: Wind,    short: "RIT" },
    tiro:    { label: "Tiro",     IconComp: Target,  short: "TIR" },
    pase:    { label: "Pase",     IconComp: Zap,     short: "PAS" },
    regate:  { label: "Regate",  IconComp: Move,    short: "REG" },
    defensa: { label: "Defensa",  IconComp: Lock,    short: "DEF" },
    fisico:  { label: "Físico",   IconComp: Dumbbell, short: "FIS" },
};

function getStatColor(value: number) {
    if (value >= 80) return "#10b981"; // emerald
    if (value >= 65) return "#f59e0b"; // amber
    return "#64748b"; // slate
}

// ─── Premium Radar chart ───────────────────────────────────────
function RadarChart({ data }: { data: { label: string; value: number; short: string }[] }) {
    const size = 280;
    const cx = size / 2, cy = size / 2;
    const radius = size * 0.33;
    const n = data.length;

    const getXY = (i: number, r: number) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1];

    const gridPaths = gridLevels.map(level => {
        const pts = Array.from({ length: n }, (_, i) => getXY(i, radius * level));
        return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
    });

    const dataPoints = data.map((d, i) => getXY(i, (d.value / 99) * radius));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

    return (
        <div className="relative w-full max-w-[280px] mx-auto aspect-square">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Grid rings */}
                {gridPaths.map((d, i) => (
                    <path key={i} d={d} fill="none"
                        stroke="rgba(148,163,184,0.12)"
                        strokeWidth={i === gridLevels.length - 1 ? "1.5" : "1"} />
                ))}
                {/* Axes */}
                {data.map((_, i) => {
                    const outer = getXY(i, radius);
                    return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="rgba(148,163,184,0.1)" strokeWidth="1" />;
                })}
                {/* Data fill */}
                <path d={dataPath} fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
                {/* Node dots */}
                {dataPoints.map((p, i) => {
                    const val = data[i].value;
                    const c = getStatColor(val);
                    return (
                        <g key={i}>
                            <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="5" fill="#0f172a" stroke={c} strokeWidth="2" />
                            <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.5" fill={c} />
                        </g>
                    );
                })}
                {/* Labels */}
                {data.map((d, i) => {
                    const pos = getXY(i, radius + 22);
                    const c = getStatColor(d.value);
                    return (
                        <g key={i}>
                            <text x={pos.x.toFixed(1)} y={(pos.y - 6).toFixed(1)}
                                textAnchor="middle" dominantBaseline="middle"
                                fontSize="9" fontWeight="800" letterSpacing="0.08em" fill="rgba(148,163,184,0.8)">
                                {d.short}
                            </text>
                            <text x={pos.x.toFixed(1)} y={(pos.y + 7).toFixed(1)}
                                textAnchor="middle" dominantBaseline="middle"
                                fontSize="10" fontWeight="900" fill={c}>
                                {d.value}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export function EditableStats({ jugadorId, canEdit, initialStats }: EditableStatsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState(initialStats);
    const [isSaving, setIsSaving] = useState(false);
    const [canEditReal, setCanEditReal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data } = await supabase.from("usuarios").select("rol, jugador_id").eq("id", session.user.id).single();
            if (data?.rol === "admin" || data?.jugador_id === jugadorId) setCanEditReal(true);
        })();
    }, [jugadorId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No autenticado");
            const res = await fetch("/api/players/stats", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
                body: JSON.stringify({ jugador_id: jugadorId, stats }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error"); }
            toast.success("Estadísticas actualizadas");
            setIsEditing(false);
            router.refresh();
        } catch (e: any) {
            toast.error(e.message || "Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    const chartData = (["ritmo", "tiro", "pase", "regate", "defensa", "fisico"] as const).map(k => ({
        label: STAT_META[k].label,
        short: STAT_META[k].short,
        value: stats[k],
    }));

    const overall = Math.round(chartData.reduce((a, b) => a + b.value, 0) / chartData.length);

    return (
        <div className="relative w-full">
            {/* Edit button */}
            {canEditReal && !isEditing && (
                <div className="absolute top-0 right-0 z-10">
                    <button onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all hover:bg-emerald-500/10"
                        style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.06)" }}>
                        <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                </div>
            )}

            {isEditing ? (
                /* ── Edit mode ── */
                <div className="border border-emerald-500/20 bg-surface-card rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-border-subtle">
                        <h4 className="font-black text-text-primary tracking-tight">Ajustar Estadísticas</h4>
                        <button onClick={() => { setIsEditing(false); setStats(initialStats); }}
                            className="p-1.5 rounded-lg hover:bg-surface-card-hover text-text-muted hover:text-text-primary transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        {(["ritmo", "tiro", "pase", "regate", "defensa", "fisico"] as const).map(key => {
                            const meta = STAT_META[key];
                            const Icon = meta.IconComp;
                            const color = getStatColor(stats[key]);
                            return (
                                <div key={key} className="p-4 rounded-2xl border border-border-subtle bg-bg-secondary/60">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                                                <Icon className="w-3.5 h-3.5" style={{ color }} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider text-text-secondary">{meta.label}</span>
                                        </div>
                                        <span className="text-xl font-black" style={{ color }}>{stats[key]}</span>
                                    </div>
                                    <div className="relative h-1.5 rounded-full bg-border-default overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${(stats[key] / 99) * 100}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
                                    </div>
                                    <input type="range" min="1" max="99" value={stats[key]}
                                        onChange={e => setStats(prev => ({ ...prev, [key]: +e.target.value }))}
                                        className="w-full mt-2 opacity-0 absolute h-1.5 cursor-pointer"
                                        style={{ position: "relative" }}
                                    />
                                    {/* Real slider on top */}
                                    <input type="range" min="1" max="99" value={stats[key]}
                                        onChange={e => setStats(prev => ({ ...prev, [key]: +e.target.value }))}
                                        className="w-full mt-1.5 h-4 cursor-pointer opacity-0 absolute"
                                    />
                                    <input type="range" min="1" max="99" value={stats[key]}
                                        onChange={e => setStats(prev => ({ ...prev, [key]: +e.target.value }))}
                                        className="w-full cursor-pointer mt-1.5"
                                        style={{ accentColor: color, height: "4px" }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <button onClick={() => { setIsEditing(false); setStats(initialStats); }}
                            className="px-5 py-2.5 rounded-xl border border-border-default font-bold text-sm text-text-secondary hover:bg-surface-card-hover transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #10b981, #0d9488)", color: "white" }}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar
                        </button>
                    </div>
                </div>
            ) : (
                /* ── Display mode ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* Radar */}
                    <div className="bg-bg-secondary/40 rounded-2xl p-4 border border-border-subtle">
                        <RadarChart data={chartData} />
                        <div className="text-center mt-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Media general</span>
                            <div className="text-3xl font-black text-emerald-500 leading-none mt-1">{overall}</div>
                        </div>
                    </div>

                    {/* Stat bars */}
                    <div className="space-y-3.5">
                        {chartData.map((d) => {
                            const meta = STAT_META[d.label.toLowerCase()] ?? STAT_META["ritmo"];
                            const Icon = STAT_META[Object.keys(STAT_META).find(k => STAT_META[k].label === d.label) ?? "ritmo"].IconComp;
                            const color = getStatColor(d.value);
                            const pct = Math.round((d.value / 99) * 100);
                            return (
                                <div key={d.label} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{d.label}</span>
                                            <span className="text-sm font-black" style={{ color }}>{d.value}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-border-default overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}50, ${color})` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
