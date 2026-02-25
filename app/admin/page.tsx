"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, CheckCircle2, ChevronDown, Trophy, Users, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";


const EQUIPO_ID = "7ec6e1c6-9704-496c-ae72-a590817b9568";

type Match = {
  id: string;
  rival: string;
  fecha: string;
  estado: string;
  goles_equipo?: number;
  goles_rival?: number;
};

type Player = {
  id: string;
  nombre: string;
  posicion: string;
  dorsal: number;
};

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [golesEquipo, setGolesEquipo] = useState<number>(0);
  const [golesRival, setGolesRival] = useState<number>(0);
  const [scorerCounts, setScorerCounts] = useState<Record<string, number>>({});

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Validation
  const totalScorersAssigned = Object.values(scorerCounts).reduce((a, b) => a + b, 0);
  const missingScorers = golesEquipo - totalScorersAssigned;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!userData || (userData.rol !== "admin" && userData.rol !== "equipo")) {
        router.push("/login");
        return;
      }

      setUser({ ...userData, email: session.user.email });
      fetchData();
    };

    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      const [matchesRes, playersRes] = await Promise.all([
        fetch(`/api/matches?equipo_id=${EQUIPO_ID}&t=${Date.now()}`),
        fetch(`/api/players?equipo_id=${EQUIPO_ID}&t=${Date.now()}`),
      ]);

      if (matchesRes.ok && playersRes.ok) {
        const matchesData = await matchesRes.json();
        const playersData = await playersRes.json();
        setMatches(matchesData.partidos || []);
        setPlayers(playersData.jugadores || []);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatch(matchId);

    // Auto-fill existing data if it's already played
    const m = matches.find((x) => x.id === matchId);
    if (m && m.estado === "finalizado") {
      setGolesEquipo(m.goles_equipo || 0);
      setGolesRival(m.goles_rival || 0);
    } else {
      setGolesEquipo(0);
      setGolesRival(0);
    }
    setScorerCounts({});
  };

  const updateScorer = (playerId: string, delta: number) => {
    setScorerCounts((prev) => {
      const current = prev[playerId] || 0;
      const next = Math.max(0, current + delta);

      // Prevent assigning more goals than the team scored
      const simulatedTotal = Object.values({ ...prev, [playerId]: next }).reduce((a, b) => a + b, 0);
      if (simulatedTotal > golesEquipo) return prev;

      return { ...prev, [playerId]: next };
    });
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    if (!selectedMatch) {
      showToast("Selecciona un partido primero", "error");
      return;
    }

    if (missingScorers !== 0) {
      showToast(`Faltan ${missingScorers} goles por asignar a los jugadores`, "error");
      return;
    }

    setIsSubmitting(true);

    // Build goleadores array
    const goleadoresArray = Object.entries(scorerCounts)
      .filter(([_, qty]) => qty > 0)
      .map(([pId, qty]) => {
        const p = players.find(x => x.id === pId);
        return {
          id: pId,
          nombre: p?.nombre,
          posicion: p?.posicion,
          dorsal: p?.dorsal,
          goles: qty
        };
      });

    try {
      const res = await fetch("/api/admin/update-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch,
          golesEquipo,
          golesRival,
          goleadores: goleadoresArray
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Partido actualizado con éxito", "success");
        // Reiniciar
        setSelectedMatch("");
        setGolesEquipo(0);
        setGolesRival(0);
        setScorerCounts({});
        fetchData(); // Refrescar lista
      } else {
        showToast(data.error || "Error al guardar", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-primary/30">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-white tracking-tight">Admin<span className="text-primary">Panel</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:inline-block">Hola, <span className="text-gray-200">{user.nombre}</span></span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg transition-all font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 mt-6">

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-20 right-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border z-50 animate-in slide-in-from-top-4 fade-in ${toast.type === "success" ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200" : "bg-red-950/80 border-red-500/50 text-red-200"}`}>
            {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-900/50 p-8 rounded-3xl border border-gray-800/60 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight relative z-10 flex items-center gap-3">
            👑 Panel de Administración
          </h1>
          <p className="text-gray-400 mt-3 text-lg relative z-10 max-w-xl">
            Control de mandos de Impersed Cubiertas FC. Actualiza resultados y asigna goleadores.
          </p>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center h-64 bg-gray-900/50 rounded-2xl border border-gray-800">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-400">Cargando datos de liga...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Match selection & Score */}
            <div className="lg:col-span-5 space-y-6">

              {/* Match Selector */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2 relative z-10">
                  📅 Seleccionar Partido
                </label>
                <div className="relative z-10">
                  <select
                    className="w-full appearance-none bg-gray-950/80 border border-gray-700 text-white py-4 px-5 pr-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all shadow-inner text-base font-medium"
                    value={selectedMatch}
                    onChange={(e) => handleMatchSelect(e.target.value)}
                  >
                    <option value="" disabled>-- Elige un partido a gestionar --</option>
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.estado === "finalizado" ? "🏁" : "⏳"} vs {m.rival} ({new Date(m.fecha).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-4 h-6 w-6 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Score Inputs (Only visible if match selected) */}
              {selectedMatch && (
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent pointer-events-none" />
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                    🎯 Marcador Final
                  </h3>

                  <div className="flex items-center justify-between gap-2 sm:gap-6 relative z-10 w-full">
                    {/* Home (Us) */}
                    <div className="flex-1 flex flex-col items-center min-w-0">
                      <label className="text-xs sm:text-sm font-bold text-primary mb-3 text-center uppercase tracking-wider truncate w-full">🛡️ Nosotros</label>
                      <div className="flex items-center bg-gray-950 border border-primary/30 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(20,184,106,0.1)]">
                        <button
                          onClick={() => { setGolesEquipo(prev => Math.max(0, prev - 1)); setScorerCounts({}); }}
                          className="px-3 sm:px-5 py-4 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors active:bg-gray-700"
                        >-</button>
                        <input
                          type="number"
                          min="0"
                          readOnly
                          className="w-12 sm:w-16 bg-transparent text-center text-3xl font-black text-white border-0 focus:ring-0 p-0"
                          value={golesEquipo}
                        />
                        <button
                          onClick={() => setGolesEquipo(prev => prev + 1)}
                          className="px-3 sm:px-5 py-4 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors active:bg-gray-700"
                        >+</button>
                      </div>
                    </div>

                    <div className="text-xl sm:text-2xl font-black text-gray-600 self-end mb-5 shrink-0 px-1 sm:px-0">VS</div>

                    {/* Away (Rival) */}
                    <div className="flex-1 flex flex-col items-center min-w-0">
                      <label className="text-xs sm:text-sm font-bold text-red-400 mb-3 text-center uppercase tracking-wider truncate w-full">🔥 Rival</label>
                      <div className="flex items-center bg-gray-950 border border-red-500/30 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <button
                          onClick={() => setGolesRival(prev => Math.max(0, prev - 1))}
                          className="px-3 sm:px-5 py-4 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors active:bg-gray-700"
                        >-</button>
                        <input
                          type="number"
                          min="0"
                          readOnly
                          className="w-12 sm:w-16 bg-transparent text-center text-3xl font-black text-white border-0 focus:ring-0 p-0"
                          value={golesRival}
                        />
                        <button
                          onClick={() => setGolesRival(prev => prev + 1)}
                          className="px-3 sm:px-5 py-4 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors active:bg-gray-700"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Goal Scorers */}
            <div className="lg:col-span-7">
              {selectedMatch ? (
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-transparent" />

                  <div className="flex justify-between items-center mb-6 border-b border-gray-800/60 pb-5">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        ⚽ Goleadores del Partido
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">Asigna quién marcó nuestros <strong className="text-primary text-base">{golesEquipo}</strong> goles.</p>
                    </div>

                    {/* Badge */}
                    <div className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors shadow-sm ${golesEquipo === 0 ? "bg-gray-800/50 text-gray-400 border border-gray-700/50" : missingScorers === 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                      {golesEquipo === 0 ? "⏳ Esperando goles..." : missingScorers === 0 ? "✅ ¡Completado!" : `⚠️ Faltan ${missingScorers}`}
                    </div>
                  </div>

                  {golesEquipo === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-950/50 rounded-2xl border border-dashed border-gray-800/60">
                      <span className="text-5xl mb-4 opacity-80">⚽</span>
                      <p className="text-gray-300 font-bold text-lg">Aún no hay goles de nuestro equipo.</p>
                      <p className="text-gray-500 mt-2 font-medium">Aumenta nuestro marcador en la izquierda para poder asignar goleadores.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto pr-3 space-y-3 pb-4 max-h-[450px] custom-scrollbar">
                      {players.map((p) => {
                        const goalsAssigned = scorerCounts[p.id] || 0;
                        return (
                          <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${goalsAssigned > 0 ? "bg-primary/15 border border-primary/40 shadow-[0_0_15px_rgba(20,184,106,0.1)] scale-[1.01]" : "bg-gray-950/50 hover:bg-gray-800/80 border border-gray-800/60 hover:border-gray-700"}`}>
                            <div className="flex items-center gap-4">
                              <span className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-black shadow-inner ${goalsAssigned > 0 ? "bg-primary text-gray-950" : "bg-gray-800 text-gray-300"}`}>
                                {p.dorsal}
                              </span>
                              <div>
                                <p className={`font-bold ${goalsAssigned > 0 ? "text-white" : "text-gray-200"}`}>{p.nombre}</p>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">{p.posicion}</p>
                              </div>
                            </div>

                            <div className="flex items-center bg-gray-950 border border-gray-700/80 rounded-xl overflow-hidden shadow-inner shrink-0">
                              <button
                                onClick={() => updateScorer(p.id, -1)}
                                disabled={goalsAssigned === 0}
                                className="px-4 py-3 hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 transition-colors focus:outline-none"
                              >-</button>
                              <span className={`w-10 text-center font-black text-lg ${goalsAssigned > 0 ? "text-primary" : "text-gray-500"}`}>
                                {goalsAssigned > 0 ? goalsAssigned : "0"}
                              </span>
                              <button
                                onClick={() => updateScorer(p.id, 1)}
                                disabled={missingScorers === 0}
                                className="px-4 py-3 hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 transition-colors focus:outline-none"
                              >+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-gray-800/60">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || missingScorers !== 0}
                      className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,184,106,0.2)] hover:shadow-[0_0_30px_rgba(20,184,106,0.4)] active:scale-[0.98] text-lg"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-6 w-6 animate-spin" /> Guardando...</>
                      ) : (
                        <><Save className="h-6 w-6" /> Guardar Resultado del Partido</>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800/60 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
                  <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
                    <div className="absolute inset-0 rounded-full border border-gray-700 animate-[spin_10s_linear_infinite]" />
                    <span className="text-4xl animate-bounce">⚽</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-200 mb-3 relative z-10">Ningún partido seleccionado</h3>
                  <p className="text-gray-500 max-w-sm text-lg relative z-10">Selecciona un partido de la lista en la izquierda para comenzar a gestionar el resultado y los goleadores de la jornada.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
