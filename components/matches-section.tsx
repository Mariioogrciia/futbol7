"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Trophy, Shield, Edit, User, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useTeamData } from "@/components/providers/team-provider";

const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568"; // <-- pon aquí tu equipo_id

interface Match {
  id: string;
  equipo_id: string;
  rival: string;
  fecha: string;
  estado: "programado" | "en_vivo" | "finalizado";
  goles_equipo: number;
  goles_rival: number;
  resultado: string | null; // marcador "2-4"
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

function ResultBadge({ match }: { match: Match }) {
  if (match.estado !== "finalizado") return null;

  const gf = Number(match.goles_equipo ?? 0);
  const ga = Number(match.goles_rival ?? 0);

  const outcome = gf > ga ? "victoria" : gf < ga ? "derrota" : "empate";

  const config = {
    victoria: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      label: "Victoria",
    },
    derrota: {
      bg: "bg-red-500/15",
      text: "text-red-400",
      border: "border-red-500/30",
      label: "Derrota",
    },
    empate: {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      border: "border-amber-500/30",
      label: "Empate",
    },
  } as const;

  const c = config[outcome];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span
        className={cn(
          "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider",
          c.bg,
          c.text,
          c.border
        )}
      >
        {c.label}
      </span>
      <span className={cn("text-2xl font-black tabular-nums tracking-tight", c.text)}>
        {gf} - {ga}
      </span>
    </div>
  );
}


function StatusBadge({ match }: { match: Match }) {
  if (match.estado === "finalizado") return null;

  if (match.estado === "en_vivo") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            En Vivo
          </span>
        </div>
      </div>
    );
  }

  return (
    <span className="rounded-full bg-muted border border-border px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Próximo
    </span>
  );
}

function Countdown({ dateStr }: { dateStr: string }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(dateStr).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dateStr]);

  return (
    <div className="flex gap-2 sm:gap-4 mb-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-background rounded-lg text-lg sm:text-xl font-bold text-foreground shadow-inner">
            {value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] sm:text-xs uppercase text-muted-foreground mt-1.5 font-bold">{unit === 'd' ? 'Días' : unit === 'h' ? 'Hrs' : unit === 'm' ? 'Min' : 'Seg'}</span>
        </div>
      ))}
    </div>
  );
}

function NextMatchCard({ match }: { match: Match }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-accent/10 border border-accent/30 rounded-3xl p-6 sm:p-8 mb-16 shadow-[0_0_40px_rgba(20,184,106,0.1)] relative overflow-hidden group"
    >
      <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <Trophy className="w-64 h-64 text-accent" />
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 relative z-10 w-full">
        <div className="flex-1 text-center lg:text-left w-full">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 shadow-md">
            <span className="w-2 h-2 rounded-full bg-accent-foreground animate-pulse" />
            Siguiente Partido
          </div>

          <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Impersed FC <span className="text-muted-foreground mx-2 text-2xl font-normal relative -top-1 shrink-0">vs</span> <span className="text-primary-foreground">{match.rival}</span>
          </h3>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 mt-6 text-muted-foreground font-medium">
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border">
              <CalendarDays className="h-4 w-4 text-accent" />
              {new Date(match.fecha).toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border">
              <Clock className="h-4 w-4 text-accent" />
              {new Date(match.fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.estadio)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors"
            >
              <MapPin className="h-4 w-4 text-accent" />
              <span className="truncate max-w-[200px] sm:max-w-none">{match.estadio}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-accent/20 shadow-xl shrink-0 w-full sm:w-auto">
          <h4 className="text-sm font-bold text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Empieza en
          </h4>
          <Countdown dateStr={match.fecha} />
        </div>
      </div>
    </motion.div>
  );
}

function EditMatchModal({
  match,
  isOpen,
  onClose,
  jugadores,
}: {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  jugadores: Jugador[];
}) {
  const [golesEquipo, setGolesEquipo] = useState(match.goles_equipo || 0);
  const [golesRival, setGolesRival] = useState(match.goles_rival || 0);
  const [goleadores, setGoleadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGoleadorChange = (playerId: string, goals: number) => {
    setGoleadores((prev) => {
      const existing = prev.find((g) => g.id === playerId);
      if (goals > 0) {
        const player = jugadores.find((p) => p.id === playerId);
        if (existing) {
          return prev.map((g) => (g.id === playerId ? { ...g, goles: goals } : g));
        } else {
          return [
            ...prev,
            {
              id: playerId,
              nombre: player?.nombre || "",
              posicion: player?.posicion || "",
              dorsal: player?.dorsal ?? null,
              goles: goals,
            },
          ];
        }
      } else {
        return prev.filter((g) => g.id !== playerId);
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert("Sesión expirada");
        return;
      }

      const res = await fetch("/api/admin/update-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          matchId: match.id,
          golesEquipo,
          golesRival,
          goleadores,
        }),
      });

      if (!res.ok) {
        alert("Error al actualizar");
        return;
      }

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Editar Resultado: {match.rival}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Goles Impersed</label>
                <input
                  type="number"
                  value={golesEquipo}
                  onChange={(e) => setGolesEquipo(Number(e.target.value))}
                  className="w-full p-2 border rounded text-lg font-bold text-center"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Goles {match.rival}</label>
                <input
                  type="number"
                  value={golesRival}
                  onChange={(e) => setGolesRival(Number(e.target.value))}
                  className="w-full p-2 border rounded text-lg font-bold text-center"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Goleadores
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {jugadores.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-2 rounded border hover:bg-gray-50"
                  >
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      className="w-16 p-1 border rounded text-center"
                      onChange={(e) => handleGoleadorChange(player.id, Number(e.target.value))}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{player.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {player.posicion} #{player.dorsal ?? "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MatchCard({
  match,
  index,
  isAdmin,
  jugadores,
  goleadores,
}: {
  match: Match;
  index: number;
  isAdmin: boolean;
  jugadores: Jugador[];
  goleadores: GolesPartido[];
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -6, y: x * 6 });
  };

  const matchGoleadores = goleadores.filter((g) => g.partido_id === match.id);
  const gf = Number(match.goles_equipo ?? 0);
  const ga = Number(match.goles_rival ?? 0);
  const outcome = match.estado === "finalizado"
    ? (gf > ga ? "victoria" : gf < ga ? "derrota" : "empate")
    : null;

  const dotColor =
    match.estado === "finalizado"
      ? outcome === "victoria"
        ? "border-emerald-500 bg-emerald-500"
        : outcome === "derrota"
          ? "border-red-500 bg-red-500"
          : "border-amber-500 bg-amber-500"
      : match.estado === "en_vivo"
        ? "border-red-500 bg-red-500 shadow-md shadow-red-500/30"
        : "border-accent bg-accent shadow-md shadow-accent/30";

  const cardBorder =
    match.estado === "finalizado"
      ? outcome === "victoria"
        ? "border-emerald-500/30 ring-1 ring-emerald-500/10"
        : outcome === "derrota"
          ? "border-red-500/30 ring-1 ring-red-500/10"
          : "border-amber-500/30 ring-1 ring-amber-500/10"
      : match.estado === "en_vivo"
        ? "border-red-500/40 ring-1 ring-red-500/20"
        : "border-accent/40 ring-1 ring-accent/20";


  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease-out",
        }}
        className="group relative"
      >
        <div className="absolute -left-[41px] top-8 hidden lg:block">
          <div
            className={cn("h-4 w-4 rounded-full border-2 transition-colors duration-300", dotColor)}
          />
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-6",
            cardBorder
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                {new Date(match.fecha).toLocaleDateString("es-ES")}
              </span>
            </div>
            <StatusBadge match={match} />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1 w-full">
              <h3 className="text-lg font-bold text-card-foreground sm:text-xl flex flex-wrap items-center gap-x-2 leading-tight">
                <span>Impersed Cubiertas FC</span>
                <span className="text-muted-foreground font-normal text-base shrink-0">vs</span>
                <span className="break-words">{match.rival}</span>
              </h3>

              <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  {new Date(match.fecha).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground min-w-0">
                  <MapPin className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.estadio)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 hover:text-accent hover:underline transition-color"
                  >
                    Estadio: {match.estadio}
                  </a>
                </div>
              </div>

              {matchGoleadores.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Goleadores:</p>
                  <div className="flex flex-wrap gap-2">
                    {matchGoleadores.map((g) => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs font-semibold text-accent"
                      >
                        {g.nombre} ({g.goles})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-2">
              <ResultBadge match={match} />
              {isAdmin && match.estado === "en_vivo" && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-xs font-bold text-accent uppercase tracking-wider hover:bg-accent/20"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <EditMatchModal
        match={match}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        jugadores={jugadores}
      />
    </>
  );
}

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

  const getOutcome = (m: Match) => {
    const gf = Number(m.goles_equipo ?? 0);
    const ga = Number(m.goles_rival ?? 0);
    return gf > ga ? "victoria" : gf < ga ? "derrota" : "empate";
  };

  useEffect(() => {
    checkAdminStatus();
    fetchData();
  }, []);

  async function checkAdminStatus() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userData } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", session.user.id)
        .single();

      if (userData?.rol === "admin") setIsAdmin(true);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchData() {
    try {
      const res = await fetch(`/api/matches?equipo_id=${EQUIPO_ID}`);
      if (!res.ok) throw new Error("Error API /api/matches");
      const json = await res.json();

      const formattedMatches: Match[] = (json.partidos || []).map((m: any) => ({
        id: m.id,
        equipo_id: m.equipo_id,
        rival: m.rival,
        fecha: m.fecha,
        lokasion: m.lokasion,
        estado: m.estado,
        goles_equipo: m.goles_equipo || 0,
        goles_rival: m.goles_rival || 0,
        resultado: m.resultado || null,
        formato: m.formato || "liga",
        estadio: m.estadio || "FUTBOL 7 D CASA GRANDE",
      }));

      setMatches(formattedMatches);
      setGoleadores(json.goleadores || []);

      const { data: playersData, error: playersError } = await supabase
        .from("jugadores")
        .select("*")
        .eq("equipo_id", EQUIPO_ID);

      if (!playersError && playersData) {
        setJugadores(
          playersData.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            posicion: p.posicion,
            dorsal: p.dorsal,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMatches([]);
      setJugadores([]);
      setGoleadores([]);
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
  const draws = played.filter((m) => Number(m.goles_equipo) == Number(m.goles_rival)).length;
  const gf = played.reduce((sum, m) => sum + (m.goles_equipo || 0), 0);
  const ga = played.reduce((sum, m) => sum + (m.goles_rival || 0), 0);

  return (
    <section id="partidos" className="bg-secondary py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5">
            <Trophy className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-accent">
              {activeFormat === "liga" ? "Liga Futbol 7" : "Copa Futbol 7"}
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Calendario de {activeFormat === "liga" ? "Liga" : "Copa"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Todos los partidos de Impersed Cubiertas FC en la {activeFormat === "liga" ? "Liga" : "Copa"} de Futbol 7.
          </p>

          <div className="mx-auto mt-8 flex max-w-xs rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveFormat("liga")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeFormat === "liga"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              Liga
            </button>
            <button
              onClick={() => setActiveFormat("copa")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeFormat === "copa"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              Copa
            </button>
          </div>
        </motion.div>

        {played.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2">
              <span className="text-sm text-muted-foreground">PJ</span>
              <span className="text-lg font-bold text-card-foreground">{played.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card border border-emerald-500/20 px-4 py-2">
              <span className="text-sm text-emerald-400">V</span>
              <span className="text-lg font-bold text-emerald-400">{wins}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card border border-amber-500/20 px-4 py-2">
              <span className="text-sm text-amber-400">E</span>
              <span className="text-lg font-bold text-amber-400">{draws}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card border border-red-500/20 px-4 py-2">
              <span className="text-sm text-red-400">D</span>
              <span className="text-lg font-bold text-red-400">{losses}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2">
              <span className="text-sm text-muted-foreground">Goles</span>
              <span className="text-lg font-bold text-card-foreground">
                {gf} - {ga}
              </span>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-background p-1 border border-border">
            {(["todos", "proximos", "jugados"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium capitalize transition-all",
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {nextMatch && activeFilter !== "jugados" && (
          <NextMatchCard match={nextMatch} />
        )}

        <div className="relative mt-8 lg:ml-8">
          <div className="absolute left-0 top-0 hidden h-full w-px bg-border lg:block" />
          <div className="grid gap-5 lg:pl-10">
            {loading ? (
              <div className="text-center text-muted-foreground">Cargando partidos...</div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center text-muted-foreground">No hay partidos disponibles.</div>
            ) : (
              filteredMatches.map((match, i) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={i}
                  isAdmin={isAdmin}
                  jugadores={jugadores}
                  goleadores={goleadores}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
