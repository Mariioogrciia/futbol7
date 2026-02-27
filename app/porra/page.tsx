'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Trophy, Clock, CheckCircle2, AlertCircle, Skull, Zap } from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Partido {
    id: string;
    equipo_id: string;
    rival: string;
    fecha: string;
    estado: string;
}

interface Jugador {
    id: string;
    nombre: string;
}

interface UserPrediction {
    id: string;
    partido_id: string;
    goles_local: number;
    goles_visitante: number;
    primer_goleador_id?: string;
    puntos: number;
}

interface LeaderboardUser {
    id: string;
    nombre: string;
    puntos: number;
}

export default function OraculoPage() {
    const [partido, setPartido] = useState<Partido | null>(null);
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [myPrediction, setMyPrediction] = useState<UserPrediction | null>(null);

    // Form State
    const [golesLocal, setGolesLocal] = useState<number | ''>('');
    const [golesVisitante, setGolesVisitante] = useState<number | ''>('');
    const [primerGoleador, setPrimerGoleador] = useState<string>('');

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [session, setSession] = useState<any>(null);

    // Swipe Card State
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const x = useMotionValue(0);
    const backgroundColors = useTransform(
        x,
        [-200, 0, 200],
        ['rgba(220, 38, 38, 0.4)', 'rgba(2, 6, 23, 1)', 'rgba(5, 150, 105, 0.4)'] // Red for Rival, Dark Slate for center, Green for Impersed
    );
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacityRight = useTransform(x, [0, 100], [0, 1]);
    const opacityLeft = useTransform(x, [0, -100], [0, 1]);
    const opacityCenter = useTransform(x, [-50, 0, 50], [0, 1, 0]);

    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);

            // Fetch upcoming match
            const { data: proximoPartido } = await supabase
                .from('partidos')
                .select('*')
                .eq('estado', 'programado')
                .order('fecha', { ascending: true })
                .limit(1)
                .single();

            if (proximoPartido) {
                setPartido(proximoPartido);
            }

            // Fetch players for the goalscorer dropdown
            const { data: playersList } = await supabase
                .from('jugadores')
                .select('id, nombre')
                .order('nombre', { ascending: true });

            if (playersList) {
                setJugadores(playersList);
            }

            // Fetch Leaderboard
            const numRanking = await fetch('/api/porra/leaderboard');
            const rankData = await numRanking.json();
            if (rankData.success) {
                setLeaderboard(rankData.ranking);
            }

            // If logged in, fetch my prediction
            if (currentSession && proximoPartido) {
                const { data: predictions } = await supabase
                    .from('predicciones')
                    .select('*')
                    .eq('usuario_id', currentSession.user.id)
                    .eq('partido_id', proximoPartido.id)
                    .single();

                if (predictions) {
                    setMyPrediction(predictions);
                    setGolesLocal(predictions.goles_local);
                    setGolesVisitante(predictions.goles_visitante);
                    setPrimerGoleador(predictions.primer_goleador_id || '');
                }
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            setMessage({ text: 'Debes iniciar sesión para participar.', type: 'error' });
            return;
        }
        if (!partido) return;

        if (golesLocal === '' || golesVisitante === '') {
            setMessage({ text: 'Por favor, introduce tu predicción de goles.', type: 'error' });
            return;
        }

        try {
            setSubmitLoading(true);
            setMessage({ text: '', type: '' });

            const res = await fetch('/api/porra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    partido_id: partido.id,
                    goles_local: Number(golesLocal),
                    goles_visitante: Number(golesVisitante),
                    primer_goleador_id: primerGoleador || undefined
                })
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ text: '¡Predicción guardada correctamente!', type: 'success' });
                // Update local state
                setMyPrediction({
                    id: myPrediction?.id || 'new',
                    partido_id: partido.id,
                    goles_local: Number(golesLocal),
                    goles_visitante: Number(golesVisitante),
                    primer_goleador_id: primerGoleador,
                    puntos: myPrediction?.puntos || 0
                });
            } else {
                setMessage({ text: data.error || 'Error al guardar.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Error de conexión', type: 'error' });
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <motion.main
            style={{ backgroundColor: backgroundColors }}
            className="min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-200"
        >
            <Header />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-24 lg:px-8 space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center gap-3 font-mono">
                        <Trophy className="h-12 w-12 text-fuchsia-500" />
                        El Oráculo del Vestuario
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                        ¿Cuántos goles nos van a caer hoy? Desliza, elige el resultado y demuestra tu nivel de Hooligan.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12 items-center max-w-2xl mx-auto">

                        {/* Predicción Actual - Swipeable Card */}
                        <div className="w-full">
                            {partido ? (
                                <form onSubmit={handlePredict} className="space-y-8 flex flex-col items-center">
                                    <div className="relative w-full h-64 md:h-80 flex items-center justify-center">
                                        <motion.div
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            style={{ x, rotate }}
                                            dragSnapToOrigin={true}
                                            dragElastic={0.2}
                                            onDragEnd={(_, info) => {
                                                if (info.offset.x > 100) {
                                                    setSwipeDirection('right');
                                                    setGolesLocal((prev) => Number(prev || 0) + 1);
                                                    if (golesVisitante === '') setGolesVisitante(0);
                                                }
                                                else if (info.offset.x < -100) {
                                                    setSwipeDirection('left');
                                                    setGolesVisitante((prev) => Number(prev || 0) + 1);
                                                    if (golesLocal === '') setGolesLocal(0);
                                                }
                                            }}
                                            whileTap={{ cursor: 'grabbing' }}
                                            className="absolute w-full h-full bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 cursor-grab"
                                        >
                                            <div className="flex items-center justify-between w-full opacity-90">
                                                <div className="text-center flex-1">
                                                    <span className="font-black text-2xl block text-white uppercase tracking-wider font-mono drop-shadow-[0_0_8px_rgba(5,150,105,0.8)]">Impersed FC</span>
                                                </div>
                                                <span className="font-black text-3xl italic text-slate-500 px-4">VS</span>
                                                <div className="text-center flex-1">
                                                    <span className="font-black text-2xl block text-white uppercase tracking-wider font-mono drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">{partido.rival}</span>
                                                </div>
                                            </div>

                                            {/* Flash text based on drag */}
                                            <div className="mt-8 text-center min-h-[4rem] flex flex-col items-center justify-center">
                                                <motion.div style={{ opacity: opacityRight }} className="absolute text-emerald-400 font-extrabold text-3xl uppercase italic tracking-widest drop-shadow-[0_0_10px_rgba(5,150,105,1)]">
                                                    ¡Fiel a la causa!
                                                </motion.div>
                                                <motion.div style={{ opacity: opacityLeft }} className="absolute text-red-500 font-extrabold text-3xl uppercase italic tracking-widest drop-shadow-[0_0_10px_rgba(220,38,38,1)]">
                                                    ¡Traidor!
                                                </motion.div>
                                                <motion.div style={{ opacity: opacityCenter }} className="text-slate-400 font-medium text-sm flex items-center gap-2">
                                                    <span className="animate-pulse">👈 Desliza para dictar sentencia 👉</span>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Scrolling Wheels for Score */}
                                    <div className="w-full bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold uppercase italic text-fuchsia-400 mb-6 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">¿Cuál será el resultado exacto?</h3>
                                        </div>

                                        <div className="flex justify-center items-center gap-8">
                                            {/* Local Goal Safe Dial */}
                                            <div className="flex flex-col items-center bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                                                <span className="text-xs font-bold text-slate-500 mb-2 uppercase">Impersed</span>
                                                <button type="button" onClick={() => setGolesLocal((prev) => Math.max(0, Number(prev) + 1))} className="text-emerald-500 hover:text-emerald-400 font-black text-xl p-2 cursor-pointer transition-transform active:scale-95">▲</button>
                                                <div className="text-5xl font-black font-mono text-white py-2 w-16 text-center">{golesLocal === '' ? '0' : golesLocal}</div>
                                                <button type="button" onClick={() => setGolesLocal((prev) => Math.max(0, Number(prev) - 1))} className="text-emerald-500 hover:text-emerald-400 font-black text-xl p-2 cursor-pointer transition-transform active:scale-95">▼</button>
                                            </div>

                                            <span className="text-3xl font-black text-slate-600">-</span>

                                            {/* Rival Goal Safe Dial */}
                                            <div className="flex flex-col items-center bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                                                <span className="text-xs font-bold text-slate-500 mb-2 uppercase">Rival</span>
                                                <button type="button" onClick={() => setGolesVisitante((prev) => Math.max(0, Number(prev) + 1))} className="text-red-500 hover:text-red-400 font-black text-xl p-2 cursor-pointer transition-transform active:scale-95">▲</button>
                                                <div className="text-5xl font-black font-mono text-white py-2 w-16 text-center">{golesVisitante === '' ? '0' : golesVisitante}</div>
                                                <button type="button" onClick={() => setGolesVisitante((prev) => Math.max(0, Number(prev) - 1))} className="text-red-500 hover:text-red-400 font-black text-xl p-2 cursor-pointer transition-transform active:scale-95">▼</button>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-800/50">
                                            <label className="block text-center text-sm font-bold uppercase italic text-fuchsia-400 mb-3">Primer Goleador (Opcional)</label>
                                            <select
                                                value={primerGoleador}
                                                onChange={(e) => setPrimerGoleador(e.target.value)}
                                                className="w-full p-4 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-shadow text-center font-bold"
                                            >
                                                <option value="">🔮 Selecciona a tu protegido</option>
                                                {jugadores.map((j) => (
                                                    <option key={j.id} value={j.id}>{j.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {message.text && (
                                        <div className={`w-full p-4 rounded-xl flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            <span className="font-bold text-sm tracking-wide">{message.text}</span>
                                        </div>
                                    )}

                                    {!session ? (
                                        <button type="button" onClick={() => window.scrollTo(0, 0)} className="w-full bg-slate-800 text-slate-300 font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-slate-700 transition-colors border-2 border-slate-700">
                                            Inicia Sesión para Sellar Tu Destino
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={submitLoading || (golesLocal === '' && golesVisitante === '')}
                                            className="w-full bg-fuchsia-600 text-white font-black uppercase italic tracking-widest text-lg py-5 rounded-2xl hover:bg-fuchsia-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] relative overflow-hidden"
                                        >
                                            {submitLoading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    <span>Invocando a los astros...</span>
                                                </div>
                                            ) : (myPrediction ? 'Modificar Profecía' : 'Sellar Predicción')}
                                        </button>
                                    )}

                                </form>
                            ) : (
                                <div className="text-center p-12 bg-slate-900 rounded-3xl border border-slate-800">
                                    <Skull className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-wider">La bola de cristal está nublada.<br />No hay partidos próximos.</p>
                                </div>
                            )}
                        </div>

                        {/* RPG Ranking */}
                        <div className="w-full mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                            <h2 className="text-3xl font-black italic uppercase text-white mb-8 flex items-center justify-center gap-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] tracking-tight">
                                <Zap className="w-8 h-8 text-yellow-400" />
                                Nivel de Hooligan
                            </h2>

                            <div className="relative z-10">
                                {leaderboard.length > 0 ? (
                                    <ul className="space-y-6">
                                        {leaderboard.map((user, index) => {
                                            // Determine Title based on points
                                            let title = "Pitiso de banquillo";
                                            let rankColor = "text-slate-500";
                                            let barColor = "bg-slate-600";
                                            const pts = user.puntos;

                                            // HP Bar Max (Estimate something reasonable like 50pts for a full bar)
                                            const hpPercentage = Math.min((pts / 30) * 100, 100);

                                            if (pts >= 25) { title = "Nostradamus"; rankColor = "text-fuchsia-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]"; barColor = "bg-fuchsia-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"; }
                                            else if (pts >= 15) { title = "Mourinho de Barrio"; rankColor = "text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]"; barColor = "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"; }
                                            else if (pts >= 8) { title = "Experto de Bar"; rankColor = "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"; barColor = "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"; }
                                            else if (pts > 0) { title = "Utillero"; rankColor = "text-sky-400"; barColor = "bg-sky-400"; }

                                            return (
                                                <li key={user.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 transform transition-transform hover:scale-[1.02]">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm bg-slate-800 text-slate-300 border ${index === 0 ? 'border-yellow-400 text-yellow-400' : 'border-slate-700'}`}>
                                                                {index + 1}
                                                            </span>
                                                            <div>
                                                                <span className="font-bold text-white block">{user.nombre}</span>
                                                                <span className={`text-xs font-black italic tracking-widest uppercase ${rankColor}`}>
                                                                    Lvl. {Math.floor(pts / 5) + 1} - {title}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-black text-white font-mono">{user.puntos}</span>
                                                            <span className="text-[10px] uppercase font-bold text-slate-500 block -mt-1 tracking-widest">Cred</span>
                                                        </div>
                                                    </div>

                                                    {/* HP Bar */}
                                                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${hpPercentage}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={`h-full rounded-full ${barColor}`}
                                                        />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="text-center p-12">
                                        <Skull className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold uppercase tracking-wider">El salón de la fama está vacío.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            <Footer />
        </motion.main>
    );
}
