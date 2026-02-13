"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditPartido() {
  const router = useRouter();
  const params = useParams();
  const partidoId = params?.id;
  const [token, setToken] = useState<string | null>(null);
  const [partido, setPartido] = useState<any>(null);
  const [golesNuestro, setGolesNuestro] = useState(0);
  const [golesRival, setGolesRival] = useState(0);
  const [goleadores, setGoleadores] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetchPartido(t);
    fetchJugadores(t);
  }, []);

  async function fetchPartido(token: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/partidos`);
      const data = await res.json();
      if (res.ok) {
        const p = data.find((x: any) => x.id == partidoId);
        setPartido(p);
        setGolesNuestro(Number(p?.resultado?.split("-")[0]) || 0);
        setGolesRival(Number(p?.resultado?.split("-")[1]) || 0);
        setGoleadores(p?.goles_detalle || []);
      } else {
        setError(data.message || "Error al cargar partido");
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function fetchJugadores(token: string) {
    try {
      const res = await fetch(`/api/jugadores`);
      const data = await res.json();
      if (res.ok) setJugadores(data);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/partido/${partidoId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goles_nuestro: golesNuestro,
          goles_rival: golesRival,
          goleadores: goleadores.map((g: any) => ({
            jugador_id: jugadores.find(j => j.nombre_completo === g.jugador)?.id,
            tipo: g.tipo || "Pie",
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Partido actualizado correctamente");
      } else {
        setError(data.message || "Error al actualizar");
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  function handleAddGoleador() {
    setGoleadores([...goleadores, { jugador: "", tipo: "Pie" }]);
  }

  function handleGoleadorChange(idx: number, field: string, value: string) {
    setGoleadores(goleadores.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  }

  function handleRemoveGoleador(idx: number) {
    setGoleadores(goleadores.filter((_, i) => i !== idx));
  }

  if (!token || loading) return <div className="min-h-screen flex items-center justify-center bg-secondary text-lg">Cargando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-secondary text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center py-12">
      <div className="bg-background shadow-lg rounded-xl p-8 w-full max-w-2xl flex flex-col gap-6 border border-primary">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Editar Partido</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground">Goles Nuestro</label>
            <input
              type="number"
              value={golesNuestro}
              onChange={e => setGolesNuestro(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-muted-foreground bg-secondary text-foreground focus:outline-none focus:border-primary"
              min={0}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground">Goles Rival</label>
            <input
              type="number"
              value={golesRival}
              onChange={e => setGolesRival(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-muted-foreground bg-secondary text-foreground focus:outline-none focus:border-primary"
              min={0}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground">Goleadores</label>
            {goleadores.map((g, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={g.jugador}
                  onChange={e => handleGoleadorChange(idx, "jugador", e.target.value)}
                  className="px-4 py-2 rounded-lg border border-muted-foreground bg-secondary text-foreground focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Selecciona jugador</option>
                  {jugadores.map(j => (
                    <option key={j.id} value={j.nombre_completo}>{j.nombre_completo}</option>
                  ))}
                </select>
                <select
                  value={g.tipo}
                  onChange={e => handleGoleadorChange(idx, "tipo", e.target.value)}
                  className="px-4 py-2 rounded-lg border border-muted-foreground bg-secondary text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Pie">Pie</option>
                  <option value="Cabeza">Cabeza</option>
                  <option value="Penalti">Penalti</option>
                </select>
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 py-1 rounded-lg font-semibold hover:bg-red-600"
                  onClick={() => handleRemoveGoleador(idx)}
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 mt-2"
              onClick={handleAddGoleador}
            >
              Añadir Goleador
            </button>
          </div>
          {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
          {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-bold py-3 rounded-lg transition-all hover:bg-primary/90 disabled:bg-muted"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
        <button
          className="mt-4 bg-secondary border border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80"
          onClick={() => router.push("/admin")}
        >
          Volver al panel
        </button>
      </div>
    </div>
  );
}
