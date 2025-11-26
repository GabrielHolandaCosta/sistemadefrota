import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Manutencao = {
  id: number;
  veiculo: number;
  data: string;
  tipo: string;
  custo: string;
  status: string;
};

export function ManutencoesPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [items, setItems] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get<Manutencao[]>("/api/manutencoes/", {
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
        <h1 className="text-xl font-semibold text-slate-50">Manutenções</h1>
        <p className="text-sm text-slate-400 mt-1">
          Histórico de manutenções preventivas e corretivas.
        </p>
      </div>

      {loading && <div className="text-sm text-slate-300">Carregando...</div>}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Data
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Tipo
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Custo
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr
                key={m.id}
                className="border-t border-slate-800 hover:bg-slate-900/70 transition-colors"
              >
                <td className="px-3 py-2 text-slate-200">
                  {new Date(m.data).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-3 py-2 text-slate-200">{m.tipo}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200">
                    {m.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {Number(m.custo).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Nenhuma manutenção encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


