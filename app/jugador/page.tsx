"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, CalendarHeart, XCircle, CheckCircle2, ChevronDown, User, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568";

export default function PlayerPortal() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [jugadorId, setJugadorId] = useState<string | null>(null);
    const [nextMatch, setNextMatch] = useState<any>(null);
    const [asistencia, setAsistencia] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    // Team State for shared logins
    const [players, setPlayers] = useState<any[]>([]);
    const [loadingRSVP, setLoadingRSVP] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    async function checkAuthAndFetch() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/");
                return;
            }

            const { data: userData } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!userData || userData.rol !== "equipo") {
                console.error("Role mismatch or user missing", userData);
                router.push("/");
                return;
            }

            setUser(session.user);
            // Attempt to retrieve a player id, if missing we will just warn instead of routing out.
            setJugadorId(userData.jugador_id || null);

            // Fetch next match and Team Roster
            const [matchesRes, playersRes] = await Promise.all([
                supabase
                    .from('partidos')
                    .select('*')
                    .eq('estado', 'programado')
                    .order('fecha', { ascending: true })
                    .limit(1),
                fetch(`/api/players?equipo_id=${EQUIPO_ID}&t=${Date.now()}`)
            ]);

            const matches = matchesRes.data;
            if (playersRes.ok) {
                const pData = await playersRes.json();
                setPlayers(pData.jugadores || []);
            }

            if (matches && matches.length > 0) {
                const match = matches[0];
                setNextMatch(match);

                // Fetch existing rsvp if any
                if (userData.jugador_id) {
                    const { data: rsvp } = await supabase
                        .from('convocatorias')
                        .select('asiste')
                        .eq('partido_id', match.id)
                        .eq('jugador_id', userData.jugador_id)
                        .single();

                    if (rsvp) setAsistencia(rsvp.asiste);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handlePlayerSelect = async (id: string) => {
        setJugadorId(id);
        const player = players.find(p => p.id === id);
        if (player) {
            // Check if this newly selected player has already voted
            if (nextMatch) {
                const { data: rsvp } = await supabase
                    .from('convocatorias')
                    .select('asiste')
                    .eq('partido_id', nextMatch.id)
                    .eq('jugador_id', id)
                    .single();

                setAsistencia(rsvp ? rsvp.asiste : null);
            }
        }
    };

    const handleRSVP = async (going: boolean) => {
        if (!jugadorId || !nextMatch) {
            alert("Selecciona tu nombre primero arriba 👆");
            return;
        }

        setLoadingRSVP(true);
        const optimisticPrev = asistencia;
        setAsistencia(going); // Optimistic UI

        try {
            // Upsert logic
            const { error } = await supabase
                .from('convocatorias')
                .upsert({
                    partido_id: nextMatch.id,
                    jugador_id: jugadorId,
                    asiste: going
                }, { onConflict: 'partido_id, jugador_id' });

            if (error) throw error;

            // Show Success Message
            setToastMessage("¡Asistencia registrada correctamente!");
            setTimeout(() => setToastMessage(null), 3500);

        } catch (e) {
            console.error("Error setting RSVP:", e);
            alert("Error al guardar asistencia. Intenta de nuevo.");
            setAsistencia(optimisticPrev); // Revert
        } finally {
            setLoadingRSVP(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8 drop-shadow-[0_0_10px_rgba(20,184,106,0.8)]" /></div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4 relative">

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 border border-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                        {toastMessage}
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-lg dark:shadow-[0_0_30px_rgba(20,184,106,0.15)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-2 drop-shadow-sm text-foreground">Portal del Jugador</h1>
                        <p className="text-muted-foreground font-medium">Panel de asistencia de la plantilla.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-border/50">
                        <ModeToggle />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white rounded-xl transition-all font-bold text-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            Salir
                        </button>
                    </div>
                </div>

                {/* Next Match Card */}
                {nextMatch ? (
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-300">
                        <div className="bg-primary/10 border-b border-border p-6 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10 text-foreground">
                                <CalendarHeart className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(20,184,106,0.6)]" />
                                Próxima Convocatoria
                            </h2>
                            <span className="bg-primary/20 text-primary dark:text-primary-foreground dark:bg-primary border border-primary/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider relative z-10 shadow-[0_0_10px_rgba(20,184,106,0.2)]">
                                Programado
                            </span>
                        </div>

                        <div className="p-8 text-center space-y-6">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Jornada vs</p>
                                <p className="text-4xl font-black">{nextMatch.rival}</p>
                                <p className="text-muted-foreground mt-4 text-lg">
                                    📅 {new Date(nextMatch.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-border mt-8">
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 text-left max-w-md mx-auto">
                                        ¿Quién eres?
                                    </label>
                                    <div className="relative max-w-md mx-auto">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <select
                                            className="w-full appearance-none bg-background border border-border text-foreground py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            value={jugadorId || ""}
                                            onChange={(e) => handlePlayerSelect(e.target.value)}
                                        >
                                            <option value="" disabled>-- Selecciona tu nombre --</option>
                                            {players.map(p => (
                                                <option key={p.id} value={p.id}>{p.dorsal} - {p.nombre}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold mb-6 text-foreground">¿Vas a asistir al partido?</h3>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                                    <button
                                        onClick={() => handleRSVP(true)}
                                        disabled={!jugadorId || loadingRSVP}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${asistencia === true ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(20,184,106,0.4)] ring-2 ring-emerald-500 ring-offset-2 ring-offset-background scale-105' : 'bg-secondary hover:bg-emerald-500/10 hover:text-emerald-500 border border-transparent hover:border-emerald-500/30'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <CheckCircle2 className="h-6 w-6" />
                                        Asistiré
                                    </button>

                                    <button
                                        onClick={() => handleRSVP(false)}
                                        disabled={!jugadorId || loadingRSVP}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${asistencia === false ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] ring-2 ring-red-500 ring-offset-2 ring-offset-background scale-105' : 'bg-secondary hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/30'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <XCircle className="h-6 w-6" />
                                        No iré
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card/40 backdrop-blur-md border-2 border-border border-dashed hover:border-primary/50 transition-all duration-300 rounded-3xl p-12 text-center shadow-inner group">
                        <span className="text-6xl opacity-70 mb-6 block drop-shadow-md cursor-default group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">🏝️</span>
                        <h3 className="text-2xl font-bold text-foreground drop-shadow-sm">No hay próximos partidos</h3>
                        <p className="text-muted-foreground mt-3 text-lg font-medium">El calendario está libre por ahora. Disfruta del merecido descanso.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
