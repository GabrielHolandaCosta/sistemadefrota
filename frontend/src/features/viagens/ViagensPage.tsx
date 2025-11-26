import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Viagem = {
  id: number;
  veiculo: number;
  motorista: number;
  data_hora_inicio: string;
  data_hora_fim: string;
  origem: string;
  destino: string;
  km_percorridos: number;
};

export function ViagensPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [items, setItems] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get<Viagem[]>("/api/viagens/", {
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
        <h1 className="text-xl font-semibold text-slate-50">Viagens</h1>
        <p className="text-sm text-slate-400 mt-1">
          Histórico de viagens e rotas da frota.
        </p>
      </div>

      {loading && <div className="text-sm text-slate-300">Carregando...</div>}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Início
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Fim
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Origem
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Destino
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Km
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr
                key={v.id}
                className="border-t border-slate-800 hover:bg-slate-900/70 transition-colors"
              >
                <td className="px-3 py-2 text-slate-200">
                  {new Date(v.data_hora_inicio).toLocaleString("pt-BR")}
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {new Date(v.data_hora_fim).toLocaleString("pt-BR")}
                </td>
                <td className="px-3 py-2 text-slate-200">{v.origem}</td>
                <td className="px-3 py-2 text-slate-200">{v.destino}</td>
                <td className="px-3 py-2 text-slate-200">
                  {v.km_percorridos}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Nenhuma viagem encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


