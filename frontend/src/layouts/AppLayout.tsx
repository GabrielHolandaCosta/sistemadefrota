import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout } from "../features/auth/authSlice";

type Props = {
  children: ReactNode;
};

export function AppLayout({ children }: Props) {
  const dispatch = useAppDispatch();
  const username = useAppSelector((s) => s.auth.username);
  const role = useAppSelector((s) => s.auth.role);

  function handleLogout() {
    dispatch(logout());
  }

  const navLinkClass =
    "px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800/80 transition-colors";

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80">
        <div className="px-4 py-4 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary-500 shadow-lg shadow-primary-500/50" />
            <div>
              <div className="text-sm font-semibold">Sistema de Frotas</div>
              <div className="text-xs text-slate-400">
                Gestão em tempo real
              </div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {role !== "OPERATOR" && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {role !== "OPERATOR" && (
            <NavLink to="/veiculos" className={navLinkClass}>
              Veículos
            </NavLink>
          )}
          {role !== "OPERATOR" && (
            <NavLink to="/motoristas" className={navLinkClass}>
              Motoristas
            </NavLink>
          )}
          {role !== "OPERATOR" && (
            <NavLink to="/manutencoes" className={navLinkClass}>
              Manutenções
            </NavLink>
          )}
          {role !== "OPERATOR" && (
            <NavLink to="/abastecimentos" className={navLinkClass}>
              Abastecimentos
            </NavLink>
          )}
          <NavLink to="/viagens" className={navLinkClass}>
            {role === "OPERATOR" ? "Minhas viagens" : "Viagens"}
          </NavLink>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <span className="h-7 w-7 rounded-lg bg-primary-500" />
            <span className="font-semibold text-sm">Sistema de Frotas</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {username && (
              <div className="text-xs text-slate-300">
                <span className="font-medium">{username}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-700 hover:border-primary-400 hover:text-primary-200 transition-colors"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}


