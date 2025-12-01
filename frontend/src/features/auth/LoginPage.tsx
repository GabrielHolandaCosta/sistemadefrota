import { FormEvent, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks";
import { setTokens, setUser } from "./authSlice";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await axios.post("/api/auth/token/", {
        username,
        password,
      });
      dispatch(
        setTokens({
          access: tokenRes.data.access,
          refresh: tokenRes.data.refresh,
        }),
      );
      const meRes = await axios.get("/api/auth/me/", {
        headers: {
          Authorization: `Bearer ${tokenRes.data.access}`,
        },
      });
      const role: string | null = meRes.data.role ?? null;
      dispatch(
        setUser({
          username: meRes.data.username,
          role,
        }),
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-8 backdrop-blur-md">
        <h1 className="text-2xl font-semibold text-slate-50 mb-2">
          Sistema de Frotas
        </h1>
        <p className="text-sm text-slate-400 mb-4">
          Acesse para gerenciar veículos, motoristas e operações em tempo real.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Ainda não tem conta?{" "}
          <Link
            to="/register"
            className="text-primary-300 hover:text-primary-200 underline-offset-2 hover:underline"
          >
            Criar conta
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Usuário
            </label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Senha
            </label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white py-2.5 shadow-md shadow-primary-500/30 transition-transform duration-150 hover:-translate-y-0.5"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}


