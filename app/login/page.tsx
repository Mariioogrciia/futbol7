'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya hay una sesión activa
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Ya hay sesión, redirigir según rol
        await redirectBasedOnRole(session.user.id);
      }
    };

    checkSession();
  }, []);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();

      if (error || !userData) {
        console.error('Error obteniendo rol:', error);
        return;
      }

      // Redirigir según rol
      if (userData.rol === 'admin') {
        window.open('/admin', '_blank');
      } else if (userData.rol === 'equipo') {
        window.open('/jugador', '_blank');
      } else {
        window.open('/espectador', '_blank');
      }
    } catch (err) {
      console.error('Error redirigiendo:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Redirigir según rol
        await redirectBasedOnRole(data.user.id);
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4 sm:mx-0">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          ⚽ Futbol7
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">📝 Usuarios de prueba:</p>
          <ul className="space-y-1 text-xs">
            <li><strong>Admin:</strong> admin@futbol7.com / admin123</li>
            <li><strong>Equipo:</strong> equipo@futbol7.com / equipo123</li>
            <li><strong>Externo:</strong> externo@futbol7.com / externo123</li>
          </ul>
        </div>

        <p className="text-center mt-6 text-gray-600 text-sm">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-blue-600 hover:underline font-semibold">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}
