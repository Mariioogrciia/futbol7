"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminControls() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setIsAdmin(false);
        return;
      }

      // Obtener datos del usuario para verificar rol
      const { data: userData, error: dbError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', session.user.id)
        .single();

      if (dbError || !userData || userData.rol !== 'admin') {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      fetchPartidos();
    } catch (e) {
      console.error('Error checking admin status:', e);
      setIsAdmin(false);
    }
  }

  async function fetchPartidos() {
    setLoading(true);
    try {
      const res = await fetch("/api/partidos");
      if (!res.ok) throw new Error("error fetching partidos");
      const data = await res.json();
      setPartidos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar(partido: any) {
    const golesEquipo = prompt("Goles equipo:", String(partido.goles_equipo ?? 0));
    if (golesEquipo === null) return;
    const golesRival = prompt("Goles rival:", String(partido.goles_rival ?? 0));
    if (golesRival === null) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Sesión expirada");
        router.push('/login');
        return;
      }

      const res = await fetch("/api/admin/update-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: partido.id,
          goles_equipo: Number(golesEquipo),
          goles_rival: Number(golesRival)
        }),
      });

      if (!res.ok) {
        alert("Error al actualizar");
        return;
      }

      alert("Partido actualizado");
      fetchPartidos();
    } catch (e) {
      console.error(e);
      alert("Error de red");
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
        <strong className="block">Modo Admin activado</strong>
        <span className="text-sm text-gray-700">Puedes editar partidos directamente desde la home.</span>
      </div>

      <h2 className="text-xl font-bold mb-4">Partidos</h2>

      {loading ? (
        <div>Cargando partidos...</div>
      ) : (
        <div className="space-y-3">
          {partidos.length === 0 && <div>No hay partidos.</div>}
          {partidos.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.rival} — {new Date(p.fecha).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Resultado: {p.goles_equipo ?? 0} - {p.goles_rival ?? 0}</div>
              </div>
              <div>
                <button onClick={() => handleEditar(p)} className="bg-blue-600 text-white px-3 py-1 rounded">Editar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
