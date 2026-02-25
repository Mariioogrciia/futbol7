"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, CheckCircle2, ChevronDown, Trophy, Users, Loader2 } from "lucide-react";

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
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.rol !== "admin" && userData.rol !== "equipo") {
      router.push("/login");
      return;
    }

    setUser(userData);
    fetchData();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestión de Partidos</h1>
          <p className="text-gray-400 mt-2 text-lg">Actualiza el resultado y asigna los goleadores de la jornada.</p>
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
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar Partido</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-gray-950 border border-gray-700 text-white py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    value={selectedMatch}
                    onChange={(e) => handleMatchSelect(e.target.value)}
                  >
                    <option value="" disabled>-- Elige un partido --</option>
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.estado === "finalizado" ? "✅" : "⏳"} vs {m.rival} ({new Date(m.fecha).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Score Inputs (Only visible if match selected) */}
              {selectedMatch && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Marcador Final
                  </h3>

                  <div className="flex items-center justify-between gap-6">
                    {/* Home (Us) */}
                    <div className="flex-1 flex flex-col items-center">
                      <label className="text-sm font-medium text-gray-400 mb-3 text-center">Nuestro Equipo</label>
                      <div className="flex items-center bg-gray-950 border border-gray-700 rounded-xl overflow-hidden shadow-inner">
                        <button
                          onClick={() => { setGolesEquipo(prev => Math.max(0, prev - 1)); setScorerCounts({}); }}
                          className="px-4 py-3 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >-</button>
                        <input
                          type="number"
                          min="0"
                          readOnly
                          className="w-16 bg-transparent text-center text-2xl font-bold text-white border-0 focus:ring-0 p-0"
                          value={golesEquipo}
                        />
                        <button
                          onClick={() => setGolesEquipo(prev => prev + 1)}
                          className="px-4 py-3 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >+</button>
                      </div>
                    </div>

                    <div className="text-xl font-black text-gray-600 self-end mb-4">VS</div>

                    {/* Away (Rival) */}
                    <div className="flex-1 flex flex-col items-center">
                      <label className="text-sm font-medium text-gray-400 mb-3 text-center">Equipo Rival</label>
                      <div className="flex items-center bg-gray-950 border border-gray-700 rounded-xl overflow-hidden shadow-inner">
                        <button
                          onClick={() => setGolesRival(prev => Math.max(0, prev - 1))}
                          className="px-4 py-3 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >-</button>
                        <input
                          type="number"
                          min="0"
                          readOnly
                          className="w-16 bg-transparent text-center text-2xl font-bold text-white border-0 focus:ring-0 p-0"
                          value={golesRival}
                        />
                        <button
                          onClick={() => setGolesRival(prev => prev + 1)}
                          className="px-4 py-3 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
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
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm h-full flex flex-col">

                  <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Goleadores del Partido
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">Asigna quién marcó nuestros {golesEquipo} goles.</p>
                    </div>

                    {/* Badge */}
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${missingScorers === 0 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                      {missingScorers === 0 ? "Completado" : `Faltan ${missingScorers}`}
                    </div>
                  </div>

                  {golesEquipo === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-950/50 rounded-xl border border-dashed border-gray-800">
                      <AlertCircle className="h-10 w-10 text-gray-600 mb-3" />
                      <p className="text-gray-400">No ganamos esta vez. No hay goles que registrar a favor.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 pb-4 max-h-[400px]">
                      {players.map((p) => {
                        const goalsAssigned = scorerCounts[p.id] || 0;
                        return (
                          <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${goalsAssigned > 0 ? "bg-primary/10 border border-primary/30" : "bg-gray-950 hover:bg-gray-800 border border-gray-800"}`}>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-xs font-bold text-gray-300">
                                {p.dorsal}
                              </span>
                              <div>
                                <p className="font-semibold text-gray-200">{p.nombre}</p>
                                <p className="text-xs text-gray-500">{p.posicion}</p>
                              </div>
                            </div>

                            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateScorer(p.id, -1)}
                                disabled={goalsAssigned === 0}
                                className="px-3 py-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 transition-colors"
                              >-</button>
                              <span className={`w-8 text-center font-bold ${goalsAssigned > 0 ? "text-primary" : "text-gray-500"}`}>
                                {goalsAssigned}
                              </span>
                              <button
                                onClick={() => updateScorer(p.id, 1)}
                                disabled={missingScorers === 0}
                                className="px-3 py-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 transition-colors"
                              >+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-gray-800">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || missingScorers !== 0}
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,184,106,0.15)] hover:shadow-[0_0_25px_rgba(20,184,106,0.3)] active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Guardando...</>
                      ) : (
                        <><Save className="h-5 w-5" /> Guardar Resultado del Partido</>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center opacity-70">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-500">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">Ningún partido seleccionado</h3>
                  <p className="text-gray-500 max-w-sm">Selecciona un partido de la lista para modificar su marcador y sus goleadores.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
