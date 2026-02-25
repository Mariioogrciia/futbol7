"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568";

type StatsType = {
    victorias: number;
    empates: number;
    derrotas: number;
    golesFavor: number;
    golesContra: number;
    partidosJugados: number;
};

type TeamContextType = {
    jugadores: any[];
    topGoleadores: any[];
    partidos: any[];
    goleadoresPartido: any[];
    stats: StatsType;
    loading: boolean;
    refreshData: () => Promise<void>;
};

const defaultStats = {
    victorias: 0,
    empates: 0,
    derrotas: 0,
    golesFavor: 0,
    golesContra: 0,
    partidosJugados: 0,
};

const TeamContext = createContext<TeamContextType>({
    jugadores: [],
    topGoleadores: [],
    partidos: [],
    goleadoresPartido: [],
    stats: defaultStats,
    loading: true,
    refreshData: async () => { },
});

export function TeamProvider({ children }: { children: React.ReactNode }) {
    const [jugadores, setJugadores] = useState<any[]>([]);
    const [topGoleadores, setTopGoleadores] = useState<any[]>([]);
    const [partidos, setPartidos] = useState<any[]>([]);
    const [goleadoresPartido, setGoleadoresPartido] = useState<any[]>([]);
    const [stats, setStats] = useState<StatsType>(defaultStats);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const ts = new Date().getTime();
            const [playersRes, matchesRes] = await Promise.all([
                fetch(`/api/players?equipo_id=${EQUIPO_ID}&t=${ts}`),
                fetch(`/api/matches?equipo_id=${EQUIPO_ID}&t=${ts}`),
            ]);

            if (playersRes.ok) {
                const pData = await playersRes.json();
                setJugadores(pData.jugadores || []);
                setTopGoleadores(pData.top_goleadores || []);
            }

            if (matchesRes.ok) {
                const mData = await matchesRes.json();
                const matchesList = mData.partidos || [];
                setPartidos(matchesList);
                setGoleadoresPartido(mData.goleadores || []);

                const finalizados = matchesList.filter((m: any) => m.estado === "finalizado");

                let won = 0;
                let drawn = 0;
                let lost = 0;
                let gf = 0;
                let ga = 0;

                finalizados.forEach((m: any) => {
                    const mGf = Number(m.goles_equipo || 0);
                    const mGa = Number(m.goles_rival || 0);

                    gf += mGf;
                    ga += mGa;

                    if (mGf > mGa) won++;
                    else if (mGf === mGa) drawn++;
                    else lost++;
                });

                setStats({
                    victorias: won,
                    empates: drawn,
                    derrotas: lost,
                    golesFavor: gf,
                    golesContra: ga,
                    partidosJugados: finalizados.length,
                });
            }
        } catch (error) {
            console.error("Error fetching team context data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <TeamContext.Provider value={{
            jugadores,
            topGoleadores,
            partidos,
            goleadoresPartido,
            stats,
            loading,
            refreshData: fetchData
        }}>
            {children}
        </TeamContext.Provider>
    );
}

export function useTeamData() {
    return useContext(TeamContext);
}
