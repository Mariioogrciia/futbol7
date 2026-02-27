"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Equipo", href: "/#equipo" },
  { label: "Partidos", href: "/#partidos" },
  { label: "Goleadores", href: "/#goleadores" },
  { label: "Estadisticas", href: "/#estadisticas" },
  { label: "Galeria", href: "/#galeria" },
  { label: "El Oráculo 🔮", href: "/porra" },
];

function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

      // Verificar rol
      const { data: userData, error: dbError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (dbError || !userData || !['admin', 'equipo', 'espectador'].includes(userData.rol)) {
        setError('No autorizado');
        await supabase.auth.signOut();
        return;
      }

      onClose();
      // Ya no redirigimos aquí. La cabecera se actualizará automáticamente.

    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Acceso a la Plantilla</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
                >
                  Cancelar
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('openRegisterModal'));
                  }}
                  className="text-emerald-500 font-semibold hover:underline transition-colors"
                >
                  Crear cuenta de espectador
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RegisterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre, rol: 'espectador' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en registro');
        return;
      }

      setSuccess('¡Cuenta creada! Revisa tu email o inicia sesión ahora.');
      // Auto-close and open login after a delay
      setTimeout(() => {
        onClose();
        window.dispatchEvent(new CustomEvent('openLoginModal'));
      }, 3000);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                Únete al Equipo
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Crea tu cuenta para participar en El Oráculo y más.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Nombre o Alias</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-3.5 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                  placeholder="Ej: Paco_Futbol7"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg text-sm font-medium border border-red-200 dark:border-red-500/20">
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg text-sm font-medium border border-emerald-200 dark:border-emerald-500/20">
                  {success}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full bg-emerald-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-emerald-500/20"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-6">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('openLoginModal'));
                  }}
                  className="text-emerald-500 font-semibold hover:underline transition-colors"
                >
                  Inicia sesión aquí
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Auth state
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Initial check
    checkAuthStatus();

    // Listen to Auth Changes to auto-update header when login modal closes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAuthStatus();
      } else {
        setUser(null);
      }
    });

    // Custom event listeners for modals
    const handleOpenRegister = () => setRegisterModalOpen(true);
    const handleOpenLogin = () => setLoginModalOpen(true);

    window.addEventListener('openRegisterModal', handleOpenRegister);
    window.addEventListener('openLoginModal', handleOpenLogin);

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
      window.removeEventListener('openRegisterModal', handleOpenRegister);
      window.removeEventListener('openLoginModal', handleOpenLogin);
    };
  }, []);

  async function checkAuthStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userData?.rol === 'admin' || userData?.rol === 'equipo' || userData?.rol === 'espectador') {
        setUser(userData);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-lg shadow-lg border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <Image
                src="/images/Escudo.png"
                alt="Impersed Cubiertas FC"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Impersed <span className="text-accent">Cubiertas FC</span>
              </span>
            </div>
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-md px-4 py-2 text-sm font-bold text-primary transition-colors duration-200 hover:text-primary/80 hover:bg-secondary flex items-center gap-2 border border-primary/20 bg-primary/10">
                    <User className="h-4 w-4" />
                    {user.nombre || (user.rol === 'admin' ? 'Admin' : 'Jugador')}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.rol === 'admin' ? (
                    <DropdownMenuItem onClick={() => window.open('/admin', '_blank')} className="cursor-pointer font-medium text-emerald-500">
                      Panel Admin
                    </DropdownMenuItem>
                  ) : user.rol === 'equipo' ? (
                    <>
                      {user.jugador_id && (
                        <DropdownMenuItem onClick={() => window.open(`/jugador/${user.jugador_id}`, '_blank')} className="cursor-pointer">
                          Ver Perfil
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => window.open('/jugador', '_blank')} className="cursor-pointer">
                        Asistencia
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = '/porra'} className="cursor-pointer font-bold text-fuchsia-500">
                        El Oráculo 🔮
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => window.location.href = '/porra'} className="cursor-pointer font-bold text-fuchsia-500">
                      El Oráculo 🔮
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-secondary flex items-center gap-1"
              >
                <User className="h-4 w-4" />
                Acceso
              </button>
            )}
            <ModeToggle />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ModeToggle />
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-md p-2 text-foreground hover:bg-secondary"
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-lg lg:hidden"
            >
              <nav className="flex flex-col gap-1 px-4 py-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                  >
                    {link.label}
                  </a>
                ))}
                {user?.rol === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        window.open('/admin', '_blank');
                      }}
                      className="rounded-md px-3 py-3 text-base font-medium text-emerald-500 transition-colors hover:text-emerald-400 hover:bg-secondary text-left flex items-center gap-2"
                    >
                      Admin
                    </button>
                    <button
                      onClick={handleLogout}
                      className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary text-left"
                    >
                      Salir
                    </button>
                  </>
                )}
                {user?.rol === 'equipo' && (
                  <>
                    {user.jugador_id && (
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          window.open(`/jugador/${user.jugador_id}`, '_blank');
                        }}
                        className="rounded-md px-3 py-3 text-base font-medium text-primary transition-colors hover:text-primary/80 hover:bg-secondary text-left flex items-center gap-2"
                      >
                        Ver Perfil
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        window.open('/jugador', '_blank');
                      }}
                      className="rounded-md px-3 py-3 text-base font-medium text-primary transition-colors hover:text-primary/80 hover:bg-secondary text-left flex items-center gap-2"
                    >
                      Asistencia
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        window.location.href = '/porra';
                      }}
                      className="rounded-md px-3 py-3 text-base font-bold text-fuchsia-500 transition-colors hover:text-fuchsia-400 hover:bg-secondary text-left flex items-center gap-2"
                    >
                      El Oráculo 🔮
                    </button>
                    <button
                      onClick={handleLogout}
                      className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary text-left"
                    >
                      Salir
                    </button>
                  </>
                )}
                {user?.rol === 'espectador' && (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        window.location.href = '/porra';
                      }}
                      className="rounded-md px-3 py-3 text-base font-bold text-fuchsia-500 transition-colors hover:text-fuchsia-400 hover:bg-secondary text-left flex items-center gap-2"
                    >
                      El Oráculo 🔮
                    </button>
                    <button
                      onClick={handleLogout}
                      className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary text-left"
                    >
                      Salir
                    </button>
                  </>
                )}
                {!user && (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setLoginModalOpen(true);
                    }}
                    className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary text-left flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Acceso
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <RegisterModal isOpen={registerModalOpen} onClose={() => setRegisterModalOpen(false)} />
    </>
  );
}
