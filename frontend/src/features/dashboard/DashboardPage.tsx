import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type DashboardResumo = {
  veiculos_ativos: number;
  veiculos_manutencao: number;
  veiculos_inativos: number;
  manutencoes_pendentes: number;
  manutencoes_vencidas: number;
  documentacao_vencida: number;
};

export function DashboardPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [data, setData] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get<DashboardResumo>("/api/dashboard/resumo/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
          Dashboard da Frota
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Visão geral em tempo real dos principais indicadores da operação.
        </p>
      </div>

      {loading && <div className="text-sm text-slate-300">Carregando...</div>}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Veículos Ativos"
            value={data.veiculos_ativos}
            color="from-emerald-500 to-emerald-400"
          />
          <StatCard
            title="Em Manutenção"
            value={data.veiculos_manutencao}
            color="from-amber-500 to-amber-400"
          />
          <StatCard
            title="Inativos"
            value={data.veiculos_inativos}
            color="from-slate-500 to-slate-400"
          />
          <StatCard
            title="Manutenções Pendentes"
            value={data.manutencoes_pendentes}
            color="from-cyan-500 to-cyan-400"
          />
          <StatCard
            title="Manutenções Vencidas"
            value={data.manutencoes_vencidas}
            color="from-red-500 to-red-400"
          />
          <StatCard
            title="Doc. Vencida"
            value={data.documentacao_vencida}
            color="from-fuchsia-500 to-fuchsia-400"
          />
        </div>
      )}
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: number;
  color: string;
};

function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-4 shadow-lg">
      <div
        className={`absolute inset-x-0 -top-10 h-20 bg-gradient-to-r ${color} opacity-20 blur-2xl`}
      />
      <div className="relative space-y-1">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          {title}
        </div>
        <div className="text-2xl font-semibold text-slate-50">{value}</div>
      </div>
    </div>
  );
}


