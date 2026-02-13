"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin");
      } else {
        setError(data.message || "Error de autenticación");
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <form
        onSubmit={handleSubmit}
        className="bg-background shadow-lg rounded-xl p-8 w-full max-w-md flex flex-col gap-6 border border-primary"
      >
        <h2 className="text-3xl font-bold text-primary text-center">Panel Admin</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-semibold text-foreground">Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-4 py-2 rounded-lg border border-muted-foreground bg-secondary text-foreground focus:outline-none focus:border-primary"
            autoComplete="username"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-foreground">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-2 rounded-lg border border-muted-foreground bg-secondary text-foreground focus:outline-none focus:border-primary"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
        <button
          type="submit"
          className="bg-primary text-primary-foreground font-bold py-3 rounded-lg transition-all hover:bg-primary/90 disabled:bg-muted"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
