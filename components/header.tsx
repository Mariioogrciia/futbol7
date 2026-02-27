"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Equipo", href: "#equipo" },
  { label: "Partidos", href: "#partidos" },
  { label: "Goleadores", href: "#goleadores" },
  { label: "Estadisticas", href: "#estadisticas" },
  { label: "Galeria", href: "#galeria" },
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

      if (dbError || !userData) {
        setError('No autorizado');
        await supabase.auth.signOut();
        return;
      }

      onClose();

      if (userData.rol === 'admin') {
        window.open('/admin', '_blank');
      } else if (userData.rol === 'equipo') {
        window.open('/jugador', '_blank');
      } else {
        // Fallback or other roles
        setError('No autorizado para esta plataforma.');
        await supabase.auth.signOut();
        return;
      }
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

  // Auth state
  const [userRole, setUserRole] = useState<'admin' | 'equipo' | null>(null);

  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);

    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', session.user.id)
        .single();

      if (userData?.rol === 'admin' || userData?.rol === 'equipo') {
        setUserRole(userData.rol);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
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
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => router.push('/admin')}
                  className="rounded-md px-3 py-2 text-sm font-medium text-emerald-500 transition-colors duration-200 hover:text-emerald-400 hover:bg-secondary flex items-center gap-1"
                >
                  Admin
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-secondary"
                >
                  Salir
                </button>
              </>
            )}
            {userRole === 'equipo' && (
              <>
                <button
                  onClick={() => router.push('/jugador')}
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80 hover:bg-secondary flex items-center gap-1"
                >
                  Mi Portal
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-secondary"
                >
                  Salir
                </button>
              </>
            )}
            {!userRole && (
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
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        router.push('/admin');
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
                {userRole === 'equipo' && (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        router.push('/jugador');
                      }}
                      className="rounded-md px-3 py-3 text-base font-medium text-primary transition-colors hover:text-primary/80 hover:bg-secondary text-left flex items-center gap-2"
                    >
                      Portal Jugador
                    </button>
                    <button
                      onClick={handleLogout}
                      className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary text-left"
                    >
                      Salir
                    </button>
                  </>
                )}
                {!userRole && (
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
    </>
  );
}
