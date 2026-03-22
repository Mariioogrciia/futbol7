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
    
    // Bet Mode
    const [betMode, setBetMode] = useState<'individual' | 'combinada'>('individual');
    const [combinadaAmount, setCombinadaAmount] = useState<number | ''>('');

    // New UI States
    const [activeTab, setActiveTab] = useState<'marcadores' | 'eventos' | 'goleadores' | 'carnicero' | 'canallas' | 'ranking' | 'mis_apuestas'>('marcadores');
    const [ranking, setRanking] = useState<{ id: string, nombre: string, puntos: number }[]>([]);
    const [exactScoreLocal, setExactScoreLocal] = useState(0);
    const [exactScoreAway, setExactScoreAway] = useState(0);

    // History state
    const [misApuestas, setMisApuestas] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

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

    const fetchHistory = async () => {
        if (!session) return;
        setLoadingHistory(true);
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) return;
            const res = await fetch('/api/apuestas/mis-apuestas', {
                headers: { 'Authorization': `Bearer ${currentSession.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMisApuestas(data.apuestas || []);
            }
        } catch (e) {
            console.error("Error fetching history", e);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'mis_apuestas') {
            fetchHistory();
        }
    }, [activeTab, session]);

    // Derived states
    const combinadaOdd = betSlip.reduce((acc, curr) => acc * curr.odd, 1);

    const totalWagered = betMode === 'individual'
        ? betSlip.reduce((acc, curr) => acc + (curr.amount || 0), 0)
        : (typeof combinadaAmount === 'number' ? combinadaAmount : 0);

    const totalPotentialWin = betMode === 'individual'
        ? betSlip.reduce((acc, curr) => acc + ((curr.amount || 0) * curr.odd), 0)
        : (typeof combinadaAmount === 'number' ? combinadaAmount : 0) * combinadaOdd;

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
        if (betMode === 'individual') {
            const emptyBets = betSlip.some(b => !b.amount || b.amount <= 0);
            if (emptyBets) {
                toast.error("Por favor, introduce una cantidad en todas tus selecciones.");
                return;
            }
        } else {
            if (!combinadaAmount || combinadaAmount <= 0) {
                toast.error("Por favor, introduce la cantidad para la combinada.");
                return;
            }
            if (betSlip.length < 2) {
                toast.error("Una combinada requiere al menos 2 selecciones.");
                return;
            }
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
                    total_wagered: totalWagered,
                    tipo_apuesta: betMode,
                    combinada_odd: combinadaOdd
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
                    flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 border w-full group/odd
                    ${selected
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 border-emerald-400 text-zinc-950 font-black shadow-[0_6px_16px_rgba(16,185,129,0.3)] transform scale-[1.02]'
                        : 'bg-surface-card border-border-subtle text-text-secondary hover:bg-surface-card-hover hover:border-emerald-500/40 hover:text-text-primary'
                    }
                `}
            >
                <span className="text-xs truncate mr-3 text-left font-semibold tracking-tight">{option.label}</span>
                <span className={`text-sm ml-2 font-black tabular-nums transition-transform duration-300 group-hover/odd:scale-105 ${selected ? 'text-zinc-950' : 'text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.1)]'}`}>
                    {option.odd.toFixed(2)}
                </span>
            </button>
        );
    };

    return (
        <main className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans transition-colors duration-200">
            {/* Header / Nav simulation (could replace with your actual <Header />, but adding custom balance badge) */}
            <Header />

            {/* Custom Topbar just below Header for Betting specific info */}
            <div className="w-full bg-surface-card/90 backdrop-blur-xl border-b border-border-subtle sticky top-[64px] lg:top-[72px] z-40 transition-all shadow-soft">
                <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h1 className="font-black text-xl md:text-2xl tracking-tighter hidden sm:flex items-center gap-1">
                            <span className="text-text-primary">Impersed</span>
                            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent uppercase font-black drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]">BET</span>
                        </h1>
                    </div>

                    {/* Balance Badge */}
                    <motion.div
                        animate={balanceChanged ? { scale: [1, 1.05, 1], y: [0, -2, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-3 bg-bg-secondary border border-border-subtle pl-2 pr-4 py-1.5 rounded-full transition-all hover:bg-surface-card-hover group shadow-sm"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-[10px] font-black text-zinc-950 shadow-[0_0_12px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
                            СР
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black tracking-wider text-text-muted uppercase leading-none">Mi Saldo</span>
                            <span className="font-mono font-bold tracking-tight text-text-primary text-sm">
                                {balance.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-xs text-emerald-500 font-bold">CP</span>
                            </span>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row relative min-h-[calc(100vh-136px)]">

                {/* --- LEFT DESKTOP / MAIN VIEW --- */}
                <div className="flex-1 w-full lg:w-[70%] p-5 md:p-8 pb-32 lg:pb-20 space-y-8 flex flex-col">

                    {initialLoading ? (
                        <div className="w-full h-48 md:h-64 rounded-xl relative overflow-hidden flex flex-col items-center justify-center border border-border-default bg-surface-card shadow-elevated transition-colors">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                            <p className="mt-4 text-zinc-500">Consultando al Oráculo...</p>
                        </div>
                    ) : partido ? (
                        <div className="w-full min-h-[16rem] md:h-96 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center border border-border-default bg-surface-card shadow-elevated py-8 md:py-0 group transition-all duration-500 hover:border-emerald-500/20">
                            {/* Cinematic Background overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.6))] z-10"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)] z-10 animate-pulse"></div>
                            
                            {/* Abstract sports-grid on back */}
                            <div className="absolute inset-0 opacity-15 mix-blend-overlay z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

                            <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
                            <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>

                            <div className="relative z-20 text-center w-full px-4 flex flex-col items-center justify-between h-full py-6 md:py-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[10px] font-black tracking-[0.15em] uppercase mb-4 backdrop-blur-sm shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                    Próxima Batalla
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-14 w-full">
                                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] text-center transition-transform duration-500 group-hover:scale-[1.02]">
                                        Impersed FC
                                    </h2>
                                    
                                    <div className="flex flex-col items-center">
                                        <div className="text-lg md:text-2xl font-black text-emerald-400 italic bg-bg-secondary/80 backdrop-blur-md px-3 py-1 rounded-xl border border-border-subtle tracking-widest shadow-soft">VS</div>
                                    </div>

                                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-text-primary dark:text-zinc-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] text-center group-hover:scale-[1.02] transition-transform duration-500">
                                        {partido.rival}
                                    </h2>
                                </div>
                                
                                <div className="mt-6 flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                                    <span className="text-xs text-zinc-300 font-medium">
                                        {new Date(partido.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full min-h-[12rem] md:h-64 rounded-xl relative overflow-hidden flex flex-col items-center justify-center border border-border-default bg-surface-card shadow-elevated transition-colors py-8 md:py-0">
                            <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
                                <HelpCircle className="w-8 h-8 text-zinc-500" />
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No hay partidos próximos</p>
                        </div>
                    )}

                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 px-1">
                        {[
                            { id: 'marcadores', label: 'Marcadores', icon: <Trophy className="w-4 h-4" /> },
                            { id: 'eventos', label: 'Eventos', icon: <Zap className="w-4 h-4" /> },
                            { id: 'goleadores', label: 'Goleadores', icon: <User className="w-4 h-4" /> },
                            { id: 'carnicero', label: 'El Carnicero', icon: <AlertCircle className="w-4 h-4" /> },
                            { id: 'canallas', label: 'Canalladas', icon: <Star className="w-4 h-4" /> },
                            { id: 'ranking', label: 'Ranking', icon: <Medal className="w-4 h-4" /> },
                            { id: 'mis_apuestas', label: 'Mis Apuestas', icon: <Coins className="w-4 h-4" /> }
                        ].map(tab => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all duration-300 border
                                        ${active
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 border-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:brightness-105'
                                            : 'bg-surface-card border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-card-hover hover:border-emerald-500/30'}
                                    `}
                                >
                                    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Markets List based on Active Tab */}
                    <div className="space-y-4">
                        {/* Custom exact score component for 'marcadores' tab */}
                        {activeTab === 'marcadores' && (
                            <div className="bg-surface-card border border-border-default rounded-2xl overflow-hidden p-6 relative transition-all shadow-soft group hover:border-emerald-500/10">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-colors"></div>
                                <h3 className="font-black text-lg uppercase tracking-wider text-text-primary mb-6 flex items-center gap-2 transition-colors">
                                    <Target className="w-5 h-5 text-emerald-500" />
                                    Crea tu Marcador Exacto
                                </h3>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                                    <div className="flex-1 w-full bg-bg-secondary p-5 rounded-xl border border-border-subtle flex flex-col items-center transition-all hover:border-emerald-500/20 group/score">
                                        <span className="font-black text-xs uppercase tracking-widest text-text-secondary mb-3 truncate max-w-full">{partido ? "Impersed FC" : "Local"}</span>
                                        <div className="flex items-center gap-5">
                                            <button onClick={() => setExactScoreLocal(Math.max(0, exactScoreLocal - 1))} className="w-10 h-10 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-center hover:bg-surface-card-hover hover:border-emerald-500/50 text-xl font-bold transition-all shadow-sm">-</button>
                                            <span className="text-4xl font-black min-w-[36px] text-center text-text-primary tabular-nums tracking-tighter group-hover/score:text-emerald-500 transition-colors">{exactScoreLocal}</span>
                                            <button onClick={() => setExactScoreLocal(exactScoreLocal + 1)} className="w-10 h-10 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-center hover:bg-surface-card-hover hover:border-emerald-500/50 text-xl font-bold transition-all shadow-sm">+</button>
                                        </div>
                                    </div>
                                    
                                    <span className="text-lg font-black text-text-muted italic">M.E</span>
                                    
                                    <div className="flex-1 w-full bg-bg-secondary p-5 rounded-xl border border-border-subtle flex flex-col items-center transition-all hover:border-emerald-500/20 group/score">
                                        <span className="font-black text-xs uppercase tracking-widest text-text-secondary mb-3 truncate max-w-full">{partido ? partido.rival : 'Rival'}</span>
                                        <div className="flex items-center gap-5">
                                            <button onClick={() => setExactScoreAway(Math.max(0, exactScoreAway - 1))} className="w-10 h-10 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-center hover:bg-surface-card-hover hover:border-emerald-500/50 text-xl font-bold transition-all shadow-sm">-</button>
                                            <span className="text-4xl font-black min-w-[36px] text-center text-text-primary tabular-nums tracking-tighter group-hover/score:text-emerald-500 transition-colors">{exactScoreAway}</span>
                                            <button onClick={() => setExactScoreAway(exactScoreAway + 1)} className="w-10 h-10 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-center hover:bg-surface-card-hover hover:border-emerald-500/50 text-xl font-bold transition-all shadow-sm">+</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-5 transition-colors">
                                    <div className="text-center sm:text-left">
                                        <span className="block text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Cuota Estimada</span>
                                        <span className="text-3xl font-black text-emerald-500 drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)] tabular-nums">
                                            x{getExactScoreOdd(exactScoreLocal, exactScoreAway).toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={addExactScoreToSlip}
                                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-105 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_18px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        Añadir al Boleto
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'mis_apuestas' && (
                            <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden p-6 relative transition-colors shadow-sm dark:shadow-none min-h-[400px]">
                                <h3 className="font-bold text-xl text-text-primary mb-6 flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                    Mis Apuestas Realizadas
                                </h3>

                                {!session ? (
                                    <div className="text-center py-12 text-text-muted">
                                        Debes iniciar sesión para ver tu historial.
                                    </div>
                                ) : loadingHistory ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                    </div>
                                ) : misApuestas.length === 0 ? (
                                    <div className="text-center py-12 text-text-muted font-medium">
                                        Aún no has realizado ninguna apuesta.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {misApuestas
                                            .filter(b => b.mercado_id === 'combinada' || !b.mercado_id.startsWith('comb_'))
                                            .map(bet => {
                                                const isCombinada = bet.mercado_id === 'combinada';
                                                const children = isCombinada ? misApuestas.filter(c => c.mercado_id === `comb_${bet.id}`) : [];
                                                
                                                return (
                                                    <div key={bet.id} className="flex flex-col p-4 bg-bg-secondary rounded-2xl border border-border-subtle transition-all hover:bg-surface-card-hover shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 h-full w-2 flex flex-col">
                                                            <div className={`flex-1 ${bet.estado === 'ganada' ? 'bg-emerald-500' : bet.estado === 'perdida' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                                                        </div>
                                                        <div className="flex justify-between items-start mb-2 pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-text-primary text-lg">
                                                                    {isCombinada ? 'Apuesta Combinada' : bet.opcion_label}
                                                                </span>
                                                                {isCombinada && (
                                                                    <span className="px-2 py-0.5 text-[10px] font-black tracking-wider rounded-md bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 uppercase">
                                                                        {children.length} Selecciones
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm flex items-center gap-1 ${bet.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30' : bet.estado === 'ganada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30'}`}>
                                                                {bet.estado === 'ganada' && <CheckCircle2 className="w-3 h-3" />}
                                                                {bet.estado === 'perdida' && <AlertCircle className="w-3 h-3" />}
                                                                {bet.estado.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        
                                                        {isCombinada && (
                                                            <p className="text-sm text-text-secondary mb-3">{bet.opcion_label}</p>
                                                        )}

                                                        <div className="flex justify-between text-sm font-bold bg-white dark:bg-zinc-900 overflow-hidden rounded-xl border border-slate-100 dark:border-zinc-800 mr-2 mt-2">
                                                            <div className="flex flex-col p-3 flex-1 border-r border-slate-100 dark:border-zinc-800">
                                                                <span className="text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Apostado</span>
                                                                <span className="text-slate-800 dark:text-zinc-200">{bet.cantidad_apostada} CP</span>
                                                            </div>
                                                            <div className="flex flex-col p-3 flex-1 border-r border-slate-100 dark:border-zinc-800">
                                                                <span className="text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Cuota Total</span>
                                                                <span className="text-slate-800 dark:text-zinc-200">{bet.cuota.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex flex-col p-3 flex-1">
                                                                <span className="text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Ganancia Pot.</span>
                                                                <span className="text-emerald-600 dark:text-emerald-400">{bet.ganancia_potencial.toFixed(2)} CP</span>
                                                            </div>
                                                        </div>

                                                        {isCombinada && children.length > 0 && (
                                                            <div className="mt-4 pl-4 border-l-2 border-border-subtle space-y-2 mr-2">
                                                                {children.map(child => (
                                                                    <div key={child.id} className="flex justify-between items-center text-sm py-1 border-b border-transparent hover:border-border-subtle">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-semibold text-slate-700 dark:text-zinc-300">{child.opcion_label}</span>
                                                                            <span className="text-xs font-bold text-slate-500">Cuota: {child.cuota}</span>
                                                                        </div>
                                                                        {child.estado !== 'pendiente' && (
                                                                            <span className={`${child.estado === 'ganada' ? 'text-emerald-500' : 'text-red-500'} font-bold text-xs uppercase`}>
                                                                                {child.estado === 'ganada' ? '✅' : '❌'} {child.estado}
                                                                            </span>
                                                                        )}
                                                                        {child.estado === 'pendiente' && (
                                                                            <span className="text-amber-500 font-bold text-xs uppercase">⏳</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Standard Markets rendered according to tab */}
                        {(() => {
                            if (activeTab === 'ranking') {
                                return (
                                    <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden p-6 max-h-[800px] overflow-y-auto custom-scrollbar transition-colors">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle transition-colors">
                                            <Medal className="w-6 h-6 text-emerald-500" />
                                            <h3 className="text-xl font-bold text-text-primary">Top Apostadores</h3>
                                        </div>
                                        {ranking.length === 0 ? (
                                            <p className="text-slate-500 dark:text-zinc-500 text-center py-8">No hay hooligans en el ranking todavía.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {ranking.map((user, index) => (
                                                    <div key={user.id} className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border-subtle transition-all hover:bg-surface-card-hover">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${index === 0 ? 'bg-yellow-500 text-zinc-900' : index === 1 ? 'bg-zinc-300 text-zinc-900' : index === 2 ? 'bg-amber-700 text-zinc-100' : 'bg-bg-primary text-text-muted'}`}>
                                                                {index + 1}
                                                            </div>
                                                            <span className="font-bold text-text-primary">{user.nombre}</span>
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
                                <div key={market.id} className="bg-surface-card border border-border-default rounded-2xl overflow-hidden transition-all shadow-soft group hover:border-emerald-500/10">
                                    <div className="flex items-center gap-3 p-4 bg-surface-card border-b border-border-subtle transition-colors">
                                        <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 shadow-sm">
                                            {market.icon}
                                        </div>
                                        <h3 className="font-black text-sm uppercase tracking-wider text-text-primary">{market.title}</h3>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-bg-secondary/30 transition-colors">
                                        {market.options.map(option => renderOddButton(market, option))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>

                </div>

                {/* --- RIGHT DESKTOP / BET SLIP SIDEBAR --- */}
                <div className="hidden lg:flex w-[30%] min-w-[320px] max-w-[400px] border-l border-border-subtle bg-surface-card/50 p-6 flex-col h-[calc(100vh-136px)] sticky top-[136px] overflow-hidden transition-colors">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-subtle transition-colors shrink-0">
                        <div className="relative">
                            <PlayCircle className="w-6 h-6 text-emerald-500" />
                            {betSlip.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-emerald-500 text-zinc-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {betSlip.length}
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold">Boleto</h2>
                        {betSlip.length > 0 && (
                            <button onClick={() => setBetSlip([])} className="ml-auto text-xs text-zinc-500 hover:text-red-400 transition-colors">
                                Limpiar
                            </button>
                        )}
                    </div>
                    
                    {/* Bet Mode Toggle */}
                    <div className="flex bg-bg-secondary border border-border-subtle p-1 rounded-lg mb-4 shrink-0">
                        <button onClick={() => setBetMode('individual')} className={`flex-1 text-sm font-bold py-1.5 rounded-md transition-all ${betMode === 'individual' ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-secondary'}`}>Sencilla</button>
                        <button onClick={() => setBetMode('combinada')} className={`flex-1 text-sm font-bold py-1.5 rounded-md transition-all ${betMode === 'combinada' ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-secondary'}`}>Combinada</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-6 custom-scrollbar min-h-0">
                        <AnimatePresence mode="popLayout">
                            {betSlip.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full flex flex-col items-center justify-center text-text-muted space-y-5 px-4"
                                >
                                    <div className="p-4 rounded-full bg-bg-secondary border border-border-subtle shadow-inner animate-bounce-slow">
                                        <Coins className="w-10 h-10 text-emerald-500/60 stroke-[1.5]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-xs uppercase tracking-wider text-text-primary mb-1">Boleto Vacío</p>
                                        <p className="text-xs text-text-muted max-w-[200px] mx-auto leading-relaxed">
                                            Selecciona una cuota para empezar a construir tu apuesta.
                                        </p>
                                    </div>
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
                                        className="bg-bg-secondary border border-border-subtle rounded-lg p-3 group relative transition-colors shadow-sm dark:shadow-none shrink-0"
                                    >
                                        <button
                                            onClick={() => removeSelection(bet.id)}
                                            className="absolute top-3 right-3 text-slate-400 dark:text-zinc-600 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <p className="text-xs text-text-muted font-medium mb-1 truncate pr-6">{bet.marketTitle}</p>
                                        <div className="flex items-end justify-between mb-3">
                                            <p className="font-bold text-text-primary">{bet.label}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {betMode === 'individual' ? (
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs">CP</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={bet.amount === ('' as unknown as number) ? '' : bet.amount}
                                                        onChange={e => updateBetAmount(bet.id, e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full bg-surface-card border border-border-subtle rounded-md py-2 pl-9 pr-3 text-sm font-bold text-text-primary focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-text-muted"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-1"></div>
                                            )}
                                            <div className="flex flex-col items-end shrink-0">
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
                    <div className="pt-4 border-t border-border-subtle space-y-3 transition-all shrink-0">
                        
                        {betMode === 'combinada' && betSlip.length > 0 && (
                            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl p-3.5 border border-emerald-500/20 shadow-sm">
                                <div className="flex justify-between items-center mb-2.5">
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Cuota Tot. Combinada</span>
                                    <span className="font-black text-emerald-500 text-base tabular-nums drop-shadow-[0_1px_6px_rgba(16,185,129,0.2)]">x{combinadaOdd.toFixed(2)}</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xs">CP</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={combinadaAmount === '' ? '' : combinadaAmount}
                                        onChange={e => {
                                            let val = parseFloat(e.target.value);
                                            setCombinadaAmount(isNaN(val) || val < 0 ? '' : val);
                                        }}
                                        placeholder="Importe de Combinada"
                                        className="w-full bg-surface-card border border-emerald-500/20 rounded-lg py-2 pl-9 pr-3 font-bold text-sm text-text-primary focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-inner"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-bg-secondary p-3 rounded-xl border border-border-subtle space-y-2 shadow-inner">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-text-secondary">Apuesta Total</span>
                                <span className="font-black tabular-nums text-text-primary">{totalWagered.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-[10px] text-text-muted">CP</span></span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-text-primary">Ganancia Potencial</span>
                                <span className="font-black tabular-nums text-emerald-500 drop-shadow-[0_1px_4px_rgba(16,185,129,0.1)]">{totalPotentialWin.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-[10px]">CP</span></span>
                            </div>
                        </div>

                        <button
                            disabled={betSlip.length === 0 || loading}
                            onClick={placeBet}
                            className={`
                                w-full py-3.5 rounded-xl font-black uppercase text-xs tracking-wider relative overflow-hidden transition-all duration-300
                                ${betSlip.length === 0
                                    ? 'bg-bg-secondary text-text-muted border border-border-subtle cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5 active:translate-y-0'
                                }
                            `}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Procesando...</span>
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
                                className="absolute bottom-16 left-0 right-0 h-[70vh] bg-surface-card rounded-t-2xl z-50 flex flex-col shadow-elevated border-t border-border-subtle"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                    <h3 className="font-bold">Boleto ({betSlip.length})</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex bg-zinc-950 p-1 rounded-md text-xs">
                                            <button onClick={() => setBetMode('individual')} className={`px-2 py-1 rounded ${betMode === 'individual' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Sencilla</button>
                                            <button onClick={() => setBetMode('combinada')} className={`px-2 py-1 rounded ${betMode === 'combinada' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Combi</button>
                                        </div>
                                        {betSlip.length > 0 && <button onClick={() => setBetSlip([])} className="text-xs text-red-500">Limpiar</button>}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {betSlip.length === 0 ? (
                                        <p className="text-center text-zinc-500 mt-10 text-sm">Boleto vacío</p>
                                    ) : (
                                        betSlip.map(bet => (
                                            <div key={bet.id} className="bg-bg-secondary border border-border-subtle rounded-lg p-3 relative">
                                                <button onClick={() => removeSelection(bet.id)} className="absolute top-2 right-2 text-text-muted hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <p className="text-[10px] text-text-muted mb-1">{bet.marketTitle}</p>
                                                <p className="font-bold text-sm text-text-primary mb-2">{bet.label}</p>
                                                <div className="flex gap-2 items-center">
                                                    {betMode === 'individual' ? (
                                                        <div className="relative flex-1">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs">CP</span>
                                                            <input
                                                                type="number" min="0" value={bet.amount === ('' as unknown as number) ? '' : bet.amount} onChange={e => updateBetAmount(bet.id, e.target.value)} placeholder="0"
                                                                className="w-full bg-surface-card border border-border-subtle rounded-md py-1.5 pl-8 pr-2 text-sm font-bold text-text-primary focus:border-emerald-500 outline-none"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1"></div>
                                                    )}
                                                    <span className="font-black text-emerald-400 text-sm">{bet.odd.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-4 bg-surface-card border-t border-border-subtle">
                                    {betMode === 'combinada' && betSlip.length > 0 && (
                                        <div className="mb-3 flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs">CP</span>
                                                <input
                                                    type="number" min="0" value={combinadaAmount === '' ? '' : combinadaAmount} onChange={e => {
                                                        let val = parseFloat(e.target.value);
                                                        setCombinadaAmount(isNaN(val) || val < 0 ? '' : val);
                                                    }} placeholder="Importe Combi"
                                                    className="w-full bg-bg-secondary border border-emerald-500/30 rounded-md py-1.5 pl-8 pr-2 text-sm font-bold text-text-primary focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center justify-center bg-bg-secondary px-3 rounded-md border border-border-subtle">
                                                <span className="text-emerald-400 font-black text-sm">x{combinadaOdd.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-xs text-text-secondary mb-1">
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
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-surface-card border border-emerald-500/30 p-8 rounded-3xl shadow-elevated flex flex-col items-center"
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
                            <p className="text-text-secondary font-medium text-center">Tus CubiertasPoints han sido deducidos.<br />¡Que la suerte te acompañe, Hooligan!</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </main>
    );
}

