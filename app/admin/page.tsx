"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetchPartidos(t);
  }, []);

  async function fetchPartidos(token: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/partidos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPartidos(data);
      } else {
        setError(data.message || "Error al cargar partidos");
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center py-12">
      <div className="bg-background shadow-lg rounded-xl p-8 w-full max-w-3xl flex flex-col gap-6 border border-primary">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Panel de Administración</h2>
        {loading ? (
          <div className="text-center text-lg">Cargando partidos...</div>
        ) : error ? (
          <div className="text-red-500 text-center font-semibold">{error}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Fecha</th>
                <th className="py-2 px-4 border-b">Rival</th>
                <th className="py-2 px-4 border-b">Resultado</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {partidos.map((p: any) => (
                <tr key={p.id} className="hover:bg-secondary/50">
                  <td className="py-2 px-4 border-b">{p.fecha}</td>
                  <td className="py-2 px-4 border-b">{p.rival}</td>
                  <td className="py-2 px-4 border-b">{p.resultado}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90"
                      onClick={() => router.push(`/admin/partido/${p.id}`)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
