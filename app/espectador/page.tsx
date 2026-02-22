'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EspectadorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.rol !== 'externo') {
      router.push('/login');
      return;
    }

    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return <div className="p-4">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      <nav className="bg-blue-900 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">⚽ Centro de Espectador</h1>
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
          {/* Tabla de Posiciones */}
          <div className="bg-blue-700 bg-opacity-50 p-6 rounded-lg backdrop-blur">
            <h2 className="text-xl font-bold mb-4">🏆 Tabla de Posiciones</h2>
            <p className="text-blue-100 mb-4">
              Visualiza la clasificación actual de los equipos en la liga.
            </p>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded font-semibold">
              Ver Tabla
            </button>
          </div>

          {/* Goleadores */}
          <div className="bg-blue-700 bg-opacity-50 p-6 rounded-lg backdrop-blur">
            <h2 className="text-xl font-bold mb-4">⚽ Tabla de Goleadores</h2>
            <p className="text-blue-100 mb-4">
              Conoce a los mejores anotadores de la temporada.
            </p>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded font-semibold">
              Ver Goleadores
            </button>
          </div>

          {/* Próximos Partidos */}
          <div className="bg-blue-700 bg-opacity-50 p-6 rounded-lg backdrop-blur">
            <h2 className="text-xl font-bold mb-4">📅 Próximos Partidos</h2>
            <p className="text-blue-100 mb-4">
              Consulta los partidos programados para las próximas jornadas.
            </p>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded font-semibold">
              Ver Partidos
            </button>
          </div>

          {/* Resultados */}
          <div className="bg-blue-700 bg-opacity-50 p-6 rounded-lg backdrop-blur">
            <h2 className="text-xl font-bold mb-4">📊 Resultados</h2>
            <p className="text-blue-100 mb-4">
              Revisa los resultados de los partidos ya disputados.
            </p>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded font-semibold">
              Ver Resultados
            </button>
          </div>
        </div>

        <div className="mt-8 bg-blue-700 bg-opacity-50 p-6 rounded-lg backdrop-blur">
          <h2 className="text-xl font-bold mb-4">Mi Perfil</h2>
          <p>
            <strong>Nombre:</strong> {user.nombre}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Tipo de Usuario:</strong> Espectador
          </p>
        </div>
      </div>
    </div>
  );
}
