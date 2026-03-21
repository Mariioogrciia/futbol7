"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Trophy, Shield, Edit, User, CalendarDays, Zap, Target, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useTeamData } from "@/components/providers/team-provider";

const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568";

interface Match {
  id: string;
  equipo_id: string;
  rival: string;
  fecha: string;
  estado: "programado" | "en_vivo" | "finalizado";
  goles_equipo: number;
  goles_rival: number;
  resultado: string | null;
  estadio: string;
  formato: "liga" | "copa";
}

interface Jugador {
  id: string;
  nombre: string;
  posicion: string;
  dorsal?: number | null;
}

interface GolesPartido {
  id: string;
  partido_id: string;
  jugador_id: string;
  nombre: string;
  goles: number;
}

/* ─── Countdown ─── */
function Countdown({ dateStr }: { dateStr: string }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(dateStr).getTime();
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) { clearInterval(interval); setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dateStr]);

  const labels: Record<string, string> = { d: "Días", h: "Horas", m: "Min", s: "Seg" };
  return (
    <div className="flex gap-1.5 sm:gap-3">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="w-12 h-12 sm:w-[68px] sm:h-[68px] flex items-center justify-center bg-bg-secondary backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border-subtle text-xl sm:text-3xl font-black text-text-primary tabular-nums shadow-inner">
            {value.toString().padStart(2, "0")}
          </div>
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-text-muted mt-1.5 sm:mt-2">{labels[unit]}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Next Match Hero Card ─── */
function NextMatchCard({ match }: { match: Match }) {
  const date = new Date(match.fecha);
  const dateStr = date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mb-16 overflow-hidden rounded-[2rem] border border-border-default bg-surface-card shadow-elevated"
    >
      {/* Ambient glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-700/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-800/15 blur-[80px] rounded-full pointer-events-none" />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent" />

      <div className="relative z-10 p-4 sm:p-8 lg:p-14">
        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-black tracking-[0.15em] uppercase text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-full bg-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Siguiente Partido
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          {/* Teams */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6 sm:mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] uppercase text-text-muted mb-1 sm:mb-2">Local</span>
                <span className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-text-primary tracking-tight leading-[0.9] text-balance">
                  Impersed<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Cubiertas</span>
                </span>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center px-2 sm:px-4">
                  <span className="text-lg sm:text-2xl font-black text-text-muted/40 tracking-tight select-none">VS</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] uppercase text-text-muted mb-1 sm:mb-2">Rival</span>
                <span className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-text-primary tracking-tight leading-[0.9] text-balance">{match.rival}</span>
              </div>
            </div>

            {/* Meta info pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-bg-secondary border border-border-subtle px-3 py-2 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-base font-bold text-text-primary capitalize">{dateStr}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-bg-secondary border border-border-subtle px-3 py-2 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-base font-bold text-text-primary">{timeStr}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.estadio)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2.5 bg-bg-secondary hover:bg-surface-card-hover border border-border-subtle hover:border-emerald-500/20 px-3 py-2 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all duration-300 group/pin"
              >
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0 group-hover/pin:scale-110 transition-transform" />
                <span className="text-xs sm:text-base font-bold text-text-primary group-hover:text-emerald-400 truncate max-w-[140px] sm:max-w-[220px]">{match.estadio}</span>
              </a>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center bg-bg-secondary border border-border-subtle rounded-xl sm:rounded-[1.5rem] p-4 sm:p-8 shrink-0">
            <p className="text-[10px] sm:text-xs font-black tracking-[0.15em] uppercase text-text-muted mb-3 sm:mb-6 flex items-center gap-2">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
              Empieza en
            </p>
            <Countdown dateStr={match.fecha} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Edit Modal ─── */
function EditMatchModal({ match, isOpen, onClose, jugadores }: { match: Match; isOpen: boolean; onClose: () => void; jugadores: Jugador[] }) {
  const [golesEquipo, setGolesEquipo] = useState(match.goles_equipo || 0);
  const [golesRival, setGolesRival] = useState(match.goles_rival || 0);
  const [goleadores, setGoleadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGoleadorChange = (playerId: string, goals: number) => {
    setGoleadores((prev) => {
      const existing = prev.find((g) => g.id === playerId);
      if (goals > 0) {
        const player = jugadores.find((p) => p.id === playerId);
        if (existing) return prev.map((g) => (g.id === playerId ? { ...g, goles: goals } : g));
        return [...prev, { id: playerId, nombre: player?.nombre || "", posicion: player?.posicion || "", dorsal: player?.dorsal ?? null, goles: goals }];
      }
      return prev.filter((g) => g.id !== playerId);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { alert("Sesión expirada"); return; }
      const res = await fetch("/api/admin/update-match", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ matchId: match.id, golesEquipo, golesRival, goleadores }),
      });
      if (!res.ok) { alert("Error al actualizar"); return; }
      alert("Partido actualizado");
      onClose();
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface-card border border-border-default p-6 rounded-2xl shadow-elevated max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black text-text-primary mb-6">Editar Resultado: {match.rival}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Goles Impersed</label>
                <input type="number" value={golesEquipo} onChange={(e) => setGolesEquipo(Number(e.target.value))}
                  className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-xl text-xl font-black text-text-primary text-center focus:outline-none focus:border-emerald-500/50" min="0" />
              </div>
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Goles {match.rival}</label>
                <input type="number" value={golesRival} onChange={(e) => setGolesRival(Number(e.target.value))}
                  className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-xl text-xl font-black text-text-primary text-center focus:outline-none focus:border-emerald-500/50" min="0" />
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2"><User className="h-3.5 w-3.5" /> Goleadores</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {jugadores.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-subtle hover:bg-surface-card-hover">
                    <input type="number" placeholder="0" min="0"
                      className="w-14 p-1.5 bg-surface-card border border-border-subtle rounded-lg text-center text-text-primary font-bold focus:outline-none"
                      onChange={(e) => handleGoleadorChange(player.id, Number(e.target.value))} />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-text-primary">{player.nombre}</div>
                      <div className="text-xs text-text-secondary">{player.posicion} #{player.dorsal ?? "–"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50">
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={onClose} className="px-6 py-3 border border-border-subtle rounded-xl text-text-secondary font-bold text-sm hover:bg-bg-secondary transition-all">Cancelar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Match Card ─── */
function MatchCard({ match, index, isAdmin, jugadores, goleadores }: { match: Match; index: number; isAdmin: boolean; jugadores: Jugador[]; goleadores: GolesPartido[]; }) {
  const [editModalOpen, setEditModalOpen] = useState(false);

  const matchGoleadores = goleadores.filter((g) => g.partido_id === match.id);
  const gf = Number(match.goles_equipo ?? 0);
  const ga = Number(match.goles_rival ?? 0);
  const outcome = match.estado === "finalizado"
    ? gf > ga ? "victoria" : gf < ga ? "derrota" : "empate"
    : null;

  const outcomeConfig = {
    victoria: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", accent: "from-emerald-500/10", label: "Victoria", dot: "bg-emerald-500", scoreTxt: "text-emerald-400" },
    derrota: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", accent: "from-red-500/10", label: "Derrota", dot: "bg-red-500", scoreTxt: "text-red-400" },
    empate: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", accent: "from-amber-500/10", label: "Empate", dot: "bg-amber-500", scoreTxt: "text-amber-400" },
  };

  const c = outcome ? outcomeConfig[outcome] : null;
  const date = new Date(match.fecha);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.07 }}
        className="group relative"
      >
        {/* Timeline dot */}
        <div className="absolute -left-[41px] top-7 hidden lg:flex items-center justify-center">
          <div className={cn(
            "h-3 w-3 rounded-full border-2 transition-all duration-300 group-hover:scale-125",
            outcome === "victoria" ? "border-emerald-500 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
            outcome === "derrota" ? "border-red-500 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
            outcome === "empate" ? "border-amber-500 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
            match.estado === "en_vivo" ? "border-red-500 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" :
            "border-emerald-500 bg-emerald-500/20"
          )} />
        </div>

        <div className={cn(
          "overflow-hidden rounded-2xl border bg-surface-card shadow-elevated transition-all duration-400 group-hover:-translate-y-1",
          c ? c.border : match.estado === "en_vivo" ? "border-red-500/20" : "border-border-default"
        )}>
          {/* Top color stripe */}
          {c && <div className={cn("h-[2px] w-full bg-gradient-to-r to-transparent", c.accent)} />}

          <div className="p-6">
            {/* Header row: date + status */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-[0.15em] uppercase text-text-muted">
                  {date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {match.estado === "finalizado" && c && (
                  <span className={cn("text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-xl border", c.bg, c.text, c.border)}>
                    {c.label}
                  </span>
                )}
                {match.estado === "en_vivo" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />En Vivo
                  </span>
                )}
                {match.estado === "programado" && (
                  <span className="text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-xl bg-bg-secondary text-text-secondary border border-border-subtle">
                    Próximo
                  </span>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Left: teams + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
                  <span className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Impersed Cubiertas</span>
                  <span className="text-sm text-text-muted font-black shrink-0">VS</span>
                  <span className="text-xl sm:text-2xl font-black text-text-primary tracking-tight break-words">{match.rival}</span>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-text-secondary">
                    <Clock className="h-4 w-4 text-emerald-500/60 shrink-0" />
                    {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.estadio)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-emerald-400 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-emerald-500/60 shrink-0" />
                    <span className="line-clamp-1 max-w-[220px] font-bold">{match.estadio}</span>
                  </a>
                </div>

                {matchGoleadores.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-wrap gap-2">
                    {matchGoleadores.map((g) => (
                      <span key={g.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                        ⚽ {g.nombre} {g.goles > 1 ? `×${g.goles}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: score + edit */}
              <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0 w-full sm:w-auto">
                {match.estado === "finalizado" && c && (
                  <div className={cn("flex items-center gap-1.5 text-4xl font-black tabular-nums tracking-tight", c.scoreTxt)}>
                    <span>{gf}</span>
                    <span className="text-text-muted/40 text-2xl">:</span>
                    <span>{ga}</span>
                  </div>
                )}
                {isAdmin && match.estado === "en_vivo" && (
                  <button onClick={() => setEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                    <Edit className="h-3.5 w-3.5" />Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <EditMatchModal match={match} isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} jugadores={jugadores} />
    </>
  );
}

/* ─── Stat Pill ─── */
function StatPill({ value, label, color, icon: Icon }: { value: string | number; label: string; color: string; icon: any }) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-5 rounded-2xl border bg-surface-card min-w-[88px] flex-1 sm:flex-initial shadow-soft", color)}>
      <Icon className={cn("h-4 w-4 mb-2 opacity-60")} />
      <span className="text-3xl font-black text-text-primary tabular-nums leading-none">{value}</span>
      <span className="text-xs font-black uppercase tracking-[0.12em] mt-1.5 opacity-50">{label}</span>
    </div>
  );
}

/* ─── Main Section ─── */
export function MatchesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const [isAdmin, setIsAdmin] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeFormat, setActiveFormat] = useState<"liga" | "copa">("liga");
  const [activeFilter, setActiveFilter] = useState<"todos" | "proximos" | "jugados">("todos");
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [goleadores, setGoleadores] = useState<GolesPartido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
    fetchData();
  }, []);

  async function checkAdminStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: userData } = await supabase.from("usuarios").select("rol").eq("id", session.user.id).single();
      if (userData?.rol === "admin") setIsAdmin(true);
    } catch (e) { console.error(e); }
  }

  async function fetchData() {
    try {
      const res = await fetch(`/api/matches?equipo_id=${EQUIPO_ID}`);
      if (!res.ok) throw new Error("Error API /api/matches");
      const json = await res.json();
      const formattedMatches: Match[] = (json.partidos || []).map((m: any) => ({
        id: m.id, equipo_id: m.equipo_id, rival: m.rival, fecha: m.fecha, lokasion: m.lokasion,
        estado: m.estado, goles_equipo: m.goles_equipo || 0, goles_rival: m.goles_rival || 0,
        resultado: m.resultado || null, formato: m.formato || "liga",
        estadio: m.estadio || "FUTBOL 7 D CASA GRANDE",
      }));
      setMatches(formattedMatches);
      setGoleadores(json.goleadores || []);
      const { data: playersData, error: playersError } = await supabase.from("jugadores").select("*").eq("equipo_id", EQUIPO_ID);
      if (!playersError && playersData) {
        setJugadores(playersData.map((p: any) => ({ id: p.id, nombre: p.nombre, posicion: p.posicion, dorsal: p.dorsal })));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMatches([]); setJugadores([]); setGoleadores([]);
    } finally {
      setLoading(false);
    }
  }

  const matchesByFormat = matches.filter((m) => m.formato === activeFormat);
  const nextMatch = matchesByFormat.find((m) => m.estado === "programado");
  const filteredMatches = matchesByFormat.filter((m) => {
    if (activeFilter === "todos") return true;
    if (activeFilter === "proximos") return m.estado === "programado";
    if (activeFilter === "jugados") return m.estado === "finalizado";
    return true;
  });

  const played = matchesByFormat.filter((m) => m.estado === "finalizado");
  const wins = played.filter((m) => Number(m.goles_equipo) > Number(m.goles_rival)).length;
  const losses = played.filter((m) => Number(m.goles_equipo) < Number(m.goles_rival)).length;
  const draws = played.filter((m) => Number(m.goles_equipo) === Number(m.goles_rival)).length;
  const gf = played.reduce((s, m) => s + (m.goles_equipo || 0), 0);
  const ga = played.reduce((s, m) => s + (m.goles_rival || 0), 0);

  const filterLabels: Record<string, string> = { todos: "Todos", proximos: "Próximos", jugados: "Jugados" };
  const filterColors: Record<string, string> = {
    todos: "data-[active=true]:text-text-primary",
    proximos: "data-[active=true]:text-emerald-500",
    jugados: "data-[active=true]:text-blue-500",
  };
  const activeBarColors: Record<string, string> = {
    todos: "bg-emerald-500",
    proximos: "bg-emerald-500",
    jugados: "bg-blue-500",
  };

  return (
    <section id="partidos" className="relative py-24 lg:py-32 overflow-hidden" ref={ref}>
      {/* Section ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[35%] h-[35%] bg-teal-900/8 blur-[100px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12 lg:mb-16"
        >
          {/* Eyebrow badge */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent max-w-16" />
            <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-text-secondary border border-border-subtle px-4 py-2 rounded-full bg-bg-secondary">
              <Trophy className="h-3 w-3 text-emerald-500" />
              {activeFormat === "liga" ? "Liga Futbol 7" : "Copa Futbol 7"}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-subtle to-transparent" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-text-primary leading-[0.95]">
                Calendario<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300">
                  {activeFormat === "liga" ? "de Liga" : "de Copa"}
                </span>
              </h2>
            </div>
            <div className="lg:max-w-xs lg:text-right">
              <p className="text-text-secondary text-lg font-medium leading-relaxed">
                Todos los compromisos de Impersed Cubiertas FC en la temporada {activeFormat === "liga" ? "liguera" : "copera"}.
              </p>
            </div>
          </div>

          <div className="mt-10 h-px bg-gradient-to-r from-emerald-500/30 via-border-subtle to-transparent" />
        </motion.div>

        {/* ── Competition Selector (Liga / Copa) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="inline-flex items-center gap-1 bg-bg-secondary border border-border-subtle rounded-2xl p-1.5 backdrop-blur-xl">
            {(["liga", "copa"] as const).map((format) => (
              <button
                key={format}
                onClick={() => setActiveFormat(format)}
                data-active={activeFormat === format}
                className={cn(
                  "relative px-7 py-3 rounded-xl text-base font-black tracking-wide uppercase transition-all duration-300",
                  activeFormat === format
                    ? "bg-surface-card text-text-primary border border-border-subtle shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {activeFormat === format && (
                  <motion.div layoutId="format-indicator"
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-emerald-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                {format === "liga" ? "Liga" : "Copa"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        {played.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            <StatPill value={played.length} label="Jugados" color="border-white/[0.06] text-slate-400" icon={Shield} />
            <StatPill value={wins} label="Victorias" color="border-emerald-500/20 text-emerald-400" icon={TrendingUp} />
            <StatPill value={draws} label="Empates" color="border-amber-500/20 text-amber-400" icon={Minus} />
            <StatPill value={losses} label="Derrotas" color="border-red-500/20 text-red-400" icon={Target} />
            <StatPill value={`${gf}·${ga}`} label="Goles" color="border-white/[0.06] text-slate-400" icon={Zap} />
          </motion.div>
        )}

        {/* ── Match Filter (Todos / Próximos / Jugados) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-1 bg-bg-secondary border border-border-subtle rounded-2xl p-1.5 backdrop-blur-xl">
            {(["todos", "proximos", "jugados"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                data-active={activeFilter === filter}
                className={cn(
                  "relative px-6 py-3 rounded-xl text-base font-black transition-all duration-300",
                  activeFilter === filter
                    ? cn("bg-surface-card border border-border-subtle shadow-sm", filterColors[filter])
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {activeFilter === filter && (
                  <motion.div layoutId="filter-bar-indicator"
                    className={cn("absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full", activeBarColors[filter])}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                {filterLabels[filter]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Next Match Hero ── */}
        {nextMatch && activeFilter !== "jugados" && <NextMatchCard match={nextMatch} />}

        {/* ── Timeline / Match List ── */}
        <div className="relative lg:ml-8">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-0 hidden h-full w-px lg:block"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 10%, rgba(255,255,255,0.04) 90%, transparent)" }} />

          <div className="grid gap-4 lg:pl-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p className="text-text-secondary font-medium text-sm">Cargando partidos...</p>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl opacity-20 mb-4">📅</span>
                <p className="text-text-primary font-black text-xl">Sin partidos disponibles</p>
                <p className="text-text-secondary text-sm mt-2">No hay encuentros en este filtro.</p>
              </div>
            ) : (
              filteredMatches.map((match, i) => (
                <MatchCard key={match.id} match={match} index={i} isAdmin={isAdmin} jugadores={jugadores} goleadores={goleadores} />
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
