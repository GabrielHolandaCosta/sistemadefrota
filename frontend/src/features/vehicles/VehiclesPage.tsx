import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Veiculo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  status: string;
  tipo_combustivel: string;
};

export function VehiclesPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [items, setItems] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get<Veiculo[]>("/api/veiculos/", {
          headers: { Authorization: `Bearer ${token}` },
          params: search ? { placa: search } : undefined,
        });
        setItems(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Veículos</h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastro e consulta de veículos da frota.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Buscar por placa..."
            className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="text-sm text-slate-300">Carregando...</div>}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Placa
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Modelo
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Combustível
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr
                key={v.id}
                className="border-t border-slate-800 hover:bg-slate-900/70 transition-colors"
              >
                <td className="px-3 py-2 font-medium text-slate-50">
                  {v.placa}
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {v.marca} {v.modelo}
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200">
                    {v.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {v.tipo_combustivel}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Nenhum veículo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


