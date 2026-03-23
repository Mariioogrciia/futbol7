"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User, Save, Loader2, Camera, Trophy, Shield,
  CircleDollarSign, Shirt, Zap, Target, Wind, Move, Lock, Dumbbell,
  ChevronLeft, Upload, ImagePlus
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ModeToggle } from "@/components/mode-toggle";

const POSICION_CONFIG: Record<string, { label: string; color: string; from: string; to: string }> = {
  POR: { label: "Portero",        color: "#f59e0b", from: "#f59e0b", to: "#d97706" },
  DEF: { label: "Defensa",        color: "#3b82f6", from: "#3b82f6", to: "#2563eb" },
  MED: { label: "Centrocampista", color: "#10b981", from: "#10b981", to: "#059669" },
  DEL: { label: "Delantero",      color: "#ef4444", from: "#ef4444", to: "#dc2626" },
};

const STAT_ICONS: Record<string, any> = {
  ritmo: Wind, tiro: Target, pase: Zap, regate: Move, defensa: Lock, fisico: Dumbbell,
};

function getStatColor(v: number) {
  return v >= 80 ? "#10b981" : v >= 65 ? "#f59e0b" : "#64748b";
}

// ─── Radar SVG ─────────────────────────────────────────────────
function RadarChart({ stats }: { stats: Record<string, number> }) {
  const keys = ["ritmo", "tiro", "pase", "regate", "defensa", "fisico"] as const;
  const labels = ["RIT", "TIR", "PAS", "REG", "DEF", "FIS"];
  const n = keys.length;
  const cx = 90, cy = 90, r = 65;
  const getXY = (i: number, radius: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPaths = gridLevels.map(level => {
    const pts = Array.from({ length: n }, (_, i) => getXY(i, r * level));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
  });
  const dataPoints = keys.map((k, i) => getXY(i, (stats[k] / 99) * r));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 180 180" className="w-full max-w-[200px] mx-auto">
      {gridPaths.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="1" />)}
      {keys.map((_, i) => { const outer = getXY(i, r); return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="rgba(100,116,139,0.12)" strokeWidth="1" />; })}
      <path d={dataPath} fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" />
      {dataPoints.map((p, i) => {
        const c = getStatColor(stats[keys[i]]);
        return <g key={i}><circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="#0f172a" stroke={c} strokeWidth="1.5" /><circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2" fill={c} /></g>;
      })}
      {labels.map((lbl, i) => {
        const pos = getXY(i, r + 14);
        return (
          <g key={i}>
            <text x={pos.x.toFixed(1)} y={(pos.y - 5).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="800" letterSpacing="0.06em" fill="rgba(148,163,184,0.7)">{lbl}</text>
            <text x={pos.x.toFixed(1)} y={(pos.y + 6).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="900" fill={getStatColor(stats[["ritmo","tiro","pase","regate","defensa","fisico"][i]])}>{stats[["ritmo","tiro","pase","regate","defensa","fisico"][i]]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Image Upload Button ────────────────────────────────────────
function ImageUploadButton({
  label, preview, onFile, onUrl, urlValue, isUploading
}: {
  label: string;
  preview: string;
  onFile: (f: File) => void;
  onUrl?: (url: string) => void;
  urlValue?: string;
  isUploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUrl, setShowUrl] = useState(false);

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">{label}</label>
      <div className="flex gap-3">
        {/* Preview */}
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border-default bg-bg-secondary shrink-0 group cursor-pointer" onClick={() => inputRef.current?.click()}>
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <ImagePlus className="w-7 h-7 opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {isUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
          </div>
        </div>
        {/* Buttons */}
        <div className="flex-1 flex flex-col gap-2">
          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-default bg-bg-secondary hover:bg-surface-card-hover text-text-secondary font-bold text-xs transition-all">
            <Upload className="w-3.5 h-3.5" />
            {isUploading ? "Subiendo..." : "Subir desde galería"}
          </button>
          {onUrl && (
            <button type="button" onClick={() => setShowUrl(!showUrl)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border-default hover:border-accent-primary text-text-muted font-bold text-xs transition-all">
              <Zap className="w-3.5 h-3.5" />
              Usar URL externa
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      </div>
      {showUrl && onUrl && (
        <input type="url" value={urlValue || ""} onChange={e => onUrl(e.target.value)}
          className="w-full bg-bg-secondary border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-emerald-500 outline-none transition-all"
          placeholder="https://i.imgur.com/foto.jpg" />
      )}
    </div>
  );
}

// ─── FUT Card Preview ────────────────────────────────────────────
function PlayerPreviewCard({ fotoUrl, nombre, posicion, dorsal, stats }: { fotoUrl: string; nombre: string; posicion: string; dorsal: number | string; stats: any }) {
  const cfg = POSICION_CONFIG[posicion];
  const overall = Math.round((stats.ritmo + stats.tiro + stats.pase + stats.regate + stats.defensa + stats.fisico) / 6);
  return (
    <div className="relative w-[170px] h-[235px] rounded-[1.5rem] overflow-hidden shadow-2xl select-none mx-auto border border-white/10" style={{ background: "linear-gradient(155deg, #0f2236 0%, #091525 55%, #0a1e32 100%)" }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(255,255,255,0.5) 22px, rgba(255,255,255,0.5) 23px)" }} />
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-16 blur-3xl opacity-20 rounded-full" style={{ background: cfg?.from ?? "#10b981" }} />
      <div className="absolute top-4 left-4 z-20">
        <div className="text-5xl font-black text-white leading-none">{overall}</div>
        <div className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: cfg?.from ?? "#10b981" }}>{posicion || "—"}</div>
      </div>
      {dorsal !== "" && dorsal !== 0 && (
        <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white border border-white/10 bg-white/5">#{dorsal}</div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-[68%]">
        {fotoUrl ? <img src={fotoUrl} alt={nombre} className="w-full h-full object-cover object-top" /> : <div className="flex items-end justify-center h-full w-full opacity-10"><User className="w-24 h-24 text-white" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      </div>
      <div className="absolute bottom-2.5 left-3 right-3 z-20">
        <div className="text-white font-black text-sm truncate">{nombre || "Jugador"}</div>
        <div className="flex gap-1.5 mt-0.5 flex-wrap">
          {(["rit","tir","pas","reg","def","fis"] as const).map((k, i) => {
            const vals = [stats.ritmo, stats.tiro, stats.pase, stats.regate, stats.defensa, stats.fisico];
            return <span key={k} className="text-[7px] font-black text-white/50"><span className="text-white/80">{vals[i]}</span> {k.toUpperCase()}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function MiPerfil() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jugador, setJugador] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const [nombre, setNombre] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [posicion, setPosicion] = useState("");
  const [dorsal, setDorsal] = useState<number | "">(0);
  const [stats, setStats] = useState({ ritmo: 70, tiro: 70, pase: 70, regate: 70, defensa: 70, fisico: 70 });
  const [isSavingJugador, setIsSavingJugador] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!s) { router.push("/"); return; }
        setSession(s);
        const { data: userData } = await supabase.from("usuarios").select("*").eq("id", s.user.id).single();
        if (!userData) { router.push("/"); return; }
        setUser({ ...userData, email: s.user.email });
        setNombre(userData.nombre || "");
        setAvatarUrl(userData.avatar_url || "");
        setAvatarPreview(userData.avatar_url || "");
        if (userData.jugador_id) {
          const { data: jData } = await supabase.from("jugadores").select("*").eq("id", userData.jugador_id).single();
          if (jData) {
            setJugador(jData);
            setFotoUrl(jData.foto_url || "");
            setFotoPreview(jData.foto_url || "");
            setPosicion(jData.posicion || "");
            setDorsal(jData.dorsal ?? "");
            setStats({ ritmo: jData.stat_ritmo ?? 70, tiro: jData.stat_tiro ?? 70, pase: jData.stat_pase ?? 70, regate: jData.stat_regate ?? 70, defensa: jData.stat_defensa ?? 70, fisico: jData.stat_fisico ?? 70 });
          }
        }
      } catch (e) { router.push("/"); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const handleAvatarFileUpload = async (file: File) => {
    if (!session) return;
    setIsUploadingAvatar(true);
    try {
      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);

      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/perfil/avatar", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvatarUrl(data.url);
      setAvatarPreview(data.url);
      setUser((p: any) => ({ ...p, avatar_url: data.url }));
      window.dispatchEvent(new Event("profileUpdated"));
      showToast("✓ Foto de perfil actualizada", "success");
    } catch (e: any) {
      setAvatarPreview(avatarUrl);
      showToast(e.message || "Error al subir imagen", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFotoFileUpload = async (file: File) => {
    if (!session || !jugador) return;
    setIsUploadingFoto(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      setFotoPreview(objectUrl);

      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `avatars/jugadores/${jugador.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("galeria").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("galeria").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      await fetch("/api/players/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jugador_id: jugador.id, foto_url: publicUrl }),
      });
      setFotoUrl(publicUrl);
      setFotoPreview(publicUrl);
      showToast("✓ Foto de tarjeta actualizada", "success");
    } catch (e: any) {
      setFotoPreview(fotoUrl);
      showToast(e.message || "Error al subir foto", "error");
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session) return;
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ user_id: user.id, nombre, avatar_url: avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("✓ Perfil guardado", "success");
      setUser((p: any) => ({ ...p, nombre, avatar_url: avatarUrl }));
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setIsSavingProfile(false); }
  };

  const handleSaveJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jugador || !session) return;
    setIsSavingJugador(true);
    try {
      const res = await fetch("/api/perfil/jugador", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          id: jugador.id, foto_url: fotoUrl, posicion, dorsal: Number(dorsal),
          stat_ritmo: stats.ritmo, stat_tiro: stats.tiro, stat_pase: stats.pase,
          stat_regate: stats.regate, stat_defensa: stats.defensa, stat_fisico: stats.fisico,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("✓ Tarjeta actualizada", "success");
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setIsSavingJugador(false); }
  };

  const posConfig = POSICION_CONFIG[posicion];

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07] bg-emerald-500" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.05] bg-teal-600" />
      </div>

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-bold shadow-2xl backdrop-blur-xl ${toast.type === "success" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
          {toast.message}
        </div>
      )}

      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-50 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <span className="text-sm font-black text-text-primary tracking-tight">Mi Perfil</span>
          <ModeToggle />
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16 space-y-8">

        {/* ── Cuenta ── */}
        <section className="bg-surface-card/80 backdrop-blur-xl border border-border-default rounded-[2rem] overflow-hidden shadow-elevated">
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #10b981, #0d9488, transparent)" }} />
          <div className="p-8 md:p-10">
            {/* Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8 pb-8 border-b border-border-subtle">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-full blur-sm opacity-40" style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }} />
                  <div className="relative w-20 h-20 rounded-full border-2 border-emerald-500/30 overflow-hidden shadow-xl">
                    {avatarPreview ? <img src={avatarPreview} alt={nombre} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #064e3b, #0f766e)" }}><User className="w-8 h-8 text-emerald-300" /></div>}
                  </div>
                  <button onClick={() => (document.getElementById("avatar-file-input") as HTMLInputElement)?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-surface-card flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 transition-colors">
                    {isUploadingAvatar ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
                  </button>
                  <input id="avatar-file-input" type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleAvatarFileUpload(e.target.files[0]); }} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-primary">{user.nombre || "Usuario"}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${user.rol === "admin" ? "bg-red-500/10 text-red-400 border-red-500/20" : user.rol === "equipo" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
                      {user.rol === "admin" ? <Shield className="w-3 h-3" /> : user.rol === "equipo" ? <Trophy className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.rol}
                    </span>
                    <span className="text-xs text-text-muted">{user.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shrink-0 self-start sm:self-auto">
                <CircleDollarSign className="text-emerald-500 w-5 h-5" />
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70">Saldo</div>
                  <div className="text-xl font-black text-emerald-500 leading-none">{user.saldo_cubiertaspoints} <span className="text-xs font-bold opacity-70">CP</span></div>
                </div>
              </div>
            </div>

            {/* Profile form */}
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Avatar upload */}
              <div className="sm:col-span-2">
                <ImageUploadButton
                  label="Foto de Perfil / Avatar"
                  preview={avatarPreview}
                  onFile={handleAvatarFileUpload}
                  onUrl={url => { setAvatarUrl(url); setAvatarPreview(url); }}
                  urlValue={avatarUrl}
                  isUploading={isUploadingAvatar}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 ml-0.5">Nombre Visible</label>
                <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-default rounded-2xl px-4 py-3.5 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
                  placeholder="Ej. Paco_Goleador" />
                <p className="text-[10px] text-text-muted mt-1.5 ml-0.5">Aparece en rankings de ImpersedBet</p>
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={isSavingProfile}
                  className="w-full px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  style={{ background: "linear-gradient(135deg, #10b981, #0d9488)", color: "white" }}>
                  {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── Tarjeta de Jugador ── */}
        {user.rol === "equipo" && jugador && (
          <section className="bg-surface-card/80 backdrop-blur-xl border border-border-default rounded-[2rem] overflow-hidden shadow-elevated">
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${posConfig?.from ?? "#3b82f6"}, ${posConfig?.to ?? "#2563eb"}, transparent)` }} />
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl border" style={{ background: `${posConfig?.from ?? "#3b82f6"}15`, borderColor: `${posConfig?.from ?? "#3b82f6"}30` }}>
                  <Shirt className="w-5 h-5" style={{ color: posConfig?.from ?? "#3b82f6" }} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-primary">Tarjeta de Jugador</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Datos visibles en la sección Plantilla</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: card + radar */}
                <div className="lg:col-span-2 flex flex-col items-center gap-5">
                  <PlayerPreviewCard fotoUrl={fotoPreview} nombre={nombre} posicion={posicion} dorsal={dorsal} stats={stats} />
                  <div className="w-full bg-bg-secondary/60 border border-border-subtle rounded-2xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-center text-text-muted mb-2">Radar de Habilidades</p>
                    <RadarChart stats={stats} />
                  </div>
                </div>

                {/* Right: form */}
                <form onSubmit={handleSaveJugador} className="lg:col-span-3 flex flex-col gap-5">
                  {/* Photo file upload */}
                  <ImageUploadButton
                    label="Foto del Jugador (para la tarjeta)"
                    preview={fotoPreview}
                    onFile={handleFotoFileUpload}
                    onUrl={url => { setFotoUrl(url); setFotoPreview(url); }}
                    urlValue={fotoUrl}
                    isUploading={isUploadingFoto}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Posición</label>
                      <select value={posicion} onChange={e => setPosicion(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-default rounded-2xl px-4 py-3.5 text-sm font-medium text-text-primary outline-none appearance-none cursor-pointer focus:border-emerald-500">
                        <option value="">Seleccionar…</option>
                        <option value="POR">Portero</option>
                        <option value="DEF">Defensa</option>
                        <option value="MED">Mediocampista</option>
                        <option value="DEL">Delantero</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Dorsal</label>
                      <input type="number" min={1} max={99} value={dorsal} onChange={e => setDorsal(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full bg-bg-secondary border border-border-default rounded-2xl px-4 py-3.5 text-sm font-black text-text-primary outline-none focus:border-emerald-500" />
                    </div>
                  </div>

                  <div className="bg-bg-secondary/60 border border-border-subtle rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Estadísticas</span>
                      <div className="h-px flex-1 bg-border-subtle" />
                      <span className="text-[10px] font-black text-emerald-500">Media: {Math.round((stats.ritmo+stats.tiro+stats.pase+stats.regate+stats.defensa+stats.fisico)/6)}</span>
                    </div>
                    {(["ritmo","tiro","pase","regate","defensa","fisico"] as const).map(k => {
                      const Icon = STAT_ICONS[k];
                      const color = getStatColor(stats[k]);
                      return (
                        <div key={k} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{k}</span>
                              <span className="text-sm font-black" style={{ color }}>{stats[k]}</span>
                            </div>
                            <div className="relative h-1.5 rounded-full bg-border-default overflow-hidden">
                              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(stats[k]/99)*100}%`, background: `linear-gradient(90deg, ${color}50, ${color})` }} />
                            </div>
                            <input type="range" min={1} max={99} value={stats[k]} onChange={e => setStats(prev => ({ ...prev, [k]: +e.target.value }))}
                              className="w-full cursor-pointer mt-1.5" style={{ accentColor: color, height: "4px" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="submit" disabled={isSavingJugador}
                    className="w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${posConfig?.from ?? "#3b82f6"}, ${posConfig?.to ?? "#2563eb"})`, color: "white" }}>
                    {isSavingJugador ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Tarjeta
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {user.rol === "equipo" && !jugador && (
          <section className="bg-surface-card/80 border border-dashed border-border-default rounded-[2rem] p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-surface-card border border-border-subtle flex items-center justify-center">
              <Shirt className="text-text-muted w-7 h-7 opacity-40" />
            </div>
            <p className="font-black text-text-primary text-lg">Sin tarjeta vinculada</p>
            <p className="text-sm text-text-secondary max-w-xs">Pide al admin que vincule tu cuenta desde el Panel de Administración.</p>
          </section>
        )}
      </main>
    </div>
  );
}
