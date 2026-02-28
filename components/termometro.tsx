"use client";

import { useTeamData } from "./providers/team-provider";
import { motion } from "framer-motion";

export function Termometro() {
    const { partidos, loading } = useTeamData();

    if (loading) {
        return (
            <div className="flex animate-pulse items-center gap-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 backdrop-blur-sm">
                <div className="h-6 w-32 bg-primary-foreground/20 rounded-md"></div>
            </div>
        );
    }

    // Find last 5 finalized matches (any format)
    const last5 = [...partidos]
        .filter((p) => p.estado === "finalizado")
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5)
        .reverse(); // reverse so oldest is left, newest is right

    if (last5.length === 0) return null;

    let points = 0;

    const formIcons = last5.map((match, i) => {
        const gl = Number(match.goles_equipo || 0);
        const gr = Number(match.goles_rival || 0);
        let result = "➖";
        let color = "bg-slate-500/20 text-slate-400 border-slate-500/30";

        if (gl > gr) {
            result = "V";
            color = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold";
            points += 3;
        } else if (gl === gr) {
            result = "E";
            color = "bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold";
            points += 1;
        } else {
            result = "D";
            color = "bg-red-500/20 text-red-500 border-red-500/30 font-bold";
        }

        return (
            <span
                key={match.id || i}
                title={`${match.rival} (${gl}-${gr})`}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm shadow-sm ${color}`}
            >
                {result}
            </span>
        );
    });

    // Decide dynamic message based on points out of 15
    let message = "Temporada de transición";
    let messageColor = "text-amber-400";

    if (points >= 12) {
        message = "A por la Champions 🏆";
        messageColor = "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]";
    } else if (points >= 8) {
        message = "Ni tan mal, hay que apretar 🔥";
        messageColor = "text-yellow-400";
    } else if (points >= 5) {
        message = "Nos mantenemos a flote ⛵";
        messageColor = "text-amber-400";
    } else {
        message = "Se busca entrenador urgente 📉";
        messageColor = "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 inline-flex flex-col gap-2 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 backdrop-blur-sm transition-all hover:bg-primary-foreground/10"
        >
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
                    Racha:
                </span>
                <div className="flex gap-1.5">{formIcons}</div>
            </div>
            <p className={`text-sm italic font-black uppercase tracking-wide ${messageColor}`}>
                {message}
            </p>
        </motion.div>
    );
}
