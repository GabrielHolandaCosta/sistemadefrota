import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useAppSelector } from "../../hooks";

type DashboardResumo = {
  veiculos_ativos: number;
  veiculos_manutencao: number;
  veiculos_inativos: number;
  manutencoes_pendentes: number;
  manutencoes_vencidas: number;
  documentacao_vencida: number;
};

type Veiculo = {
  id: number;
  status: string;
  tipo_combustivel: string;
};

type Abastecimento = {
  id: number;
  data: string;
  custo_total: string;
  litros: string;
};

type Manutencao = {
  id: number;
  tipo: string;
  custo: string;
};

export function DashboardPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const username = useAppSelector((s) => s.auth.username);
  const role = useAppSelector((s) => s.auth.role);
  const isManager = role === "MANAGER";
  const [data, setData] = useState<DashboardResumo | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [token]);

  async function loadAllData() {
    if (!token) return;
    setLoading(true);
    try {
      const [resumoRes, veiculosRes, abastecimentosRes, manutencoesRes] =
        await Promise.all([
          axios.get<DashboardResumo>("/api/dashboard/resumo/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Veiculo[]>("/api/veiculos/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Abastecimento[]>("/api/abastecimentos/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Manutencao[]>("/api/manutencoes/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setData(resumoRes.data);
      setVeiculos(veiculosRes.data);
      setAbastecimentos(abastecimentosRes.data);
      setManutencoes(manutencoesRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  const roleLabel =
    role === "MANAGER" ? "Gestor" : role === "OPERATOR" ? "Motorista" : "Usuário";

  // Dados para gráfico de status de veículos
  const veiculosStatusData = data
    ? [
        { name: "Ativos", value: data.veiculos_ativos, color: "#10b981" },
        { name: "Manutenção", value: data.veiculos_manutencao, color: "#f59e0b" },
        { name: "Inativos", value: data.veiculos_inativos, color: "#64748b" },
      ]
    : [];

  // Dados para gráfico de tipo de combustível
  const combustivelData = veiculos.reduce((acc, v) => {
    const tipo = v.tipo_combustivel;
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const combustivelChartData = Object.entries(combustivelData).map(([name, value]) => ({
    name,
    value,
  }));

  // Dados para gráfico de custos de abastecimento (últimos 7 dias)
  const ultimos7Dias = abastecimentos
    .filter((a) => {
      const dataAbastecimento = new Date(a.data);
      const hoje = new Date();
      const diffTime = Math.abs(hoje.getTime() - dataAbastecimento.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .reduce((acc, a) => {
      const dataStr = new Date(a.data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      const custo = parseFloat(a.custo_total) || 0;
      acc[dataStr] = (acc[dataStr] || 0) + custo;
      return acc;
    }, {} as Record<string, number>);

  const custosAbastecimentoData = Object.entries(ultimos7Dias).map(
    ([name, value]) => ({
      name,
      value: Math.round(value),
    })
  );

  // Dados para gráfico de tipos de manutenção
  const manutencoesTipoData = manutencoes.reduce((acc, m) => {
    const tipo = m.tipo;
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const manutencoesChartData = Object.entries(manutencoesTipoData).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // Cálculo de custos totais
  const custoTotalAbastecimentos = abastecimentos.reduce(
    (sum, a) => sum + (parseFloat(a.custo_total) || 0),
    0
  );
  const custoTotalManutencoes = manutencoes.reduce(
    (sum, m) => sum + (parseFloat(m.custo) || 0),
    0
  );

  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      {/* Header com boas-vindas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">
              Dashboard da Frota
            </h1>
            <p className="text-sm text-slate-300">
              Olá, <span className="text-primary-300 font-semibold">{username}</span>! 
              Você está logado como{" "}
              <span className="text-primary-300 font-semibold">{roleLabel}</span>.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Visão geral em tempo real dos principais indicadores da operação da frota.
              {!isManager && " Você tem acesso apenas para visualização dos dados."}
            </p>
          </div>
          <div className="hidden md:block text-6xl">🚛</div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-slate-300">Carregando dados...</div>
      )}

      {data && (
        <>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Veículos Ativos"
              value={data.veiculos_ativos}
              color="from-emerald-500 to-emerald-400"
              icon="🚗"
              description="Em operação"
            />
            <StatCard
              title="Em Manutenção"
              value={data.veiculos_manutencao}
              color="from-amber-500 to-amber-400"
              icon="🔧"
              description="Aguardando reparo"
            />
            <StatCard
              title="Inativos"
              value={data.veiculos_inativos}
              color="from-slate-500 to-slate-400"
              icon="⏸️"
              description="Fora de operação"
            />
            <StatCard
              title="Manutenções Pendentes"
              value={data.manutencoes_pendentes}
              color="from-cyan-500 to-cyan-400"
              icon="⏳"
              description="Aguardando ação"
            />
            <StatCard
              title="Manutenções Vencidas"
              value={data.manutencoes_vencidas}
              color="from-red-500 to-red-400"
              icon="⚠️"
              description="Requer atenção"
            />
            <StatCard
              title="Documentação Vencida"
              value={data.documentacao_vencida}
              color="from-fuchsia-500 to-fuchsia-400"
              icon="📄"
              description="IPVA ou Licenciamento"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Status de Veículos */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">
                Status da Frota
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={veiculosStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {veiculosStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Tipo de Combustível */}
            {combustivelChartData.length > 0 && (
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-50 mb-4">
                  Distribuição por Combustível
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={combustivelChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico de Custos de Abastecimento */}
            {custosAbastecimentoData.length > 0 && (
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-50 mb-4">
                  Custos de Abastecimento (Últimos 7 dias)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={custosAbastecimentoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) =>
                        `R$ ${value.toLocaleString("pt-BR")}`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico de Tipos de Manutenção */}
            {manutencoesChartData.length > 0 && (
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-50 mb-4">
                  Tipos de Manutenção
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={manutencoesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-2xl border border-emerald-800/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-50">
                  Total em Abastecimentos
                </h3>
                <span className="text-2xl">⛽</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400">
                R$ {custoTotalAbastecimentos.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {abastecimentos.length} abastecimento(s) registrado(s)
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl border border-purple-800/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-50">
                  Total em Manutenções
                </h3>
                <span className="text-2xl">🔧</span>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                R$ {custoTotalManutencoes.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {manutencoes.length} manutenção(ões) registrada(s)
              </p>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">
              Ações Rápidas
            </h2>
            <div className="flex flex-col gap-4">
              <QuickActionLink
                to="/veiculos"
                title="Gerenciar Veículos"
                description={
                  isManager
                    ? "Cadastrar, editar e visualizar veículos"
                    : "Visualizar veículos da frota"
                }
                icon="🚗"
                canEdit={isManager}
              />
              <QuickActionLink
                to="/motoristas"
                title="Gerenciar Motoristas"
                description={
                  isManager
                    ? "Cadastrar, editar e visualizar motoristas"
                    : "Visualizar motoristas cadastrados"
                }
                icon="👤"
                canEdit={isManager}
              />
              <QuickActionLink
                to="/manutencoes"
                title="Gerenciar Manutenções"
                description={
                  isManager
                    ? "Registrar e acompanhar manutenções"
                    : "Visualizar histórico de manutenções"
                }
                icon="🔧"
                canEdit={isManager}
              />
              <QuickActionLink
                to="/abastecimentos"
                title="Gerenciar Abastecimentos"
                description={
                  isManager
                    ? "Registrar abastecimentos e consumo"
                    : "Visualizar histórico de abastecimentos"
                }
                icon="⛽"
                canEdit={isManager}
              />
              <QuickActionLink
                to="/viagens"
                title="Gerenciar Viagens"
                description={
                  isManager
                    ? "Registrar e acompanhar viagens"
                    : "Visualizar histórico de viagens"
                }
                icon="🗺️"
                canEdit={isManager}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: number;
  color: string;
  icon: string;
  description: string;
};

function StatCard({ title, value, color, icon, description }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 px-5 py-5 shadow-lg hover:shadow-xl transition-shadow">
      <div
        className={`absolute inset-x-0 -top-10 h-20 bg-gradient-to-r ${color} opacity-20 blur-2xl`}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {title}
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-3xl font-bold text-slate-50 mb-1">{value}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </div>
  );
}

type QuickActionLinkProps = {
  to: string;
  title: string;
  description: string;
  icon: string;
  canEdit: boolean;
};

function QuickActionLink({
  to,
  title,
  description,
  icon,
  canEdit,
}: QuickActionLinkProps) {
  return (
    <Link
      to={to}
      className="block p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-primary-500/50 hover:bg-slate-900 transition-all group"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-50 group-hover:text-primary-300 transition-colors mb-1">
            {title}
          </div>
          <div className="text-xs text-slate-400">{description}</div>
          {!canEdit && (
            <div className="text-xs text-amber-400 mt-2">Apenas visualização</div>
          )}
        </div>
      </div>
    </Link>
  );
}
