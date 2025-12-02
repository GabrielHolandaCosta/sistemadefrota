import { FormEvent, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

type RoleOption = "MANAGER" | "OPERATOR";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleOption>("MANAGER");
  const [cpf, setCpf] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [driverCode, setDriverCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: Record<string, unknown> = {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
      };
      if (role === "OPERATOR") {
        payload.cpf = cpf;
        payload.driver_code = driverCode;
      }
      if (role === "MANAGER") {
        payload.manager_code = managerCode;
      }
      await axios.post("/api/auth/register/", {
        ...payload,
      });
      setSuccess("Conta criada com sucesso! Você já pode entrar.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err: unknown) {
      console.error(err);
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).response?.data
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (err as any).response.data as Record<string, string[]>;
        const firstKey = Object.keys(data)[0];
        const firstMsg = firstKey ? data[firstKey][0] : null;
        setError(firstMsg ?? "Não foi possível criar a conta.");
      } else {
        setError(
          "Não foi possível criar a conta. Verifique os dados e tente novamente.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-8 backdrop-blur-md">
        <h1 className="text-2xl font-semibold text-slate-50 mb-2">
          Criar conta
        </h1>
        <p className="text-sm text-slate-400 mb-4">
          Cadastre-se como <span className="font-semibold">Gestor</span> ou{" "}
          <span className="font-semibold">Motorista</span> para acessar o
          sistema de frotas.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Já tem conta?{" "}
          <Link
            to="/login"
            className="text-primary-300 hover:text-primary-200 underline-offset-2 hover:underline"
          >
            Fazer login
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("MANAGER")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                role === "MANAGER"
                  ? "border-primary-400 bg-primary-500/20 text-primary-100"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
            >
              Gestor
            </button>
            <button
              type="button"
              onClick={() => setRole("OPERATOR")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                role === "OPERATOR"
                  ? "border-primary-400 bg-primary-500/20 text-primary-100"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
            >
              Motorista
            </button>
          </div>

          {role === "OPERATOR" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  CPF do motorista (opcional)
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  CNH 
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={driverCode}
                  onChange={(e) => setDriverCode(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {role === "MANAGER" && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Código de gestor
              </label>
              <input
                type="text"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={managerCode}
                onChange={(e) => setManagerCode(e.target.value)}
                placeholder="Ex: GESTOR-123"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Nome
            </label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Sobrenome
            </label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

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
              E-mail
            </label>
            <input
              type="email"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {success && (
            <div className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white py-2.5 shadow-md shadow-primary-500/30 transition-transform duration-150 hover:-translate-y-0.5"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}


