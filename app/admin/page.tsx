"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.rol !== "admin") {
      router.push("/login");
      return;
    }

    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user)
    return (
      <div className="p-4 text-center">Cargando...</div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">⚽ Panel Administrativo</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sección de Resultados */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📊 Editar Resultados</h2>
            <p className="text-gray-400 mb-4">
              Aquí podrás actualizar los resultados de los partidos en tiempo real.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              Ir a Resultados
            </button>
          </div>

          {/* Sección de Goleadores */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">⚽ Gestionar Goleadores</h2>
            <p className="text-gray-400 mb-4">
              Registra los goles de los jugadores en cada partido.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              Ir a Goleadores
            </button>
          </div>

          {/* Sección de Usuarios */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">👥 Gestionar Usuarios</h2>
            <p className="text-gray-400 mb-4">
              Crea y administra usuarios admin, equipos y externos.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              Ir a Usuarios
            </button>
          </div>

          {/* Sección de Estadísticas */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📈 Estadísticas</h2>
            <p className="text-gray-400 mb-4">
              Visualiza estadísticas generales de la liga.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              Ver Estadísticas
            </button>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Información de la Sesión</h2>
          <p>
            <strong>Usuario:</strong> {user.nombre}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Rol:</strong> {user.rol}
          </p>
        </div>
      </div>
    </div>
  );
}

