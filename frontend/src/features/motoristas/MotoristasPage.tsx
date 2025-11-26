import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Motorista = {
  id: number;
  nome_completo: string;
  cpf: string;
  cnh_numero: string;
  ativo: boolean;
};

export function MotoristasPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [items, setItems] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get<Motorista[]>("/api/motoristas/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Motoristas</h1>
        <p className="text-sm text-slate-400 mt-1">
          Lista de motoristas da frota.
        </p>
      </div>

      {loading && <div className="text-sm text-slate-300">Carregando...</div>}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Nome
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                CPF
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                CNH
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr
                key={m.id}
                className="border-t border-slate-800 hover:bg-slate-900/70 transition-colors"
              >
                <td className="px-3 py-2 text-slate-50">{m.nome_completo}</td>
                <td className="px-3 py-2 text-slate-200">{m.cpf}</td>
                <td className="px-3 py-2 text-slate-200">{m.cnh_numero}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      m.ativo
                        ? "border-emerald-500 text-emerald-300"
                        : "border-slate-600 text-slate-300"
                    }`}
                  >
                    {m.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Nenhum motorista encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


