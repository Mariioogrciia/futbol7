'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';


export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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

      if (!userData || userData.rol !== 'equipo') {
        router.push("/login");
        return;
      }

      setUser({ ...userData, email: session.user.email });
    };

    checkAuth();
  }, [router]);

  if (!user) return <div className="p-4">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Dashboard del Equipo</h1>
        <p className="text-lg">Bienvenido, {user.nombre}</p>
      </div>
    </div>
  );
}
