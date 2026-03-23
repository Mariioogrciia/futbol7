'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';


export default function EspectadorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

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

      if (!userData || userData.rol !== 'externo') {
        router.push("/login");
        return;
      }

      setUser({ ...userData, email: session.user.email });
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres salir?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await supabase.auth.signOut();
        router.push('/login');
      }
    });
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
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-blue-900 border border-blue-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-white">
            <h4 className="text-base font-bold tracking-tight mb-2">
              {confirmModal.title}
            </h4>
            <p className="text-sm text-blue-100 leading-relaxed mb-6">
              {confirmModal.message}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 bg-blue-800 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl border border-blue-600 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
