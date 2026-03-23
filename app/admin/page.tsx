"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, CheckCircle2, ChevronDown, Trophy, Users, Loader2, CalendarHeart, ImagePlus, UploadCloud, CircleDollarSign, RotateCcw, UserPlus, Pencil, Trash2, X, Coins } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ModeToggle } from "@/components/mode-toggle";


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

  // Tabs State
  // Form State
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [golesEquipo, setGolesEquipo] = useState<number>(0);
  const [golesRival, setGolesRival] = useState<number>(0);
  const [scorerCounts, setScorerCounts] = useState<Record<string, number>>({});
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Convocatorias State
  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [loadingConvocatorias, setLoadingConvocatorias] = useState(false);

  // Gallery Upload State
  const [activeTab, setActiveTab] = useState<"resultados" | "asistencia" | "galeria" | "apuestas" | "usuarios">("resultados");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Apuestas State
  const [apuestas, setApuestas] = useState<any[]>([]);
  const [loadingApuestas, setLoadingApuestas] = useState(false);

  // Usuarios State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ nombre: '', email: '', password: '', rol: 'espectador', jugador_id: '' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Validation
  const totalScorersAssigned = Object.values(scorerCounts).reduce((a, b) => a + b, 0);
  const missingScorers = golesEquipo - totalScorersAssigned;

  // New Apuestas States
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendiente' | 'ganada' | 'perdida' | 'nula'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBetId, setExpandedBetId] = useState<string | null>(null);

  // New Usuarios States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<'all' | 'admin' | 'equipo' | 'espectador'>('all');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!userData || (userData.rol !== "admin" && userData.rol !== "equipo")) {
        router.push("/");
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

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres salir del panel de administración?',
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await supabase.auth.signOut();
        router.push("/");
      }
    });
  };

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatch(matchId);

    // Auto-fill existing data if it's already played or live
    const m = matches.find((x) => x.id === matchId);
    if (m && (m.estado === "finalizado" || m.estado === "en_juego")) {
      setGolesEquipo(m.goles_equipo || 0);
      setGolesRival(m.goles_rival || 0);
    } else {
      setGolesEquipo(0);
      setGolesRival(0);
    }
    setScorerCounts({});

    // Fetch convocatorias for this match
    if (activeTab === "asistencia") {
      fetchConvocatorias(matchId);
    }
  };

  const fetchConvocatorias = async (matchId: string) => {
    setLoadingConvocatorias(true);
    try {
      const res = await fetch(`/api/admin/convocatorias?partido_id=${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setConvocatorias(data.convocatorias || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConvocatorias(false);
    }
  };

  const fetchApuestas = async (matchId?: string) => {
    setLoadingApuestas(true);
    try {
      const url = matchId ? `/api/admin/apuestas?partido_id=${matchId}` : `/api/admin/apuestas`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setApuestas(data.apuestas || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApuestas(false);
    }
  };

  const fetchAdminUsers = async () => {
    setLoadingAdminUsers(true);
    try {
      const res = await fetch('/api/admin/usuarios');
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.usuarios || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const validateBet = async (betId: string, newState: 'ganada' | 'perdida' | 'nula') => {
    try {
      const res = await fetch('/api/admin/apuestas/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet_id: betId, nuevo_estado: newState })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al validar');
      showToast(`Marcada como ${newState.toUpperCase()}`, 'success');
      
      // Refresh bets depending on the view
      if (activeTab === 'apuestas') {
        fetchApuestas();
      } else if (selectedMatch) {
        fetchApuestas(selectedMatch);
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Escuchar cambio de tab para re-cargar convocatorias o apuestas
  useEffect(() => {
    if (activeTab === "asistencia" && selectedMatch) {
      fetchConvocatorias(selectedMatch);
    }
    if (activeTab === "apuestas") {
      // Fetch all bets globally when switching to Apuestas tab
      fetchApuestas();
    }
    if (activeTab === "usuarios") {
      fetchAdminUsers();
    }
  }, [activeTab]);

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

  const handleLiveAction = async (action: "en_juego" | "finalizado" | "update") => {
    if (!selectedMatch) return;
    setIsLiveLoading(true);

    const match = matches.find(m => m.id === selectedMatch);
    if (!match) return;

    let nextState = match.estado;
    if (action === "en_juego") nextState = "en_juego";
    if (action === "finalizado") nextState = "finalizado";

    try {
      const res = await fetch("/api/admin/live-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch,
          golesEquipo,
          golesRival,
          estado: nextState
        })
      });

      if (res.ok) {
        showToast(action === "update" ? "Marcador sincronizado en directo" : `Partido ${action === "en_juego" ? "EN DIRECTO" : "FINALIZADO"}`, "success");
        setMatches(matches.map(m => m.id === selectedMatch ? { ...m, estado: nextState, goles_equipo: golesEquipo, goles_rival: golesRival } : m));
      } else {
        const data = await res.json();
        showToast(data.error || "Error al actualizar marcador en vivo", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Error al conectar", "error");
    } finally {
      setIsLiveLoading(false);
    }
  };

  const handleResetPoints = async (userId: string, currentName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Restablecer Puntos',
      message: `¿Estás seguro de que quieres restablecer los CubiertasPoints a 1000 para el usuario ${currentName}?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch('/api/admin/usuarios/reset-points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: userId, cantidad: 1000 })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error al restablecer puntos');
          showToast(data.message, 'success');
          fetchAdminUsers();
        } catch (e: any) {
          showToast(e.message, 'error');
        }
      }
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const res = await fetch('/api/admin/usuarios/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
      
      showToast(data.message, 'success');
      setNewUser({ nombre: '', email: '', password: '', rol: 'espectador', jugador_id: '' });
      setShowCreateUser(false);
      fetchAdminUsers();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, currentName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Borrar Usuario',
      message: `¿Estás súper seguro de que quieres BORRAR DEFINITIVAMENTE al usuario ${currentName}? Esto eliminará su cuenta, acceso y todo su historial.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/usuarios/borrar?id=${userId}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error al borrar usuario');
          showToast(data.message, 'success');
          fetchAdminUsers();
        } catch (e: any) {
          showToast(e.message, 'error');
        }
      }
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdatingUser(true);
    try {
      const res = await fetch('/api/admin/usuarios/editar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          nombre: editingUser.nombre,
          email: editingUser.email,
          rol: editingUser.rol,
          jugador_id: editingUser.jugador_id,
          saldo_cubiertaspoints: editingUser.saldo_cubiertaspoints,
          // only send password if changed, backend handles if it is empty string
          ...(editingUser.password ? { password: editingUser.password } : {})
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario');
      showToast(data.message, 'success');
      setEditingUser(null);
      fetchAdminUsers();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdatingUser(false);
    }
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

  const handleImageUpload = async () => {
    if (!uploadFile) {
      showToast("Selecciona una imagen primero", "error");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('galeria')
        .upload(filePath, uploadFile);

      if (uploadError) {
        throw uploadError;
      }

      showToast("Imagen subida correctamente", "success");
      setUploadFile(null); // reset
      const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (e: any) {
      showToast(e.message || "Error al subir la imagen", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const selectedMatchData = matches.find(m => m.id === selectedMatch);

  if (!user) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050B14] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30 transition-colors duration-500 flex flex-col relative">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[25%] -right-[10%] w-[50%] h-[50%] bg-emerald-900/10 dark:bg-emerald-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-teal-900/10 dark:bg-teal-900/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Navbar Premium */}
      <nav className="border-b border-border-subtle bg-surface-card/60 backdrop-blur-2xl sticky top-0 z-50 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-br from-emerald-400 to-teal-600 p-2.5 rounded-2xl shadow-lg border border-white/10">
                <Trophy className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black text-text-primary tracking-tighter">
              Admin<span className="text-emerald-500 font-medium">Panel</span>
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-sm font-medium text-text-secondary hidden sm:inline-block tracking-wide">
              Bienvenido, <span className="text-text-primary font-bold">{user.nombre}</span>
            </span>
            <div className="h-6 w-px bg-border-subtle hidden sm:block"></div>
            <ModeToggle />
            <button
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-widest bg-surface-card/50 dark:bg-surface-card/50 text-text-secondary hover:bg-surface-card-hover hover:text-text-primary dark:hover:bg-surface-card-hover dark:hover:text-text-primary border border-border-default px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8 flex-1">

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-20 right-4 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border z-50 animate-in slide-in-from-top-4 fade-in ${toast.type === "success" ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200 backdrop-blur-xl" : "bg-red-950/90 border-red-500/30 text-red-200 backdrop-blur-xl"}`}>
            {toast.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-red-400" />}
            <span className="font-semibold">{toast.message}</span>
          </div>
        )}

        <div className="mb-10 lg:mb-14 relative z-10 w-full rounded-[2.5rem] bg-surface-card/80 dark:bg-surface-card/80 border border-border-default p-10 sm:p-14 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl">
          {/* Cinematic Overlays */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-blue-500/5 to-transparent rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          <div className="absolute inset-0 border-t border-white/[0.08] rounded-[2.5rem] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Control
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter leading-[1.1]">
              Panel Central <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">
                Impersed Cubiertas
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-text-secondary font-medium leading-relaxed max-w-2xl">
              Dirección técnica y gestión en tiempo real. Control absoluto sobre resultados, convocatorias, galería de imágenes y el centro de apuestas de la liga.
            </p>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center h-64 bg-surface-card/50 dark:bg-surface-card/50 rounded-2xl border border-border-default">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-text-secondary font-medium">Cargando datos de liga...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Left Column: Match selection & Setup */}
            <div className="lg:col-span-4 space-y-6">

              {/* TABS */}
              <div className="grid grid-cols-2 sm:flex sm:flex-row lg:flex-col bg-surface-card/50 dark:bg-surface-card/50 p-3 rounded-2xl sm:rounded-full lg:rounded-[2rem] border border-border-default shadow-sm backdrop-blur-2xl gap-2 relative z-10 w-full">
                <button
                  onClick={() => setActiveTab("resultados")}
                  className={`group relative flex-1 flex items-center gap-4 py-4 px-6 rounded-xl sm:rounded-full lg:rounded-2xl transition-all duration-500 overflow-hidden ${activeTab === "resultados" ? "bg-surface-card dark:bg-surface-card/5 text-emerald-600 dark:text-emerald-400 shadow-[0_8px_20px_rgb(0,0,0,0.05)] dark:shadow-none border border-border-default" : "text-text-secondary hover:bg-surface-card/50 dark:hover:bg-surface-card/[0.02]"}`}
                >
                  {activeTab === "resultados" && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />}
                  <Trophy className={`h-5 w-5 shrink-0 transition-transform duration-300 ${activeTab === "resultados" ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="font-bold tracking-wide text-xs sm:text-sm">Resultados</span>
                </button>
                <button
                  onClick={() => setActiveTab("asistencia")}
                  className={`group relative flex-1 flex items-center gap-4 py-4 px-6 rounded-xl sm:rounded-full lg:rounded-2xl transition-all duration-500 overflow-hidden ${activeTab === "asistencia" ? "bg-surface-card dark:bg-surface-card/5 text-blue-600 dark:text-blue-400 shadow-[0_8px_20px_rgb(0,0,0,0.05)] dark:shadow-none border border-border-default" : "text-text-secondary hover:bg-surface-card/50 dark:hover:bg-surface-card/[0.02]"}`}
                >
                  {activeTab === "asistencia" && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />}
                  <CalendarHeart className={`h-5 w-5 shrink-0 transition-transform duration-300 ${activeTab === "asistencia" ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="font-bold tracking-wide text-xs sm:text-sm">Asistencia</span>
                </button>
                <button
                  onClick={() => setActiveTab("galeria")}
                  className={`group relative flex-1 flex items-center gap-4 py-4 px-6 rounded-xl sm:rounded-full lg:rounded-2xl transition-all duration-500 overflow-hidden ${activeTab === "galeria" ? "bg-surface-card dark:bg-surface-card/5 text-purple-600 dark:text-purple-400 shadow-[0_8px_20px_rgb(0,0,0,0.05)] dark:shadow-none border border-border-default" : "text-text-secondary hover:bg-surface-card/50 dark:hover:bg-surface-card/[0.02]"}`}
                >
                  {activeTab === "galeria" && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full" />}
                  <ImagePlus className={`h-5 w-5 shrink-0 transition-transform duration-300 ${activeTab === "galeria" ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="font-bold tracking-wide text-xs sm:text-sm">Galería</span>
                </button>
                <button
                  onClick={() => setActiveTab("apuestas")}
                  className={`group relative flex-1 flex items-center gap-4 py-4 px-6 rounded-xl sm:rounded-full lg:rounded-2xl transition-all duration-500 overflow-hidden ${activeTab === "apuestas" ? "bg-surface-card dark:bg-surface-card/5 text-emerald-600 dark:text-emerald-400 shadow-[0_8px_20px_rgb(0,0,0,0.05)] dark:shadow-none border border-border-default" : "text-text-secondary hover:bg-surface-card/50 dark:hover:bg-surface-card/[0.02]"}`}
                >
                  {activeTab === "apuestas" && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />}
                  <CircleDollarSign className={`h-5 w-5 shrink-0 transition-transform duration-300 ${activeTab === "apuestas" ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="font-bold tracking-wide text-xs sm:text-sm">Apuestas</span>
                </button>
                <button
                  onClick={() => setActiveTab("usuarios")}
                  className={`group relative flex-1 flex items-center gap-4 py-4 px-6 rounded-xl sm:rounded-full lg:rounded-2xl transition-all duration-500 overflow-hidden ${activeTab === "usuarios" ? "bg-surface-card dark:bg-surface-card/5 text-amber-600 dark:text-amber-400 shadow-[0_8px_20px_rgb(0,0,0,0.05)] dark:shadow-none border border-border-default" : "text-text-secondary hover:bg-surface-card/50 dark:hover:bg-surface-card/[0.02]"}`}
                >
                  {activeTab === "usuarios" && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full" />}
                  <Users className={`h-5 w-5 shrink-0 transition-transform duration-300 ${activeTab === "usuarios" ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="font-bold tracking-wide text-xs sm:text-sm">Usuarios</span>
                </button>
              </div>

              {/* Match Selector (Only for Asistencia and Resultados and Apuestas) */}
              {(activeTab === "resultados" || activeTab === "asistencia" || activeTab === "apuestas") && (
                <div className="bg-surface-card/80 dark:bg-surface-card/80 border border-border-default rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden group transition-all duration-500 flex flex-col gap-5 z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div>
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">Contexto de Gestión</h3>
                    <label className="block text-xl font-bold text-text-primary tracking-tight relative z-10">
                      Selecciona un Partido
                    </label>
                  </div>

                  <div className="relative z-10 w-full group/select">
                    <select
                      className="w-full appearance-none bg-surface-card/50 dark:bg-surface-card/50 backdrop-blur-md border border-border-default text-text-primary py-4 px-5 pr-12 rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm font-semibold group-hover/select:border-border-hover dark:group-hover/select:border-border-hover cursor-pointer shadow-inner"
                      value={selectedMatch}
                      onChange={(e) => handleMatchSelect(e.target.value)}
                    >
                      <option value="" disabled className="text-text-secondary">-- Menú de Temporada --</option>
                      {matches.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.estado === "finalizado" ? "🏁" : m.estado === "en_juego" ? "🔴 [LIVE]" : "⏳"} vs {m.rival} ({new Date(m.fecha).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-card/50 dark:bg-surface-card/5 flex items-center justify-center pointer-events-none transition-colors group-hover/select:bg-surface-card-hover dark:group-hover/select:bg-surface-card-hover">
                        <ChevronDown className="h-4 w-4 text-text-secondary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Score Inputs (Only visible if match selected and in Results tab) */}
              {selectedMatch && activeTab === "resultados" && (() => {
                const match = matches.find(m => m.id === selectedMatch);
                if (!match) return null;

                return (
                  <div className="bg-surface-card/80 dark:bg-surface-card/80 border border-border-default rounded-[2rem] p-6 lg:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden transition-all duration-500 mt-6 lg:mt-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.03] to-transparent pointer-events-none" />
                    <h4 className="text-[10px] font-black text-text-secondary dark:text-emerald-500/70 uppercase tracking-[0.2em] flex items-center gap-3 relative z-10">
                      Control de Marcador
                    </h4>

                    {/* Fila Equipos (Top) */}
                    <div className="flex justify-between items-center text-center relative z-10">
                      <span className="flex-1 font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-xs truncate pr-2">Nosotros</span>
                      <span className="px-3 py-1 bg-surface-card-hover dark:bg-surface-card-hover border border-border-default rounded-full font-black text-[10px] text-text-secondary shrink-0">VS</span>
                      <span className="flex-1 font-black text-text-primary uppercase tracking-wide text-xs truncate pl-2">{match.rival}</span>
                    </div>

                    {/* Fila Marcadores (Main) */}
                    <div className="grid grid-cols-2 gap-4 items-center relative z-10">
                      {/* Bloque Local */}
                      <div className="flex items-center justify-between p-3 bg-bg-secondary/50 dark:bg-surface-card/30 rounded-2xl border border-border-subtle">
                        <button 
                          onClick={() => { setGolesEquipo(prev => Math.max(0, prev - 1)); setScorerCounts({}); }}
                          className="w-12 h-12 flex items-center justify-center bg-surface-card dark:bg-surface-card border border-border-default rounded-xl hover:bg-emerald-500/10 active:scale-95 transition-all text-xl font-black text-text-secondary hover:text-emerald-500"
                        >-</button>
                        <div className="text-5xl lg:text-6xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{golesEquipo}</div>
                        <button 
                          onClick={() => { setGolesEquipo(prev => prev + 1); setScorerCounts({}); }}
                          className="w-12 h-12 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-xl active:scale-95 transition-all text-xl font-black"
                        >+</button>
                      </div>

                      {/* Bloque Rival */}
                      <div className="flex items-center justify-between p-3 bg-bg-secondary/50 dark:bg-surface-card/30 rounded-2xl border border-border-subtle">
                        <button 
                          onClick={() => setGolesRival(prev => Math.max(0, prev - 1))}
                          className="w-12 h-12 flex items-center justify-center bg-surface-card dark:bg-surface-card border border-border-default rounded-xl hover:bg-surface-card-hover active:scale-95 transition-all text-xl font-black text-text-secondary"
                        >-</button>
                        <div className="text-5xl lg:text-6xl font-black text-text-primary font-mono">{golesRival}</div>
                        <button 
                          onClick={() => setGolesRival(prev => prev + 1)}
                          className="w-12 h-12 flex items-center justify-center bg-surface-card dark:bg-surface-card border border-border-default rounded-xl hover:bg-surface-card-hover active:scale-95 transition-all text-xl font-black text-text-primary"
                        >+</button>
                      </div>
                    </div>

                    {/* Botón Guardar */}
                    <button 
                      onClick={() => handleLiveAction("update")}
                      disabled={isLiveLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-black py-4 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 relative z-10 text-sm uppercase tracking-wider"
                    >
                      {isLiveLoading ? 'Guardando...' : 'Guardar resultado'}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Actions */}
            <div className="lg:col-span-8 flex flex-col h-full">
              {activeTab === "apuestas" ? (
                // Always render the Apuestas panel regardless of selectedMatch
                <div className="bg-surface-card/80 dark:bg-surface-card/80 border border-border-default rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden transition-all duration-500 min-h-[500px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent opacity-50" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-border-subtle pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <CircleDollarSign className="text-emerald-500 h-6 w-6 shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-text-primary tracking-tight">Registro General de Apuestas</h3>
                        <p className="text-sm text-text-secondary mt-1 font-medium">Centro de control global de todas las apuestas.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => fetchApuestas()} className="bg-surface-card-hover hover:bg-surface-card-active text-text-secondary dark:text-text-primary border border-border-default px-4 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 text-xs uppercase tracking-widest shrink-0">
                        Actualizar
                      </button>
                    </div>
                  </div>

                  {/* Barra de Filtros y Búsqueda */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-surface-card/30 p-4 rounded-2xl border border-border-subtle backdrop-blur-md">
                    <div className="flex flex-wrap items-center gap-2">
                      {(['all', 'pendiente', 'ganada', 'perdida', 'nula'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                            filterStatus === status 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10' 
                              : 'bg-surface-card/50 text-text-secondary border-border-default hover:bg-surface-card-hover hover:text-text-primary'
                          }`}
                        >
                          {status === 'all' ? 'Todos' : status}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Buscar por usuario u opción..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-card/50 border border-border-default rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-text-primary focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      </div>
                    </div>
                  </div>

                  {loadingApuestas ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] h-10 w-10" /></div>
                  ) : (
                    <div className="space-y-3">
                      {apuestas
                        .filter(b => b.mercado_id === 'combinada' || !b.mercado_id.startsWith('comb_'))
                        .filter(b => filterStatus === 'all' || b.estado === filterStatus)
                        .filter(b => {
                          if (!searchQuery) return true;
                          const s = searchQuery.toLowerCase();
                          return b.usuario?.nombre?.toLowerCase().includes(s) || 
                                 b.opcion_label?.toLowerCase().includes(s) || 
                                 b.partido?.rival?.toLowerCase().includes(s);
                        }).length > 0 ? (
                        apuestas
                          .filter(b => b.mercado_id === 'combinada' || !b.mercado_id.startsWith('comb_'))
                          .filter(b => filterStatus === 'all' || b.estado === filterStatus)
                          .filter(b => {
                            if (!searchQuery) return true;
                            const s = searchQuery.toLowerCase();
                            return b.usuario?.nombre?.toLowerCase().includes(s) || 
                                   b.opcion_label?.toLowerCase().includes(s) || 
                                   b.partido?.rival?.toLowerCase().includes(s);
                          })
                          .map(bet => {
                            const isCombinada = bet.mercado_id === 'combinada';
                            const children = isCombinada ? apuestas.filter(c => c.mercado_id === `comb_${bet.id}`) : [];
                            const isExpanded = expandedBetId === bet.id;

                            return (
                              <div key={bet.id} className={`flex flex-col bg-surface-card dark:bg-surface-card rounded-2xl border ${isExpanded ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5' : 'border-border-default hover:border-border-hover'} transition-all duration-300 overflow-hidden`}>
                                {/* Header Colapsable */}
                                <div 
                                  onClick={() => setExpandedBetId(isExpanded ? null : bet.id)}
                                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-surface-card-hover/20 transition-colors gap-4"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                                      {bet.usuario?.nombre ? bet.usuario.nombre.charAt(0).toUpperCase() : 'H'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-text-primary text-sm tracking-tight truncate">{bet.usuario?.nombre || 'Hooligan'}</span>
                                        {isCombinada && (
                                          <span className="px-2 py-0.5 text-[8px] font-black tracking-widest rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase">
                                            Comb ({children.length})
                                          </span>
                                        )}
                                        {bet.partido?.rival && (
                                          <span className="px-2 py-0.5 text-[8px] font-bold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 uppercase">
                                            vs {bet.partido.rival}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-text-secondary truncate mt-0.5">{bet.opcion_label}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex items-center gap-4">
                                      <div className="flex flex-col items-start sm:items-end">
                                        <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Apostado</span>
                                        <span className="text-xs font-black text-text-primary"><span className="text-emerald-500">{bet.cantidad_apostada}</span> CP</span>
                                      </div>
                                      <div className="flex flex-col items-start sm:items-end">
                                        <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Retorno</span>
                                        <span className="text-xs font-black text-emerald-500">{bet.ganancia_potencial.toFixed(1)} CP</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className={`px-3 py-1 text-[9px] font-black tracking-wider rounded-lg border uppercase ${
                                        bet.estado === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                        bet.estado === 'ganada' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                      }`}>
                                        {bet.estado}
                                      </span>
                                      <div className={`text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Detalle Expandible */}
                                {isExpanded && (
                                  <div className="border-t border-border-subtle bg-surface-card/30 p-5 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                    {isCombinada && children.length > 0 ? (
                                      <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Selecciones ({children.length})</h4>
                                        <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                                          {children.map(child => (
                                            <div key={child.id} className="flex justify-between items-center bg-surface-card p-3 rounded-xl border border-border-default shadow-sm hover:shadow-md transition-all">
                                              <div className="flex flex-col">
                                                <span className="text-xs font-bold text-text-primary">{child.opcion_label}</span>
                                                <span className="text-[10px] font-black text-emerald-500 mt-0.5">Cuota: {child.cuota}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                {child.estado !== 'pendiente' ? (
                                                  <span className={`px-2 py-0.5 text-[8px] font-black rounded-md uppercase ${child.estado === 'ganada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {child.estado}
                                                  </span>
                                                ) : bet.estado !== 'pendiente' ? null : (
                                                  <div className="flex gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); validateBet(child.id, 'ganada'); }} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg transition-colors border border-emerald-500/20 text-[10px]">✅</button>
                                                    <button onClick={(e) => { e.stopPropagation(); validateBet(child.id, 'perdida'); }} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-colors border border-red-500/20 text-[10px]">❌</button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Detalle de la Cuota</span>
                                        <p className="text-sm font-bold text-text-primary mt-0.5">Cuota: <span className="text-emerald-500">{bet.cuota}</span></p>
                                      </div>
                                    )}

                                    {!isCombinada && bet.estado === 'pendiente' && (
                                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                                        <button onClick={(e) => { e.stopPropagation(); validateBet(bet.id, 'ganada'); }} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-black rounded-xl text-xs transition-colors border border-emerald-500/20 uppercase tracking-widest">✅ Ganada</button>
                                        <button onClick={(e) => { e.stopPropagation(); validateBet(bet.id, 'perdida'); }} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black rounded-xl text-xs transition-colors border border-red-500/20 uppercase tracking-widest">❌ Perdida</button>
                                        <button onClick={(e) => { e.stopPropagation(); validateBet(bet.id, 'nula'); }} className="px-4 py-2 bg-surface-card-hover hover:bg-surface-card-active text-text-secondary font-black rounded-xl text-xs transition-colors border border-border-default uppercase tracking-widest">➖ Nula</button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-card/50 dark:bg-surface-card/50 rounded-2xl border border-dashed border-border-default">
                            <span className="text-4xl opacity-50 mb-3">🔍</span>
                            <p className="text-text-primary font-black text-lg tracking-tight">Sin resultados</p>
                            <p className="text-text-secondary font-medium text-xs mt-1">Intenta con otros filtros o términos de búsqueda.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeTab === "usuarios" ? (
                <div className="bg-surface-card/80 dark:bg-surface-card/80 border border-border-default rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden transition-all duration-500 min-h-[500px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-transparent opacity-50" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-border-subtle pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                          <Users className="text-amber-500 h-6 w-6 shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-text-primary tracking-tight">Gestión de Usuarios</h3>
                        <p className="text-sm text-text-secondary mt-1 font-medium">Control de accesos y CubiertasPoints.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowCreateUser(!showCreateUser)}
                      className={`px-5 py-3 rounded-xl font-black transition-all shadow-sm flex items-center gap-2 text-xs uppercase tracking-widest shrink-0 ${showCreateUser ? 'bg-surface-card-hover text-text-primary border border-border-default' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'}`}
                    >
                      <UserPlus className="w-4 h-4" /> {showCreateUser ? 'Cancelar' : 'Crear Usuario'}
                    </button>
                  </div>

                  {/* Métricas Resumen */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { 
                        title: 'Total Usuarios', 
                        value: adminUsers.length, 
                        icon: Users, 
                        color: 'from-amber-500 to-yellow-500', 
                        bgColor: 'bg-amber-500/10 border-amber-500/20' 
                      },
                      { 
                        title: 'Jugadores', 
                        value: adminUsers.filter(u => u.rol === 'equipo').length, 
                        icon: UserPlus, 
                        color: 'from-blue-500 to-cyan-500', 
                        bgColor: 'bg-blue-500/10 border-blue-500/20' 
                      },
                      { 
                        title: 'Espectadores', 
                        value: adminUsers.filter(u => u.rol === 'espectador').length, 
                        icon: Users, 
                        color: 'from-purple-500 to-pink-500', 
                        bgColor: 'bg-purple-500/10 border-purple-500/20' 
                      },
                      { 
                        title: 'Saldo CP Total', 
                        value: `${adminUsers.reduce((sum, u) => sum + (u.saldo_cubiertaspoints || 0), 0)}`, 
                        icon: Coins, 
                        color: 'from-emerald-500 to-teal-500', 
                        bgColor: 'bg-emerald-500/10 border-emerald-500/20' 
                      }
                    ].map((item, index) => (
                      <div key={index} className={`p-4 rounded-2xl border ${item.bgColor} backdrop-blur-md flex items-center justify-between shadow-sm hover:shadow-md transition-all group`}>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black tracking-widest text-text-secondary uppercase">{item.title}</span>
                          <span className={`text-xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent mt-1 group-hover:scale-105 transition-transform origin-left`}>{item.value}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-md shadow-inner`}>
                          <item.icon className="w-4 h-4 text-zinc-950" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Create User Form */}
                  {showCreateUser && (
                    <div className="mb-8 p-6 bg-surface-card/50 dark:bg-surface-card/50 rounded-2xl border border-amber-500/20 shadow-sm animate-in slide-in-from-top-2 fade-in">
                      <h4 className="text-sm font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-amber-500" /> Nuevo Usuario
                      </h4>
                      <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Nombre</label>
                          <input required type="text" value={newUser.nombre} onChange={e => setNewUser({...newUser, nombre: e.target.value})} className="w-full bg-surface-card border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Mario García" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Email</label>
                          <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-surface-card border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="mario@ejemplo.com" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Contraseña</label>
                          <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-surface-card border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="••••••••" minLength={6} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Rol</label>
                          <select value={newUser.rol} onChange={e => setNewUser({...newUser, rol: e.target.value, jugador_id: e.target.value === 'equipo' ? newUser.jugador_id : ''})} className="w-full bg-surface-card border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer">
                            <option value="espectador">Espectador</option>
                            <option value="equipo">Equipo (Plantilla)</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                        {newUser.rol === 'equipo' && (
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 ml-1">Vincular con Jugador</label>
                            <select value={newUser.jugador_id || ''} onChange={e => setNewUser({...newUser, jugador_id: e.target.value})} className="w-full bg-surface-card border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer">
                              <option value="">-- No vincular a ningún jugador --</option>
                              {players.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre} (#{p.dorsal})</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="sm:col-span-2 flex justify-end mt-2">
                          <button type="submit" disabled={isCreatingUser} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-amber-500/20 text-xs uppercase tracking-widest disabled:opacity-50 flex items-center gap-2">
                            {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Crear Cuenta
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Barra de Filtros y Búsqueda de Usuarios */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-surface-card/30 p-4 rounded-2xl border border-border-subtle backdrop-blur-md">
                    <div className="flex flex-wrap items-center gap-2">
                      {(['all', 'admin', 'equipo', 'espectador'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => setUserFilterRole(role)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                            userFilterRole === role 
                              ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md shadow-amber-500/10' 
                              : 'bg-surface-card/50 text-text-secondary border-border-default hover:bg-surface-card-hover hover:text-text-primary'
                          }`}
                        >
                          {role === 'all' ? 'Todos' : role === 'equipo' ? 'Jugadores' : role}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full bg-surface-card border border-border-default rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-text-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      </div>
                    </div>
                  </div>

                  {loadingAdminUsers ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] h-10 w-10" /></div>
                  ) : (
                    <div className="bg-surface-card/30 rounded-2xl border border-border-subtle overflow-hidden">
                      {/* Cabecera de Tabla (SaaS deskptop) */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-surface-card/80 border-b border-border-subtle text-[10px] font-black text-text-secondary uppercase tracking-widest">
                        <div className="col-span-4">Identidad / Email</div>
                        <div className="col-span-2">Rol</div>
                        <div className="col-span-3">Vínculo</div>
                        <div className="col-span-2 text-right">Saldo</div>
                        <div className="col-span-1 text-center">Acciones</div>
                      </div>

                      <div className="divide-y divide-border-subtle/30">
                        {adminUsers
                          .filter(u => userFilterRole === 'all' || u.rol === userFilterRole)
                          .filter(u => {
                            if (!userSearchQuery) return true;
                            const s = userSearchQuery.toLowerCase();
                            return u.nombre?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
                          })
                          .length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <span className="text-4xl opacity-50 mb-3">🔍</span>
                                <p className="text-text-primary font-black text-lg tracking-tight">Sin usuarios encontrados</p>
                                <p className="text-text-secondary font-medium text-xs mt-1">Intenta con otros filtros o términos de búsqueda.</p>
                            </div>
                        ) : (
                          adminUsers
                            .filter(u => userFilterRole === 'all' || u.rol === userFilterRole)
                            .filter(u => {
                              if (!userSearchQuery) return true;
                              const s = userSearchQuery.toLowerCase();
                              return u.nombre?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
                            })
                            .map(u => (
                              <div key={u.id} className="relative group hover:bg-surface-card/60 transition-colors">
                                {editingUser?.id === u.id ? (
                                  <form onSubmit={handleUpdateUser} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-card-hover/20 animate-in fade-in duration-200">
                                    <div className="col-span-2 flex justify-between items-center bg-surface-card/40 p-2 rounded-xl mb-1">
                                      <span className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><Pencil className="w-3.5 h-3.5" /> Edición Rápida</span>
                                      <button type="button" onClick={() => setEditingUser(null)} className="p-1 hover:bg-surface-card-active rounded-lg transition-all"><X className="w-3.5 h-3.5 text-text-muted" /></button>
                                    </div>
                                    <input required type="text" value={editingUser.nombre} onChange={e => setEditingUser({...editingUser, nombre: e.target.value})} className="bg-bg-secondary border border-border-default rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Nombre" />
                                    <input required type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="bg-bg-secondary border border-border-default rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Email" />
                                    <input type="password" value={editingUser.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="bg-bg-secondary border border-border-default rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Nueva Clave (opcional)" />
                                    <div className="flex gap-2">
                                      <select value={editingUser.rol} onChange={e => setEditingUser({...editingUser, rol: e.target.value, jugador_id: e.target.value === 'equipo' ? editingUser.jugador_id : null})} className="flex-1 bg-bg-secondary border border-border-default rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer">
                                        <option value="espectador">Espectador</option>
                                        <option value="equipo">Equipo</option>
                                        <option value="admin">Admin</option>
                                      </select>
                                      <input type="number" value={editingUser.saldo_cubiertaspoints} onChange={e => setEditingUser({...editingUser, saldo_cubiertaspoints: Number(e.target.value)})} className="w-24 bg-bg-secondary border border-border-default rounded-xl px-3 py-2 text-xs font-bold text-emerald-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-2 mt-1">
                                      <button type="submit" disabled={isUpdatingUser} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black px-4 py-2 rounded-xl transition-all shadow-sm text-[10px] uppercase tracking-widest disabled:opacity-50 flex items-center gap-1.5">
                                        {isUpdatingUser ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Guardar
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-3.5 text-sm">
                                    {/* Identidad */}
                                    <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
                                        {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-text-primary tracking-tight truncate text-xs">{u.nombre || 'Usuario'}</span>
                                        <span className="text-[10px] text-text-secondary truncate mt-0.5">{u.email}</span>
                                      </div>
                                    </div>

                                    {/* Rol */}
                                    <div className="col-span-1 md:col-span-2">
                                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                                        u.rol === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                        u.rol === 'equipo' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                        'bg-surface-card-hover text-text-secondary border-border-default'
                                      }`}>
                                        {u.rol || 'espectador'}
                                      </span>
                                    </div>

                                    {/* Vínculo */}
                                    <div className="col-span-1 md:col-span-3">
                                      {u.jugador_id ? (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10 w-fit">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          Jugador de Campo
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-text-secondary/40 font-medium">-</span>
                                      )}
                                    </div>

                                    {/* Saldo y Acciones */}
                                    <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-end gap-3 sm:gap-4 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-border-subtle/30">
                                      <div className="flex flex-col items-start md:items-end">
                                        <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Saldo</span>
                                        <span className="text-xs font-black text-emerald-500 flex items-center gap-1 mt-0.5">
                                          <Coins className="w-3.5 h-3.5 opacity-80" />
                                          {u.saldo_cubiertaspoints} <span className="text-[9px] text-text-secondary/60">CP</span>
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleResetPoints(u.id, u.nombre || 'Usuario')}
                                          className="p-1.5 hover:bg-surface-card-active rounded-lg transition-all text-text-secondary hover:text-text-primary border border-transparent hover:border-border-default bg-surface-card/40"
                                          title="Resetear Saldo"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setEditingUser({...u, password: ''})}
                                          className="p-1.5 hover:bg-indigo-500/10 rounded-lg transition-all text-text-secondary hover:text-indigo-400 border border-transparent hover:border-indigo-500/10 bg-surface-card/40"
                                          title="Editar"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(u.id, u.nombre || 'Usuario')}
                                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-all text-text-secondary hover:text-red-400 border border-transparent hover:border-red-500/10 bg-surface-card/40"
                                          title="Borrar"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : activeTab === "galeria" ? (
                <div className="bg-surface-card/80 dark:bg-surface-card/80 border border-border-default rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden transition-all duration-500 flex flex-col h-full min-h-[500px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-pink-400 to-transparent opacity-50" />

                  <div className="flex justify-between items-center mb-10 border-b border-border-subtle pb-6">
                    <div>
                      <h3 className="text-2xl font-black text-text-primary flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <ImagePlus className="text-purple-500 h-6 w-6" />
                        </div>
                        Subir a Galería
                      </h3>
                      <p className="text-sm text-text-secondary mt-2 font-medium">Actualiza las fotos de los partidos en vivo.</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-12 bg-surface-card/50 dark:bg-surface-card/50 rounded-[2rem] border-2 border-dashed border-purple-300 dark:border-border-default hover:border-purple-500/50 transition-colors group">
                    <div className="w-24 h-24 bg-surface-card dark:bg-surface-card/5 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <UploadCloud className="h-10 w-10 text-purple-500/50 dark:text-text-secondary/40" />
                    </div>
                    <input
                      type="file"
                      id="gallery-upload"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="block w-full max-w-sm text-sm text-text-secondary
                        file:mr-4 file:py-4 file:px-6
                        file:rounded-2xl file:border-0
                        file:text-sm file:font-bold file:tracking-wide
                        file:bg-purple-500 file:text-white
                        dark:file:bg-surface-card/10 dark:file:text-white
                        hover:file:bg-purple-600 dark:hover:file:bg-surface-card/20
                        transition-all cursor-pointer file:cursor-pointer file:shadow-md"
                    />
                    {uploadFile && (
                      <p className="mt-6 text-sm font-bold text-text-primary text-center bg-surface-card dark:bg-surface-card/5 px-6 py-3 rounded-full border border-border-default shadow-sm">
                        Seleccionado: <span className="text-purple-500 tracking-wide">{uploadFile.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleImageUpload}
                      disabled={isUploading || !uploadFile}
                      className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20"
                    >
                      {isUploading ? (
                        <><Loader2 className="h-6 w-6 animate-spin" /> Subiendo...</>
                      ) : (
                        <><ImagePlus className="h-6 w-6" /> Subir Imagen</>
                      )}
                    </button>
                  </div>
                </div>
              ) : selectedMatchData ? (
                activeTab === "resultados" ? (
                  <div className="bg-surface-card/80 dark:bg-surface-card/80 border border-border-default rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden transition-all duration-500 h-full flex flex-col min-h-[500px]">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent opacity-50" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-border-subtle pb-6">
                      <div>
                        <h3 className="text-2xl font-black text-text-primary flex items-center gap-3 tracking-tight">
                          {selectedMatchData.estado === "programado" ? "⏳ Esperando Inicio" : selectedMatchData.estado === "en_juego" ? "🔴 Panel En Vivo" : "⚽ Goleadores"}
                        </h3>
                        {selectedMatchData.estado !== "programado" && (
                          <p className="text-sm text-text-secondary mt-2 font-medium">
                            {selectedMatchData.estado === "en_juego" ? "Sincroniza los goles del marcador izquierdo al instante." : <>Asigna quién marcó nuestros <strong className="text-emerald-500 text-base">{golesEquipo}</strong> goles.</>}
                          </p>
                        )}
                      </div>

                      {/* Badge / Call to Action */}
                      {selectedMatchData.estado === "programado" ? (
                        <button
                          onClick={() => handleLiveAction("en_juego")}
                          disabled={isLiveLoading}
                          className="bg-red-500 hover:bg-red-400 text-white px-6 py-3.5 rounded-2xl font-black shadow-[0_8px_20px_rgb(239,68,68,0.3)] transition-all flex items-center gap-2"
                        >
                          {isLiveLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>🔴 GO LIVE</>}
                        </button>
                      ) : selectedMatchData.estado === "en_juego" ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <button
                            onClick={() => handleLiveAction("update")}
                            disabled={isLiveLoading}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-6 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 w-full sm:w-auto justify-center shadow-sm"
                          >
                            {isLiveLoading ? "Sincronizando..." : "🔄 Sincronizar Info"}
                          </button>
                          <button
                            onClick={() => handleLiveAction("finalizado")}
                            disabled={isLiveLoading}
                            className="bg-bg-secondary border border-border-default hover:bg-bg-secondary-hover dark:bg-bg-secondary dark:hover:bg-bg-secondary-hover text-text-primary dark:text-text-primary px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-black/20 dark:shadow-white/10 transition-colors text-sm w-full sm:w-auto justify-center"
                          >
                            Finalizar Partido
                          </button>
                        </div>
                      ) : (
                        <div className={`px-5 py-2.5 rounded-xl text-xs font-black transition-colors shadow-sm tracking-widest uppercase items-center flex justify-center ${golesEquipo === 0 ? "bg-surface-card/50 dark:bg-surface-card/50 text-text-secondary dark:text-text-secondary border border-border-default" : missingScorers === 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"}`}>
                          {golesEquipo === 0 ? "⏳ Esperando GOLES" : missingScorers === 0 ? "✅ ¡COMPLETADO!" : `⚠️ FALTAN ${missingScorers}`}
                        </div>
                      )}
                    </div>

                    {selectedMatchData.estado === "programado" ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-surface-card/50 dark:bg-surface-card/50 rounded-[2rem] border border-dashed border-border-default mt-2">
                        <span className="text-6xl mb-6 opacity-30 dark:opacity-50">⏱️</span>
                        <p className="text-text-primary font-black text-2xl tracking-tight">Partido Programado</p>
                        <p className="text-text-secondary mt-3 font-medium max-w-sm">Inicia el modo 'Live' para abrir la sesión y mostrar el resultado a todos en tiempo real.</p>
                      </div>
                    ) : selectedMatchData.estado === "en_juego" ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-red-500/5 dark:bg-red-500/[0.04] rounded-[2rem] border border-red-500/20 shadow-inner overflow-hidden relative mt-2">
                        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 to-transparent pointer-events-none" />
                        <span className="text-6xl mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">🔴</span>
                        <p className="text-text-primary dark:text-red-100 font-black text-2xl sm:text-3xl tracking-tight uppercase">Transmitiendo en Vivo</p>
                        <p className="text-text-secondary dark:text-red-200/50 mt-4 font-medium max-w-md">Los cambios en el marcador izquierdo se reflejan inmediatamente a todos los visitantes cuando pulsas Sincronizar.</p>
                      </div>
                    ) : golesEquipo === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-surface-card/50 dark:bg-surface-card/50 rounded-[2rem] border border-dashed border-border-default mt-2">
                        <span className="text-6xl mb-6 opacity-30 dark:opacity-50">⚽</span>
                        <p className="text-text-primary font-black text-2xl tracking-tight">Cero Goles Aún</p>
                        <p className="text-text-secondary mt-3 font-medium max-w-sm">Aumenta nuestro marcador en el panel lateral izquierdo para poder asignar la autoría a los jugadores.</p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto pr-3 space-y-4 pb-4 max-h-[500px] custom-scrollbar">
                        {players.map((p) => {
                          const goalsAssigned = scorerCounts[p.id] || 0;
                          return (
                            <div key={p.id} className={`flex items-center justify-between gap-2 p-3 sm:p-5 rounded-2xl transition-all duration-300 ${goalsAssigned > 0 ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/30 shadow-[0_8px_20px_rgb(16,185,129,0.1)] scale-[1.02]" : "bg-surface-card dark:bg-surface-card hover:bg-surface-card-hover dark:hover:bg-surface-card-hover border border-border-default shadow-sm"}`}>
                              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                <span className={`flex shrink-0 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-lg font-black shadow-inner ${goalsAssigned > 0 ? "bg-emerald-500 text-white" : "bg-surface-card/50 dark:bg-surface-card/5 text-text-primary dark:text-text-primary/80"}`}>
                                  {p.dorsal}
                                </span>
                                <div className="min-w-0">
                                  <p className={`font-black tracking-tight text-base sm:text-lg truncate ${goalsAssigned > 0 ? "text-text-primary dark:text-text-primary" : "text-text-primary dark:text-text-secondary"}`}>{p.nombre}</p>
                                  <p className="text-[10px] sm:text-xs text-text-secondary dark:text-text-secondary font-bold uppercase tracking-[0.2em] mt-1 truncate">{p.posicion}</p>
                                </div>
                              </div>

                              <div className="flex items-center bg-surface-card/50 dark:bg-surface-card/50 border border-border-default rounded-xl overflow-hidden shadow-inner shrink-0 p-1">
                                <button
                                  onClick={() => updateScorer(p.id, -1)}
                                  disabled={goalsAssigned === 0}
                                  className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-surface-card dark:hover:bg-surface-card/5 disabled:opacity-30 disabled:hover:bg-transparent text-text-secondary dark:text-text-secondary transition-colors focus:outline-none font-black text-lg sm:text-xl"
                                >-</button>
                                <span className={`w-8 sm:w-12 text-center font-black text-xl sm:text-2xl ${goalsAssigned > 0 ? "text-emerald-500" : "text-text-secondary dark:text-text-secondary"}`}>
                                  {goalsAssigned > 0 ? goalsAssigned : "0"}
                                </span>
                                <button
                                  onClick={() => updateScorer(p.id, 1)}
                                  disabled={missingScorers === 0}
                                  className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-surface-card dark:hover:bg-surface-card/5 disabled:opacity-30 disabled:hover:bg-transparent text-text-secondary dark:text-text-secondary transition-colors focus:outline-none font-black text-lg sm:text-xl"
                                >+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedMatchData.estado === "finalizado" && (
                      <div className="mt-8 pt-6 border-t border-border-subtle relative z-10">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || missingScorers !== 0}
                          className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgb(16,185,129,0.3)] active:scale-[0.98] text-lg uppercase tracking-widest"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="h-6 w-6 animate-spin" /> Procesando...</>
                          ) : (
                            <><Save className="h-6 w-6" /> Terminar e Inscribir Acta</>
                          )}
                        </button>
                      </div>
                    )}

                  </div>
                ) : activeTab === "asistencia" ? (
                  <div className="bg-surface-card/80 dark:bg-surface-card/80 border border-border-default rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden transition-all duration-500 min-h-[500px]">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent opacity-50" />

                    <div className="flex items-center gap-4 mb-8 border-b border-border-subtle pb-6">
                      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Users className="text-blue-500 h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-text-primary">Estado de la Convocatoria</h3>
                        <p className="text-sm text-text-secondary mt-1">Jugadores que han confirmado vía Portal Jugador.</p>
                      </div>
                    </div>

                    {loadingConvocatorias ? (
                      <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] h-10 w-10" /></div>
                    ) : convocatorias.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-card/50 dark:bg-surface-card/50 rounded-[2rem] border border-dashed border-border-default">
                        <span className="text-5xl opacity-30 mb-4">👻</span>
                        <p className="text-text-primary font-black text-xl tracking-tight">Nadie Ha Confirmado Aún</p>
                        <p className="text-text-secondary font-medium text-sm mt-2">Los jugadores aún no han respondido a la convocatoria.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {players.map(p => {
                          const rsvp = convocatorias.find(c => c.jugador_id === p.id);
                          if (!rsvp) return null;

                          return (
                            <div key={p.id} className="flex items-center justify-between gap-2 p-3 sm:p-5 bg-surface-card dark:bg-surface-card rounded-2xl border border-border-default transition-all hover:bg-surface-card-hover dark:hover:bg-surface-card-hover hover:shadow-md shadow-sm">
                              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                <span className="flex shrink-0 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-lg font-black shadow-inner bg-surface-card/50 dark:bg-surface-card/5 text-text-primary dark:text-text-primary/80">
                                  {p.dorsal}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-black text-text-primary text-base sm:text-lg tracking-tight truncate">{p.nombre}</p>
                                  <p className="text-[10px] sm:text-xs text-text-secondary font-bold uppercase tracking-[0.2em] mt-1 truncate">{p.posicion}</p>
                                </div>
                              </div>

                              {rsvp.asiste ? (
                                <div className="bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-5 py-2.5 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center gap-2 border border-emerald-500/30 shadow-sm">
                                  <CheckCircle2 className="h-4 w-4" /> Voy
                                </div>
                              ) : (
                                <div className="bg-red-500/10 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center gap-2 border border-red-500/30 shadow-sm">
                                  <AlertCircle className="h-4 w-4" /> Baja
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Jugadores que faltan por votar */}
                        <div className="pt-6 mt-8 border-t border-border-subtle">
                            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4">Pendientes de respuesta</h4>
                            <div className="flex flex-wrap gap-2">
                            {players.filter(p => !convocatorias.find(c => c.jugador_id === p.id)).map(p => (
                                <span key={p.id} className="bg-surface-card/50 dark:bg-surface-card/50 text-text-secondary px-4 py-2 rounded-xl text-xs font-bold border border-border-default">
                                {p.nombre}
                                </span>
                            ))}
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null
              ) : (
                <div className="bg-surface-card/80 dark:bg-surface-card/80 border border-border-default rounded-[2.5rem] p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center backdrop-blur-2xl relative overflow-hidden transition-all duration-500">
                  {/* Deep layered background */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05)_0%,transparent_60%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,106,0.04)_0%,transparent_60%)]" />

                  {/* Orbital ring */}
                  <div className="relative w-40 h-40 flex items-center justify-center mb-12">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/10" />
                    <div className="absolute inset-3 rounded-full border border-emerald-500/10" />
                    <div className="absolute inset-6 rounded-full border border-emerald-500/20" />
                    <div className="absolute inset-0 rounded-full border border-white/[0.03] animate-[spin_20s_linear_infinite]" />
                    <div className="w-20 h-20 bg-surface-card/50 backdrop-blur-xl rounded-full flex items-center justify-center border border-border-default shadow-[0_0_40px_2px_rgba(16,185,129,0.08)]">
                      <span className="text-4xl">⚽</span>
                    </div>
                  </div>

                  <div className="relative z-10 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card/5 border border-border-default text-text-secondary dark:text-text-secondary font-bold text-[10px] uppercase tracking-[0.2em] mb-6">
                      Admin Central — Impersed Cubiertas FC
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black text-text-primary mb-5 tracking-tight leading-[1.1]">Elige un <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Partido</span></h3>
                    <p className="text-text-secondary text-base font-medium leading-relaxed">Selecciona un enfrentamiento del menú lateral para gestionar el acta, asistencias y apuestas de la liga.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-surface-card border border-border-default rounded-[2rem] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <h4 className="text-base font-black text-text-primary tracking-tight mb-2">
                {confirmModal.title}
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {confirmModal.message}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 bg-surface-card-hover hover:bg-surface-card-active text-text-primary font-bold py-2.5 rounded-xl border border-border-default transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 ${confirmModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600 text-zinc-950' : 'bg-amber-500 hover:bg-amber-600 text-zinc-950'} font-black py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 text-sm`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
