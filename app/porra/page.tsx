'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, HelpCircle, Trophy, Trash2, CheckCircle2, AlertCircle, PlayCircle, BarChart3, Star, Zap, User, Target, Medal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// --- INTERFACES ---
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
    goles?: number;
}

interface BetOption {
    id: string;
    label: string;
    odd: number;
}

interface BetMarket {
    id: string;
    title: string;
    icon: React.ReactNode;
    options: BetOption[];
}

// --- INTERFACES ---
interface BetSelection {
    id: string; // The specific option ID
    marketId: string;
    marketTitle: string;
    label: string;
    odd: number;
    amount: number;
}

export default function ImpersedBetPage() {
    const [balance, setBalance] = useState<number>(0);
    const [balanceChanged, setBalanceChanged] = useState(false); // For animation

    // DB States
    const [partido, setPartido] = useState<Partido | null>(null);
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [session, setSession] = useState<any>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // Bet Slip State
    const [betSlip, setBetSlip] = useState<BetSelection[]>([]);

    // UI State
    const [isMobileSlipOpen, setIsMobileSlipOpen] = useState(false);
    const [successAnim, setSuccessAnim] = useState(false);
    const [loading, setLoading] = useState(false);

    // New UI States
    const [activeTab, setActiveTab] = useState<'marcadores' | 'eventos' | 'goleadores' | 'carnicero' | 'canallas' | 'ranking'>('marcadores');
    const [ranking, setRanking] = useState<{ id: string, nombre: string, puntos: number }[]>([]);
    const [exactScoreLocal, setExactScoreLocal] = useState(0);
    const [exactScoreAway, setExactScoreAway] = useState(0);

    // Compute exact score odd
    const getExactScoreOdd = (local: number, away: number) => {
        const totalGoals = local + away;
        const diff = Math.abs(local - away);

        let odd = 0;
        if (totalGoals === 0) {
            odd = 12.00; // 0-0 is usually tough in 7v7 matches
        } else {
            // Base difficulty based on total goals. High scoring games are exponentially hotter odds
            odd = 5.00 + Math.pow(totalGoals, 1.8);

            // Draw multiplier
            if (local === away) odd *= 1.5;
            // High difference multiplier
            if (diff >= 4) odd *= 1.3;
        }

        return Math.min(Math.max(odd, 5.0), 500.0); // Clamp between 5.00 and 500.00
    };

    const addExactScoreToSlip = () => {
        if (!session) {
            toast.error("Debes iniciar sesión para añadir pronósticos al boleto.");
            return;
        }

        const odd = getExactScoreOdd(exactScoreLocal, exactScoreAway);
        const labelStr = `Resultado: ${exactScoreLocal} - ${exactScoreAway}`;
        const idStr = `exact_score_${exactScoreLocal}_${exactScoreAway}`;

        const marketInfo = { id: 'exact_score', title: 'Marcador Exacto', icon: null, options: [] };
        const optionInfo = { id: idStr, label: labelStr, odd: odd };

        // Use standard toggle function
        toggleSelection(marketInfo, optionInfo);
    };

    // Fetch DB Data
    useEffect(() => {
        async function loadData() {
            try {
                // 1. Session & Points
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);

                if (currentSession) {
                    // Fetch user points from `usuarios.saldo_cubiertaspoints`
                    const { data: perfil } = await supabase
                        .from('usuarios')
                        .select('saldo_cubiertaspoints')
                        .eq('id', currentSession.user.id)
                        .single();

                    if (perfil) {
                        setBalance(perfil.saldo_cubiertaspoints || 0);
                    } else {
                        setBalance(1000); // Starter balance fallback
                    }
                }

                // 2. Next Match
                const { data: proximoPartido } = await supabase
                    .from('partidos')
                    .select('*')
                    .eq('estado', 'programado')
                    .order('fecha', { ascending: true })
                    .limit(1)
                    .single();

                if (proximoPartido) setPartido(proximoPartido);

                // 3. Players
                const { data: playersList } = await supabase
                    .from('jugadores')
                    .select('id, nombre, goles')
                    .order('nombre', { ascending: true });

                if (playersList) setJugadores(playersList);

                // 4. Leaderboard
                try {
                    const rankRes = await fetch('/api/porra/leaderboard');
                    if (rankRes.ok) {
                        const rankData = await rankRes.json();
                        setRanking(rankData.ranking || []);
                    }
                } catch (e) {
                    console.error("Error fetching leaderboard", e);
                }

            } catch (err) {
                console.error("Error cargando datos de DB:", err);
            } finally {
                setInitialLoading(false);
            }
        }
        loadData();
    }, []);

    // Derived states
    const totalWagered = betSlip.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalPotentialWin = betSlip.reduce((acc, curr) => acc + ((curr.amount || 0) * curr.odd), 0);

    const topPlayers = [...jugadores].sort((a, b) => (b.goles || 0) - (a.goles || 0));
    const p1 = topPlayers[0]?.nombre || 'Carlos';
    const p2 = topPlayers[1]?.nombre || 'Juanjo';
    const p3 = topPlayers[2]?.nombre || 'El Capi';

    const goalscorerOptions = jugadores
        .map(j => {
            const goles = j.goles || 0;
            const odd = (15 / (goles + 1)) + 1.20;
            return {
                id: `gs_${j.id}`,
                label: j.nombre + ' marca gol',
                odd: odd
            };
        })
        .sort((a, b) => a.odd - b.odd)
        .concat([
            { id: 'gs_p1_dob', label: `${p1} marca Doblete`, odd: 3.20 },
            { id: 'gs_p2_gol', label: `Gol de ${p2}`, odd: 2.10 },
            { id: 'gs_p3_gol', label: `Gol de ${p3}`, odd: 4.00 },
            { id: 'gs_falta', label: 'Gol de falta directa', odd: 8.00 },
            { id: 'gs_cabeza', label: 'Gol de cabeza', odd: 5.00 },
            { id: 'gs_fuera', label: 'Gol desde fuera del área', odd: 3.50 },
            { id: 'gs_pen_favor', label: 'Penalti a favor nuestro', odd: 3.00 },
            { id: 'gs_pen_marca', label: 'Marcamos el penalti a favor', odd: 1.40 },
            { id: 'gs_pen_falla', label: 'Fallamos el penalti a favor (A las nubes)', odd: 5.00 },
            { id: 'gs_propia', label: 'Gol en propia puerta (De cualquier equipo)', odd: 12.00 },
            { id: 'gs_hat', label: 'Un jugador nuestro marca un Hat-Trick', odd: 9.00 },
            { id: 'gs_cantada', label: 'El portero rival hace la cantada del siglo', odd: 4.50 }
        ]);

    const goalscorerMarkets: BetMarket[] = [
        {
            id: 'goalscorers',
            title: 'Goles y Jugadas (El Espectáculo)',
            icon: <Zap className="w-5 h-5 text-emerald-500" />,
            options: goalscorerOptions
        }
    ];

    // Static Extended Markets
    const eventsMarkets: BetMarket[] = [
        {
            id: 'events',
            title: 'Marcador y Desarrollo',
            icon: <Trophy className="w-5 h-5 text-emerald-500" />,
            options: [
                { id: 'ev_1_half', label: 'Impersed FC marca en la 1ª Parte', odd: 1.40 },
                { id: 'ev_2_half', label: 'Impersed FC marca en la 2ª Parte', odd: 1.30 },
                { id: 'ev_ht_win', label: 'Nos vamos ganando al descanso', odd: 2.20 },
                { id: 'ev_draw', label: 'El partido termina en Empate', odd: 3.50 },
                { id: 'ev_o35', label: 'Más de 3.5 goles en total (Ambos equipos)', odd: 1.50 },
                { id: 'ev_o55', label: 'Más de 5.5 goles en total', odd: 1.85 },
                { id: 'ev_o85', label: 'Más de 8.5 goles en total (Partido loco)', odd: 3.00 },
                { id: 'ev_cs', label: 'Dejamos la portería a cero (Clean Sheet)', odd: 4.50 },
                { id: 'ev_4g', label: 'Marcamos 4 goles o más', odd: 2.80 },
                { id: 'ev_remontada', label: 'Remontada épica (Empezamos perdiendo y ganamos)', odd: 7.00 },
            ]
        }
    ];

    const disciplinaryMarkets: BetMarket[] = [
        {
            id: 'disciplinary',
            title: 'Disciplina y Broncas (El Modo Hooligan)',
            icon: <AlertCircle className="w-5 h-5 text-emerald-500" />,
            options: [
                { id: 'ds_amarilla_im', label: 'Tarjeta amarilla para alguien de Impersed FC', odd: 1.10 },
                { id: 'ds_amarilla_pro', label: 'Tarjeta amarilla por hablar/protestar al árbitro', odd: 1.30 },
                { id: 'ds_mas_do', label: 'Nos llevamos más de 2 tarjetas amarillas', odd: 1.90 },
                { id: 'ds_roja_im', label: 'Roja directa a un jugador nuestro', odd: 15.00 },
                { id: 'ds_roja_ri', label: 'Roja a un jugador del equipo rival', odd: 10.00 },
                { id: 'ds_pelotazo', label: 'Alguien pega un pelotazo fuera de las instalaciones', odd: 1.50 },
                { id: 'ds_disc', label: 'Discusión intensa entre nuestros propios jugadores', odd: 2.50 },
                { id: 'ds_suspender', label: 'El árbitro amenaza con suspender el partido', odd: 8.00 },
            ]
        }
    ];

    const specialMarkets: BetMarket[] = [
        {
            id: 'special',
            title: 'El Vestuario y Leyendas Urbanas (Apuestas Canallas)',
            icon: <Star className="w-5 h-5 text-emerald-500" />,
            options: [
                { id: 'sp_tarde', label: 'Alguien llega tarde al calentamiento', odd: 1.20 },
                { id: 'sp_fiesta', label: 'Alguien confiesa que ha salido de fiesta el día anterior', odd: 1.15 },
                { id: 'sp_dni', label: 'Alguien se olvida de traer el DNI o el pago de la ficha', odd: 3.00 },
                { id: 'sp_sin_cambios', label: 'Jugamos sin cambios en el banquillo (Plantilla justa)', odd: 4.00 },
                { id: 'sp_lesion15', label: 'Lesión en los primeros 15 minutos (El calentamiento mal hecho)', odd: 6.00 },
                { id: 'sp_ahogado', label: 'Alguien pide el cambio por falta de aire (Ahogado)', odd: 1.40 },
                { id: 'sp_voz', label: 'El entrenador/Capi pierde la voz gritando', odd: 1.80 },
                { id: 'sp_cervezas', label: 'Nos invitan a la primera ronda de cervezas post-partido', odd: 2.00 },
            ]
        }
    ];

    // --- HANDLERS ---

    const toggleSelection = (market: BetMarket, option: BetOption) => {
        if (!session) {
            toast.error("Debes iniciar sesión para añadir pronósticos al boleto.");
            return;
        }

        setBetSlip(prev => {
            const exists = prev.find(item => item.id === option.id);
            if (exists) {
                // Remove
                return prev.filter(item => item.id !== option.id);
            } else {
                // Add new with default amount 0
                return [...prev, {
                    id: option.id,
                    marketId: market.id,
                    marketTitle: market.title,
                    label: option.label,
                    odd: option.odd,
                    amount: '' as unknown as number // Default empty input
                }];
            }
        });

        // Auto-open mobile slip if we added an item
        if (!betSlip.find(item => item.id === option.id)) {
            setIsMobileSlipOpen(true);
        }
    };

    const isSelected = (optionId: string) => betSlip.some(item => item.id === optionId);

    const updateBetAmount = (optionId: string, amountStr: string) => {
        let amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 0) amount = '' as unknown as number; // Allow clearing field

        setBetSlip(prev => prev.map(item =>
            item.id === optionId ? { ...item, amount } : item
        ));
    };

    const removeSelection = (optionId: string) => {
        setBetSlip(prev => prev.filter(item => item.id !== optionId));
    };

    const placeBet = async () => {
        if (betSlip.length === 0) return;

        // Find if any bet has no amount or amount > current balance
        const emptyBets = betSlip.some(b => !b.amount || b.amount <= 0);
        if (emptyBets) {
            toast.error("Por favor, introduce una cantidad en todas tus selecciones.");
            return;
        }

        if (totalWagered > balance) {
            toast.error("Fondos insuficientes. Recarga tus CubiertasPoints.");
            return;
        }

        if (!session) {
            toast.error("Debes iniciar sesión para apostar.");
            return;
        }

        if (!partido) {
            toast.error("No hay partido disponible para apostar.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/apuestas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    partido_id: partido.id,
                    apuestas: betSlip,
                    total_wagered: totalWagered
                })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Error al procesar la apuesta");
                setLoading(false);
                return;
            }

            // Success! Update balance and show animation
            setBalance(data.newBalance);

            setBalanceChanged(true);
            setTimeout(() => setBalanceChanged(false), 500); // Red flash

            setSuccessAnim(true);
            setTimeout(() => setSuccessAnim(false), 3000); // Success overlay

            setBetSlip([]);
            if (window.innerWidth < 1024) setIsMobileSlipOpen(false);

            toast.success("¡Apuesta registrada exitosamente!");
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión al servidor.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderOddButton = (market: BetMarket, option: BetOption) => {
        const selected = isSelected(option.id);

        return (
            <button
                key={option.id}
                onClick={() => toggleSelection(market, option)}
                className={`
                    flex items-center justify-between px-5 py-3 rounded-full transition-all duration-300 border w-full
                    ${selected
                        ? 'bg-emerald-500 border-emerald-500 text-white dark:text-zinc-950 font-bold shadow-[0_4px_15px_rgba(16,185,129,0.4)] transform scale-[1.02]'
                        : 'bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:border-emerald-500/50 hover:text-slate-900 dark:hover:text-white'
                    }
                `}
            >
                <span className="text-sm truncate mr-4 text-left font-medium">{option.label}</span>
                <span className={`text-sm md:text-base ml-2 whitespace-nowrap ${selected ? 'text-white dark:text-zinc-950 font-black' : 'text-emerald-500 dark:text-emerald-400 font-bold'}`}>
                    {option.odd.toFixed(2)}
                </span>
            </button>
        );
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
            {/* Header / Nav simulation (could replace with your actual <Header />, but adding custom balance badge) */}
            <Header />

            {/* Custom Topbar just below Header for Betting specific info */}
            <div className="w-full bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-[64px] lg:top-[72px] z-40 transition-all">
                <div className="max-w-[1440px] w-full mx-auto px-4 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-md">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h1 className="font-bold text-lg md:text-xl tracking-tight hidden sm:block">
                            <span className="text-zinc-100">Impersed</span>
                            <span className="text-emerald-500">BET</span>
                        </h1>
                    </div>

                    {/* Balance Badge */}
                    <motion.div
                        animate={balanceChanged ? { scale: [1, 1.1, 1], color: ['#fff', '#ef4444', '#fff'] } : {}}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-lg transition-colors"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-xs font-black shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                            СР
                        </div>
                        <span className="font-mono font-bold tracking-wider">{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </motion.div>

                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row relative">

                {/* --- LEFT DESKTOP / MAIN VIEW --- */}
                <div className="flex-1 w-full lg:w-[70%] p-4 md:p-6 pb-32 lg:pb-12 space-y-6">

                    {initialLoading ? (
                        <div className="w-full h-48 md:h-64 rounded-xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl dark:shadow-2xl transition-colors">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                            <p className="mt-4 text-zinc-500">Consultando al Oráculo...</p>
                        </div>
                    ) : partido ? (
                        <div className="w-full min-h-[12rem] md:h-64 rounded-xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl dark:shadow-2xl transition-colors py-8 md:py-0">
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                            <div className="relative z-10 text-center w-full px-2 sm:px-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Próxima Batalla
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-12 w-full">
                                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] text-center break-words max-w-full">
                                        Impersed FC
                                    </h2>
                                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-400 dark:text-zinc-600 italic">VS</span>
                                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-700 dark:text-zinc-300 text-center break-words max-w-full">
                                        {partido.rival}
                                    </h2>
                                </div>
                                <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-500 dark:text-zinc-500 font-medium">
                                    {new Date(partido.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full min-h-[12rem] md:h-64 rounded-xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl dark:shadow-2xl transition-colors py-8 md:py-0">
                            <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
                                <HelpCircle className="w-8 h-8 text-zinc-500" />
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No hay partidos próximos</p>
                        </div>
                    )}

                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {[
                            { id: 'marcadores', label: 'Marcadores', icon: <Trophy className="w-4 h-4" /> },
                            { id: 'eventos', label: 'Eventos', icon: <Zap className="w-4 h-4" /> },
                            { id: 'goleadores', label: 'Goleadores', icon: <User className="w-4 h-4" /> },
                            { id: 'carnicero', label: 'El Carnicero', icon: <AlertCircle className="w-4 h-4" /> },
                            { id: 'canallas', label: 'Canalladas', icon: <Star className="w-4 h-4" /> },
                            { id: 'ranking', label: 'Ranking', icon: <Medal className="w-4 h-4" /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-emerald-500 text-white dark:text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                        : 'bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-zinc-200 dark:hover:border-zinc-700'}
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Markets List based on Active Tab */}
                    <div className="space-y-4">
                        {/* Custom exact score component for 'marcadores' tab */}
                        {activeTab === 'marcadores' && (
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden p-6 relative transition-colors shadow-sm dark:shadow-none">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-colors"></div>
                                <h3 className="font-bold text-xl text-slate-900 dark:text-zinc-100 mb-6 flex items-center gap-2 transition-colors">
                                    <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                    Crea tu Marcador Exacto
                                </h3>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex-1 w-full bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center transition-colors">
                                        <span className="font-bold text-slate-800 dark:text-zinc-300 mb-3 truncate max-w-full">{partido ? "Impersed FC" : "Local"}</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setExactScoreLocal(Math.max(0, exactScoreLocal - 1))} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-700 text-xl font-bold transition-colors">-</button>
                                            <span className="text-3xl font-black min-w-[32px] text-center text-slate-900 dark:text-white">{exactScoreLocal}</span>
                                            <button onClick={() => setExactScoreLocal(exactScoreLocal + 1)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-700 text-xl font-bold transition-colors">+</button>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-black text-slate-400 dark:text-zinc-700">VS</span>
                                    <div className="flex-1 w-full bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center transition-colors">
                                        <span className="font-bold text-slate-800 dark:text-zinc-300 mb-3 truncate max-w-full">{partido ? partido.rival : 'Rival'}</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setExactScoreAway(Math.max(0, exactScoreAway - 1))} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-700 text-xl font-bold transition-colors">-</button>
                                            <span className="text-3xl font-black min-w-[32px] text-center text-slate-900 dark:text-white">{exactScoreAway}</span>
                                            <button onClick={() => setExactScoreAway(exactScoreAway + 1)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-700 text-xl font-bold transition-colors">+</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                                    <div className="text-center sm:text-left">
                                        <span className="block text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-1">Cuota Estimada</span>
                                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                                            x{getExactScoreOdd(exactScoreLocal, exactScoreAway).toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={addExactScoreToSlip}
                                        className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-zinc-950 font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        Añadir al Boleto
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Standard Markets rendered according to tab */}
                        {(() => {
                            if (activeTab === 'ranking') {
                                return (
                                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden p-6 max-h-[800px] overflow-y-auto custom-scrollbar transition-colors">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800 transition-colors">
                                            <Medal className="w-6 h-6 text-emerald-500" />
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Top Apostadores</h3>
                                        </div>
                                        {ranking.length === 0 ? (
                                            <p className="text-slate-500 dark:text-zinc-500 text-center py-8">No hay hooligans en el ranking todavía.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {ranking.map((user, index) => (
                                                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950/50 rounded-lg border border-slate-200 dark:border-zinc-800/50 transition-all hover:bg-slate-100 dark:hover:bg-zinc-800">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${index === 0 ? 'bg-yellow-500 text-zinc-900' : index === 1 ? 'bg-zinc-300 text-zinc-900' : index === 2 ? 'bg-amber-700 text-zinc-100' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}>
                                                                {index + 1}
                                                            </div>
                                                            <span className="font-bold text-slate-800 dark:text-zinc-200">{user.nombre}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-emerald-600 dark:text-emerald-500 font-bold">{user.puntos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                            <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">CP</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            let marketsToDisplay: BetMarket[] = [];
                            switch (activeTab) {
                                case 'marcadores':
                                    marketsToDisplay = [];
                                    break;
                                case 'eventos':
                                    marketsToDisplay = eventsMarkets;
                                    break;
                                case 'goleadores':
                                    marketsToDisplay = goalscorerMarkets;
                                    break;
                                case 'carnicero':
                                    marketsToDisplay = disciplinaryMarkets;
                                    break;
                                case 'canallas':
                                    marketsToDisplay = specialMarkets;
                                    break;
                            }

                            return marketsToDisplay.map(market => (
                                <div key={market.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
                                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 transition-colors">
                                        {market.icon}
                                        <h3 className="font-bold text-slate-800 dark:text-zinc-200">{market.title}</h3>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 dark:bg-zinc-950/50 transition-colors">
                                        {market.options.map(option => renderOddButton(market, option))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>

                </div>

                {/* --- RIGHT DESKTOP / BET SLIP SIDEBAR --- */}
                <div className="hidden lg:block w-[30%] min-w-[320px] max-w-[400px] border-l border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-6 flex flex-col h-[calc(100vh-136px)] sticky top-[136px] transition-colors">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800 transition-colors">
                        <div className="relative">
                            <PlayCircle className="w-6 h-6 text-emerald-500" />
                            {betSlip.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-emerald-500 text-zinc-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {betSlip.length}
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold">Boleto de Apuesta</h2>
                        {betSlip.length > 0 && (
                            <button onClick={() => setBetSlip([])} className="ml-auto text-xs text-zinc-500 hover:text-red-400 transition-colors">
                                Limpiar todo
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-6 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {betSlip.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 space-y-4 opacity-50"
                                >
                                    <Coins className="w-12 h-12 stroke-1" />
                                    <p className="text-center font-medium">El boleto está vacío.<br />Haz clic en una cuota para añadir una selección.</p>
                                </motion.div>
                            ) : (
                                betSlip.map(bet => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        key={bet.id}
                                        className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 group relative transition-colors shadow-sm dark:shadow-none"
                                    >
                                        <button
                                            onClick={() => removeSelection(bet.id)}
                                            className="absolute top-3 right-3 text-slate-400 dark:text-zinc-600 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium mb-1 truncate pr-6">{bet.marketTitle}</p>
                                        <div className="flex items-end justify-between mb-3">
                                            <p className="font-bold text-slate-800 dark:text-zinc-200">{bet.label}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs">CP</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={bet.amount === ('' as unknown as number) ? '' : bet.amount}
                                                    onChange={e => updateBetAmount(bet.id, e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-md py-2 pl-9 pr-3 text-sm font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                                                />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Cuota</span>
                                                <span className="font-black text-emerald-600 dark:text-emerald-400">{bet.odd.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Summary Footer */}
                    <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-4 transition-colors">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-zinc-500">Apuesta Total</span>
                            <span className="font-bold font-mono text-slate-800 dark:text-zinc-200">{totalWagered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {totalWagered > 0 && 'CP'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-zinc-500">Ganancia Potencial</span>
                            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{totalPotentialWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {totalPotentialWin > 0 && 'CP'}</span>
                        </div>

                        <button
                            disabled={betSlip.length === 0 || loading}
                            onClick={placeBet}
                            className={`
                                w-full py-4 rounded-xl font-bold uppercase tracking-wider relative overflow-hidden transition-all duration-300
                                ${betSlip.length === 0
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5'
                                }
                            `}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                                    Confirmando...
                                </div>
                            ) : (
                                "Realizar Apuesta"
                            )}
                        </button>
                    </div>
                </div>

            </div>

            {/* --- MOBILE BET SLIP TOGGLE & DRAWER --- */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
                {/* Drawer */}
                <AnimatePresence>
                    {isMobileSlipOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsMobileSlipOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            />
                            <motion.div
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute bottom-16 left-0 right-0 h-[70vh] bg-zinc-900 rounded-t-2xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-zinc-800"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                    <h3 className="font-bold">Boleto de Apuesta ({betSlip.length})</h3>
                                    {betSlip.length > 0 && (
                                        <button onClick={() => setBetSlip([])} className="text-xs text-red-500">Limpiar</button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {betSlip.length === 0 ? (
                                        <p className="text-center text-zinc-500 mt-10 text-sm">Boleto vacío</p>
                                    ) : (
                                        betSlip.map(bet => (
                                            <div key={bet.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 relative">
                                                <button onClick={() => removeSelection(bet.id)} className="absolute top-2 right-2 text-zinc-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <p className="text-[10px] text-zinc-500 mb-1">{bet.marketTitle}</p>
                                                <p className="font-bold text-sm text-zinc-200 mb-2">{bet.label}</p>
                                                <div className="flex gap-2 items-center">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs">CP</span>
                                                        <input
                                                            type="number" min="0" value={bet.amount === ('' as unknown as number) ? '' : bet.amount} onChange={e => updateBetAmount(bet.id, e.target.value)} placeholder="0"
                                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-1.5 pl-8 pr-2 text-sm font-bold focus:border-emerald-500 outline-none"
                                                        />
                                                    </div>
                                                    <span className="font-black text-emerald-400 text-sm">{bet.odd.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                                    <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                                        <span>Apuesta Total</span><span>{totalWagered.toFixed(2)} CP</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-emerald-400 font-bold mb-3">
                                        <span>Ganancia Pot.</span><span>{totalPotentialWin.toFixed(2)} CP</span>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Floating Bottom Bar */}
                <button
                    onClick={() => {
                        if (isMobileSlipOpen && betSlip.length > 0) placeBet();
                        else setIsMobileSlipOpen(!isMobileSlipOpen);
                    }}
                    className="w-full bg-emerald-600 text-zinc-950 h-16 flex items-center justify-between px-6 font-bold shadow-[0_-5px_20px_rgba(16,185,129,0.3)] relative z-50 transition-colors active:bg-emerald-500"
                >
                    {isMobileSlipOpen && betSlip.length > 0 ? (
                        <div className="w-full flex justify-center text-lg">{loading ? 'Procesando...' : 'REALIZAR APUESTA'}</div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="bg-zinc-950 text-emerald-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    {betSlip.length}
                                </div>
                                <span className="uppercase text-sm tracking-wide">Boleto</span>
                            </div>
                            {betSlip.length > 0 && (
                                <div className="text-right leading-tight">
                                    <span className="block text-[10px] text-zinc-800">Couta {betSlip.reduce((acc, c) => acc * c.odd, 1).toFixed(2)}</span>
                                </div>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* --- SUCCESS ANIMATION OVERLAY --- */}
            <AnimatePresence>
                {successAnim && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm pointer-events-none"
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-zinc-900 border border-emerald-500/50 p-8 rounded-3xl shadow-[0_0_100px_rgba(16,185,129,0.4)] flex flex-col items-center"
                        >
                            <motion.div
                                initial={{ rotate: -90, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
                            >
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </motion.div>
                            <h2 className="text-2xl md:text-4xl font-black italic uppercase text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] mb-2 tracking-tighter">¡Apuesta Sellada!</h2>
                            <p className="text-zinc-400 font-medium text-center">Tus CubiertasPoints han sido deducidos.<br />¡Que la suerte te acompañe, Hooligan!</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </main>
    );
}

