"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Save, Loader2, Camera, Trophy, Shield, CircleDollarSign, Shirt } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ModeToggle } from "@/components/mode-toggle";

export default function MiPerfil() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jugador, setJugador] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [nombre, setNombre] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Player card state
  const [fotoUrl, setFotoUrl] = useState("");
  const [posicion, setPosicion] = useState("");
  const [dorsal, setDorsal] = useState<number | "">(0);
  const [stats, setStats] = useState({ ritmo: 70, tiro: 70, pase: 70, regate: 70, defensa: 70, fisico: 70 });
  const [isSavingJugador, setIsSavingJugador] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }

      const { data: userData, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !userData) throw error || new Error("Usuario no encontrado");

      setUser({ ...userData, email: session.user.email });
      setNombre(userData.nombre || "");
      setAvatarUrl(userData.avatar_url || "");

      // If the user is linked to a player, fetch that player's data
      if (userData.jugador_id) {
        const { data: jugadorData } = await supabase
          .from("jugadores")
          .select("*")
          .eq("id", userData.jugador_id)
          .single();

        if (jugadorData) {
          setJugador(jugadorData);
          setFotoUrl(jugadorData.foto_url || "");
          setPosicion(jugadorData.posicion || "");
          setDorsal(jugadorData.dorsal ?? "");
          setStats({
            ritmo: jugadorData.stat_ritmo ?? 70,
            tiro: jugadorData.stat_tiro ?? 70,
            pase: jugadorData.stat_pase ?? 70,
            regate: jugadorData.stat_regate ?? 70,
            defensa: jugadorData.stat_defensa ?? 70,
            fisico: jugadorData.stat_fisico ?? 70,
          });
        }
      }
    } catch (e) {
      console.error(e);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ user_id: user.id, nombre, avatar_url: avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar perfil");
      showToast(data.message || "Perfil guardado con éxito", "success");
      setUser((prev: any) => ({ ...prev, nombre, avatar_url: avatarUrl }));
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jugador) return;
    setIsSavingJugador(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      const res = await fetch("/api/perfil/jugador", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          id: jugador.id,
          foto_url: fotoUrl,
          posicion,
          dorsal: Number(dorsal),
          stat_ritmo: stats.ritmo,
          stat_tiro: stats.tiro,
          stat_pase: stats.pase,
          stat_regate: stats.regate,
          stat_defensa: stats.defensa,
          stat_fisico: stats.fisico,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar tarjeta");
      showToast(data.message || "¡Tarjeta actualizada!", "success");
      setJugador((prev: any) => ({ ...prev, foto_url: fotoUrl, posicion, dorsal: Number(dorsal), stat_ritmo: stats.ritmo, stat_tiro: stats.tiro, stat_pase: stats.pase, stat_regate: stats.regate, stat_defensa: stats.defensa, stat_fisico: stats.fisico }));
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsSavingJugador(false);
    }
  };

  // Overall stat rating for display
  const overallStat = jugador
    ? Math.round((stats.ritmo + stats.tiro + stats.pase + stats.regate + stats.defensa + stats.fisico) / 6)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center py-20 px-4">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.message}
        </div>
      )}

      {/* Header Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ModeToggle />
        <button onClick={() => router.push("/")} className="px-4 py-2 bg-surface-card border border-border-default rounded-xl font-bold hover:bg-surface-card-hover transition-colors shadow-sm text-sm">
          Atrás
        </button>
      </div>

      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">Mi <span className="text-accent-primary">Perfil</span></h1>
          <p className="text-text-secondary font-medium">Personaliza tu identidad en la plataforma</p>
        </div>

        {/* ── User Profile Card ─────────────────────────── */}
        <div className="bg-surface-card border border-border-default rounded-[2.5rem] p-8 md:p-10 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent-primary via-accent-secondary to-transparent opacity-60" />

          {/* User Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-border-subtle mb-8">
            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-surface-card shadow-lg ring-2 ring-accent-primary/30" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center border-4 border-surface-card shadow-lg">
                    <User className="w-9 h-9 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Camera className="text-white w-5 h-5" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary">{user.nombre || "Usuario"}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 ${user.rol === "admin" ? "bg-red-500/10 text-red-500 border border-red-500/20" : user.rol === "equipo" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-border-default"}`}>
                    {user.rol === "admin" ? <Shield className="w-3 h-3" /> : user.rol === "equipo" ? <Trophy className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {user.rol}
                  </span>
                  <span className="text-xs text-text-muted">{user.email}</span>
                </div>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-3xl flex flex-col items-center justify-center shadow-sm shrink-0">
              <CircleDollarSign className="text-emerald-500 w-5 h-5 mb-1" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Saldo</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{user.saldo_cubiertaspoints}</span>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Nombre Visible</label>
              <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-bg-secondary border border-border-default rounded-2xl px-5 py-4 text-base font-medium text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                placeholder="Ej. Paco_Goleador" />
              <p className="text-[10px] text-text-muted mt-1.5 ml-2">Aparece en los rankings de El Oráculo.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Avatar URL</label>
              <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-bg-secondary border border-border-default rounded-2xl px-5 py-4 text-base font-medium text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                placeholder="https://i.imgur.com/tu-foto.jpg" />
              <p className="text-[10px] text-text-muted mt-1.5 ml-2">Link directo a imagen (.jpg, .png). Puedes usar Imgur.</p>
            </div>
            <button type="submit" disabled={isSavingProfile}
              className="w-full bg-accent-primary hover:bg-accent-primary-hover text-accent-contrast font-black py-4 rounded-2xl transition-all shadow-elevated flex items-center justify-center gap-2 tracking-wide disabled:opacity-50">
              {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Perfil
            </button>
          </form>
        </div>

        {/* ── Player Card Editor (only for equipo) ─────── */}
        {user.rol === "equipo" && jugador && (
          <div className="bg-surface-card border border-border-default rounded-[2.5rem] p-8 md:p-10 shadow-elevated relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-transparent opacity-60" />

            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Shirt className="text-blue-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-text-primary">Mi Tarjeta de Jugador</h3>
                <p className="text-sm text-text-secondary">Estos datos aparecen en la sección Plantilla de la web</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Live Preview Card */}
              <div className="flex flex-col items-center justify-start gap-4">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Vista Previa</p>
                <div className="relative w-[180px] h-[240px] rounded-[1.5rem] overflow-hidden shadow-2xl border-2 border-white/10 select-none"
                  style={{ background: "linear-gradient(135deg, #1a3a5c 0%, #0f2035 60%)" }}>
                  {/* Overall */}
                  <div className="absolute top-3 left-4 text-white">
                    <div className="text-4xl font-black leading-none">{overallStat}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-0.5">{posicion || "—"}</div>
                  </div>
                  {/* Player Photo */}
                  <div className="absolute bottom-0 left-0 right-0 h-[70%] flex items-end justify-center overflow-hidden">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt={nombre} className="h-full w-full object-cover object-top" />
                    ) : (
                      <div className="flex items-end justify-center h-full w-full opacity-20">
                        <User className="w-32 h-32 text-white" />
                      </div>
                    )}
                  </div>
                  {/* Name & Dorsal */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8">
                    <div className="text-white font-black text-sm truncate">{nombre || jugador.nombre}</div>
                    {dorsal !== "" && <div className="text-white/60 text-[10px] font-bold">#{dorsal}</div>}
                  </div>
                  {/* Stats mini */}
                  <div className="absolute top-3 right-3 space-y-0.5">
                    {[["RIT", stats.ritmo], ["TIR", stats.tiro], ["PAS", stats.pase], ["REG", stats.regate], ["DEF", stats.defensa], ["FIS", stats.fisico]].map(([key, val]) => (
                      <div key={key} className="flex gap-1 items-center">
                        <span className="text-[8px] font-black text-white/60 w-6 text-right">{val}</span>
                        <span className="text-[8px] font-bold text-white/40 uppercase">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Edit Form */}
              <form onSubmit={handleSaveJugador} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Foto del Jugador (URL)</label>
                  <input type="url" value={fotoUrl} onChange={e => setFotoUrl(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-default rounded-2xl px-4 py-3 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="https://i.imgur.com/foto-jugador.png" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Posición</label>
                    <select value={posicion} onChange={e => setPosicion(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-default rounded-2xl px-4 py-3 text-sm font-medium text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Seleccionar...</option>
                      <option value="POR">Portero</option>
                      <option value="DEF">Defensa</option>
                      <option value="MED">Centrocampista</option>
                      <option value="DEL">Delantero</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Dorsal</label>
                    <input type="number" min={1} max={99} value={dorsal} onChange={e => setDorsal(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-bg-secondary border border-border-default rounded-2xl px-4 py-3 text-sm font-black text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                  </div>
                </div>

                {/* Stats sliders */}
                <div className="space-y-3 mt-1">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Atributos</p>
                  {(["ritmo", "tiro", "pase", "regate", "defensa", "fisico"] as const).map(key => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-text-secondary uppercase w-14 shrink-0">{key}</span>
                      <input type="range" min={1} max={99} value={stats[key]} onChange={e => setStats(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="flex-1 h-1.5 rounded-full accent-blue-500 appearance-none bg-border-default cursor-pointer" />
                      <span className="text-sm font-black text-blue-500 w-8 text-right">{stats[key]}</span>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={isSavingJugador}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 tracking-wide disabled:opacity-50">
                  {isSavingJugador ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Guardar Tarjeta
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Message for equipo users without a linked player */}
        {user.rol === "equipo" && !jugador && (
          <div className="bg-surface-card border border-dashed border-border-default rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-3">
            <Shirt className="text-text-muted w-10 h-10 opacity-50" />
            <p className="font-black text-text-primary">Sin tarjeta de jugador vinculada</p>
            <p className="text-sm text-text-secondary max-w-xs">Pide al admin que vincule tu cuenta a tu ficha de jugador desde el Panel de Administración.</p>
          </div>
        )}
      </div>
    </div>
  );
}
