import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Abastecimento = {
  id: number;
  veiculo: number;
  data: string;
  hodometro: number;
  litros: string;
  custo_total: string;
  tipo_combustivel: string;
  media_km_l: string | null;
};

export function AbastecimentosPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [items, setItems] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get<Abastecimento[]>("/api/abastecimentos/", {
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
        <h1 className="text-xl font-semibold text-slate-50">
          Abastecimentos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Registro de abastecimentos e consumo médio da frota.
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
                Hodômetro
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Litros
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Custo Total
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Média (Km/L)
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr
                key={a.id}
                className="border-t border-slate-800 hover:bg-slate-900/70 transition-colors"
              >
                <td className="px-3 py-2 text-slate-200">
                  {new Date(a.data).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-3 py-2 text-slate-200">{a.hodometro}</td>
                <td className="px-3 py-2 text-slate-200">{a.litros}</td>
                <td className="px-3 py-2 text-slate-200">
                  {Number(a.custo_total).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {a.media_km_l
                    ? Number(a.media_km_l).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "-"}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Nenhum abastecimento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


