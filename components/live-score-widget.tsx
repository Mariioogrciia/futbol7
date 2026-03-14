"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568";

type MatchData = {
    id: string;
    rival: string;
    goles_equipo: number;
    goles_rival: number;
    estado: string;
    fecha: string;
};

export function LiveScoreWidget() {
    const [liveMatch, setLiveMatch] = useState<MatchData | null>(null);
    const [flash, setFlash] = useState<"equipo" | "rival" | null>(null);

    useEffect(() => {
        // 1. Fetch initial live match
        const fetchLiveMatch = async () => {
            try {
                const res = await fetch(`/api/matches?equipo_id=${EQUIPO_ID}&t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    const matches = data.partidos || [];
                    const active = matches.find((m: any) => m.estado === "en_juego");
                    if (active) {
                        setLiveMatch(active);
                    } else {
                        setLiveMatch(null);
                    }
                }
            } catch (e) {
                console.error("Error fetching live matches:", e);
            }
        };

        fetchLiveMatch();

        // 2. Subscribe to Realtime changes on 'partidos' table
        const channel = supabase
            .channel('live-score-channel')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'partidos',
                },
                (payload) => {
                    const newData = payload.new as MatchData;

                    if (payload.eventType === 'UPDATE') {
                        setLiveMatch((prev) => {
                            if (!prev && newData.estado === "en_juego") {
                                return newData; // Match just went live
                            }

                            if (prev && prev.id === newData.id) {
                                if (newData.estado !== "en_juego") {
                                    return null; // Match ended
                                }

                                // Check for goals to trigger flash
                                if (newData.goles_equipo > prev.goles_equipo) {
                                    triggerFlash("equipo");
                                } else if (newData.goles_rival > prev.goles_rival) {
                                    triggerFlash("rival");
                                }

                                return newData;
                            }
                            return prev;
                        });
                    }

                    if (payload.eventType === 'INSERT' && newData.estado === "en_juego") {
                        setLiveMatch(newData);
                    }

                    if (payload.eventType === 'DELETE' && liveMatch?.id === (payload.old as any).id) {
                        setLiveMatch(null);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [liveMatch?.id]);

    const triggerFlash = (team: "equipo" | "rival") => {
        setFlash(team);
        setTimeout(() => setFlash(null), 2000);
    };

    if (!liveMatch) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="fixed top-20 right-3 sm:right-4 sm:left-auto sm:translate-x-0 z-40 w-auto max-w-[calc(100vw-24px)] sm:max-w-sm pointer-events-none"
            >
                <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-2.5 sm:p-4 flex flex-col items-center relative overflow-hidden pointer-events-auto transition-colors duration-300 group">

                    {/* Background Glow based on Flash */}
                    <div className={`absolute inset-0 opacity-20 transition-colors duration-500 ${flash === 'equipo' ? 'bg-primary' : flash === 'rival' ? 'bg-red-500' : 'bg-transparent'}`} />

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 sm:mb-3 relative z-10 w-full justify-center">
                        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                            <span className="text-[9px] sm:text-xs font-bold text-red-400 uppercase tracking-wider leading-none pt-px">En Vivo</span>
                        </div>
                    </div>

                    {/* Scoreboard - Compact horizontal layout */}
                    <div className="flex items-center justify-center w-full relative z-10 gap-2 sm:gap-4">

                        {/* Us */}
                        <div className="flex flex-col items-center text-center min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600 mb-1 shadow-inner">
                                <span className="text-sm sm:text-lg drop-shadow-sm">🛡️</span>
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-200 truncate max-w-[50px] sm:max-w-[70px]">Nosotros</span>
                        </div>

                        {/* Score Numbers */}
                        <div className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-2">
                            <div className="relative">
                                {flash === 'equipo' && <span className="absolute -inset-2 bg-primary blur-md opacity-60 rounded-full animate-ping z-0" />}
                                <span className={`text-2xl sm:text-4xl font-black relative z-10 transition-colors duration-300 ${flash === 'equipo' ? 'text-primary drop-shadow-[0_0_15px_rgba(20,184,106,1)]' : 'text-white drop-shadow-md'}`}>
                                    {liveMatch.goles_equipo || 0}
                                </span>
                            </div>

                            <span className="text-base sm:text-xl font-bold text-slate-600">-</span>

                            <div className="relative">
                                {flash === 'rival' && <span className="absolute -inset-2 bg-red-500 blur-md opacity-60 rounded-full animate-ping z-0" />}
                                <span className={`text-2xl sm:text-4xl font-black relative z-10 transition-colors duration-300 ${flash === 'rival' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]' : 'text-white drop-shadow-md'}`}>
                                    {liveMatch.goles_rival || 0}
                                </span>
                            </div>
                        </div>

                        {/* Rival */}
                        <div className="flex flex-col items-center text-center min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600 mb-1 shadow-inner">
                                <span className="text-sm sm:text-lg drop-shadow-sm">🔥</span>
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-200 truncate max-w-[50px] sm:max-w-[70px]">{liveMatch.rival}</span>
                        </div>

                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
