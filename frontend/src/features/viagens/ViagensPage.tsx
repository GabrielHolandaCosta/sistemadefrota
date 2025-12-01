import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Veiculo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  status: string;
  hodometro_atual?: number;
};

type Motorista = {
  id: number;
  nome_completo: string;
};

type Viagem = {
  id: number;
  veiculo: number;
  motorista: number;
  data_hora_inicio: string;
  data_hora_fim: string;
  hodometro_saida: number;
  hodometro_chegada: number;
  origem: string;
  destino: string;
  finalidade?: string;
  km_percorridos: number;
  status?: string;
};

type ViagemFormData = {
  veiculo: number;
  motorista: number;
  data_hora_inicio: string;
  data_hora_fim: string;
  hodometro_saida: string;
  hodometro_chegada: string;
  origem: string;
  destino: string;
  finalidade: string;
};

type ViagemEmAndamento = {
  id: number;
  veiculo: number;
  motorista: number;
  data_hora_inicio: string;
  data_hora_fim: string;
  origem: string;
  destino: string;
  finalidade?: string;
};

export function ViagensPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const role = useAppSelector((s) => s.auth.role);
  const isManager = role === "MANAGER";
  const isOperator = role === "OPERATOR";
  const [items, setItems] = useState<Viagem[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Viagem | null>(null);
  const [viagemEmAndamento, setViagemEmAndamento] = useState<ViagemEmAndamento | null>(null);
  const [tempoRestante, setTempoRestante] = useState<number>(0);
  const [formData, setFormData] = useState<ViagemFormData>({
    veiculo: 0,
    motorista: 0,
    data_hora_inicio: "",
    data_hora_fim: "",
    hodometro_saida: "",
    hodometro_chegada: "",
    origem: "",
    destino: "",
    finalidade: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadVeiculos();
    loadMotoristas(); // Carregar motoristas para todos verem os nomes
    if (isOperator) {
      checkViagemEmAndamento();
      const interval = setInterval(() => {
        checkViagemEmAndamento();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [token, isManager, isOperator]);

  useEffect(() => {
    if (viagemEmAndamento) {
      const interval = setInterval(() => {
        const agora = new Date().getTime();
        const fim = new Date(viagemEmAndamento.data_hora_fim).getTime();
        const restante = Math.max(0, Math.floor((fim - agora) / 1000));
        setTempoRestante(restante);

        if (restante === 0) {
          // Viagem concluída automaticamente
          finalizarViagemAutomatica();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [viagemEmAndamento]);

  async function loadData() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get<Viagem[]>("/api/viagens/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(res.data);
    } catch (error) {
      console.error("Erro ao carregar viagens:", error);
      } finally {
        setLoading(false);
      }
    }

  async function loadVeiculos() {
    if (!token) return;
    try {
      const res = await axios.get<Veiculo[]>("/api/veiculos/", {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: "ATIVO" }, // Apenas veículos ativos para iniciar viagem
      });
      setVeiculos(res.data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    }
  }

  async function loadMotoristas() {
    if (!token) return;
    try {
      const res = await axios.get<Motorista[]>("/api/motoristas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMotoristas(res.data);
    } catch (error) {
      console.error("Erro ao carregar motoristas:", error);
    }
  }

  async function checkViagemEmAndamento() {
    if (!token) return;
    try {
      const res = await axios.get<{ viagem: ViagemEmAndamento | null }>(
        "/api/viagens/em-andamento/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setViagemEmAndamento(res.data.viagem);
    } catch (error) {
      console.error("Erro ao verificar viagem em andamento:", error);
    }
  }

  async function iniciarViagemById(viagemId: number) {
    if (!token) return;
    const viagem = items.find((v) => v.id === viagemId);
    if (!viagem) return;

    const duracaoMinutos = prompt(
      "Informe a duração da viagem em minutos:",
      "60"
    );
    if (!duracaoMinutos) return;

    try {
      const res = await axios.post(
        `/api/viagens/${viagemId}/iniciar/`,
        { duracao_minutos: parseInt(duracaoMinutos) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setViagemEmAndamento(res.data);
      loadData();
      showSuccessMessage(
        `🚀 Viagem iniciada! ${viagem.origem} → ${viagem.destino}`
      );
    } catch (error: any) {
      showErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Erro ao iniciar viagem"
      );
    }
  }

  async function finalizarViagemAutomatica() {
    if (!token || !viagemEmAndamento) return;
    try {
      const veiculo = veiculos.find((v) => v.id === viagemEmAndamento.veiculo);
      const hodometroBase = veiculo?.hodometro_atual || 0;
      const hodometroChegada = hodometroBase + Math.floor(Math.random() * 100) + 50;

      await axios.post(
        `/api/viagens/${viagemEmAndamento.id}/finalizar/`,
        { hodometro_chegada: hodometroChegada },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setViagemEmAndamento(null);
      loadData();
      showSuccessMessage("🎉 Viagem concluída automaticamente!");
    } catch (error) {
      console.error("Erro ao finalizar viagem:", error);
    }
  }

  async function finalizarViagemManual() {
    if (!token || !viagemEmAndamento) return;
    const veiculo = veiculos.find((v) => v.id === viagemEmAndamento.veiculo);
    const hodometroBase = veiculo?.hodometro_atual || 0;
    const hodometroSugerido = hodometroBase + Math.floor(Math.random() * 100) + 50;
    
    const hodometroChegada = prompt(
      "Informe o hodômetro de chegada:",
      hodometroSugerido.toString()
    );
    if (!hodometroChegada) return;

    try {
      await axios.post(
        `/api/viagens/${viagemEmAndamento.id}/finalizar/`,
        { hodometro_chegada: parseInt(hodometroChegada) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setViagemEmAndamento(null);
      loadData();
      // Mostrar mensagem de sucesso animada
      showSuccessMessage("✅ Viagem finalizada com sucesso!");
    } catch (error: any) {
      showErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Erro ao finalizar viagem"
      );
    }
  }

  async function finalizarViagemById(viagemId: number) {
    if (!token) return;
    const viagem = items.find((v) => v.id === viagemId);
    if (!viagem) return;

    const veiculo = veiculos.find((v) => v.id === viagem.veiculo);
    const hodometroBase = veiculo?.hodometro_atual || viagem.hodometro_saida;
    const hodometroSugerido = hodometroBase + Math.floor(Math.random() * 100) + 50;
    
    const hodometroChegada = prompt(
      "Informe o hodômetro de chegada:",
      hodometroSugerido.toString()
    );
    if (!hodometroChegada) return;

    try {
      await axios.post(
        `/api/viagens/${viagemId}/finalizar/`,
        { hodometro_chegada: parseInt(hodometroChegada) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      loadData();
      showSuccessMessage("✅ Viagem finalizada com sucesso!");
    } catch (error: any) {
      showErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Erro ao finalizar viagem"
      );
    }
  }

  function showSuccessMessage(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  function showErrorMessage(message: string) {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  }

  function openCreateModal() {
    setEditingItem(null);
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 16);
    setFormData({
      veiculo: veiculos[0]?.id || 0,
      motorista: motoristas[0]?.id || 0,
      data_hora_inicio: nowStr,
      data_hora_fim: nowStr,
      hodometro_saida: "",
      hodometro_chegada: "",
      origem: "",
      destino: "",
      finalidade: "",
    });
    setShowModal(true);
  }

  function openEditModal(item: Viagem) {
    setEditingItem(item);
    setFormData({
      veiculo: item.veiculo,
      motorista: item.motorista,
      data_hora_inicio: item.data_hora_inicio.slice(0, 16),
      data_hora_fim: item.data_hora_fim.slice(0, 16),
      hodometro_saida: item.hodometro_saida.toString(),
      hodometro_chegada: item.hodometro_chegada.toString(),
      origem: item.origem,
      destino: item.destino,
      finalidade: item.finalidade || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        veiculo: formData.veiculo,
        motorista: formData.motorista,
        data_hora_inicio: formData.data_hora_inicio,
        data_hora_fim: formData.data_hora_fim,
        hodometro_saida: parseInt(formData.hodometro_saida) || 0,
        hodometro_chegada: parseInt(formData.hodometro_chegada) || 0,
        origem: formData.origem,
        destino: formData.destino,
        finalidade: formData.finalidade || "",
      };

      if (editingItem) {
        await axios.put(`/api/viagens/${editingItem.id}/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/viagens/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Erro ao salvar viagem"
      );
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm("Tem certeza que deseja excluir esta viagem?")) return;

    try {
      await axios.delete(`/api/viagens/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (error) {
      alert("Erro ao excluir viagem");
    }
  }

  function getVeiculoPlaca(veiculoId: number) {
    const veiculo = veiculos.find((v) => v.id === veiculoId);
    return veiculo ? veiculo.placa : "N/A";
  }

  function getMotoristaNome(motoristaId: number) {
    const motorista = motoristas.find((m) => m.id === motoristaId);
    return motorista ? motorista.nome_completo : "N/A";
  }

  function formatTempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-4">
      {/* Card de Viagem em Andamento (apenas para motoristas) */}
      {isOperator && viagemEmAndamento && (
        <div className="bg-gradient-to-r from-blue-900/50 via-cyan-900/50 to-blue-900/50 rounded-2xl border-2 border-blue-500 p-6 shadow-2xl animate-pulse-glow">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl animate-bounce">🚗</div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Viagem em Andamento
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  </h3>
                  <p className="text-sm text-blue-200 mt-1">
                    {viagemEmAndamento.origem} → {viagemEmAndamento.destino}
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-blue-950/30 rounded-lg p-4 border border-blue-700/50">
                <div className="text-5xl font-bold text-white mb-2 font-mono">
                  {formatTempo(tempoRestante)}
                </div>
                <p className="text-xs text-blue-200 uppercase tracking-wide">
                  Tempo restante
                </p>
              </div>
              {viagemEmAndamento.finalidade && (
                <p className="text-sm text-blue-200 mt-3 flex items-center gap-2">
                  <span>📋</span>
                  <span>{viagemEmAndamento.finalidade}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={finalizarViagemManual}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
              >
                <span>✓</span>
                <span>Finalizar Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Viagens</h1>
        <p className="text-sm text-slate-400 mt-1">
            {isOperator
              ? "Histórico de viagens e controle de rotas em tempo real"
              : "Histórico de viagens e rotas da frota"}
          </p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <button
              onClick={openCreateModal}
              className="px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs font-medium text-white transition-colors"
            >
              + Nova Viagem
            </button>
          )}
        </div>
      </div>

      {/* Mensagens de feedback */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-xl">❌</span>
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-sm text-slate-300">Carregando...</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 shadow-xl">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-slate-300">
                Início
              </th>
              <th className="px-3 py-3 text-left font-medium text-slate-300">
                Fim
              </th>
              <th className="px-3 py-3 text-left font-medium text-slate-300">
                Veículo
              </th>
              <th className="px-3 py-3 text-left font-medium text-slate-300">
                Motorista
              </th>
              <th className="px-3 py-3 text-left font-medium text-slate-300">
                Origem → Destino
              </th>
              <th className="px-3 py-3 text-left font-medium text-slate-300">
                Km
              </th>
              <th className="px-3 py-3 text-left font-medium text-slate-300">
                Status
              </th>
              <th className="px-3 py-3 text-left font-medium text-slate-300">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((v, index) => {
              // Usar status do backend
              const statusCalculado = v.status || "NÃO_INICIADA";
              const isNaoIniciada = statusCalculado === "NÃO_INICIADA";
              const isEmAndamento = statusCalculado === "EM_ANDAMENTO";
              const isFinalizada = statusCalculado === "FINALIZADA";
              const isMinhaViagem = isOperator && viagemEmAndamento?.id === v.id;

              return (
              <tr
                key={v.id}
                  className={`border-t border-slate-800 hover:bg-slate-900/70 transition-all duration-200 ${
                    isEmAndamento ? "bg-blue-950/20" : ""
                  } ${isMinhaViagem ? "ring-2 ring-blue-500" : ""}`}
                  style={{
                    animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <td className="px-3 py-3 text-slate-200">
                    {v.data_hora_inicio ? new Date(v.data_hora_inicio).toLocaleString("pt-BR") : "-"}
                  </td>
                  <td className="px-3 py-3 text-slate-200">
                    {v.data_hora_fim ? new Date(v.data_hora_fim).toLocaleString("pt-BR") : "-"}
                  </td>
                  <td className="px-3 py-3 text-slate-200 font-medium">
                    {getVeiculoPlaca(v.veiculo)}
                  </td>
                  <td className="px-3 py-3 text-slate-200">
                    {getMotoristaNome(v.motorista)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200">{v.origem}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-200 font-medium">{v.destino}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-200 font-medium">
                    {v.km_percorridos} km
                </td>
                  <td className="px-3 py-3">
                    {isNaoIniciada ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-gray-500/50 bg-gray-500/20 px-2.5 py-1 text-[10px] font-medium text-gray-300">
                        <span className="text-xs">○</span>
                        Não Iniciado
                      </span>
                    ) : isEmAndamento ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500 bg-blue-500/20 px-2.5 py-1 text-[10px] font-medium text-blue-300 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        Em Andamento
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-500/50 bg-green-500/20 px-2.5 py-1 text-[10px] font-medium text-green-300">
                        <span className="text-xs">✓</span>
                        Finalizada
                      </span>
                    )}
                </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {isOperator && isNaoIniciada && (
                        <button
                          onClick={() => iniciarViagemById(v.id)}
                          className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-[10px] font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-green-500/50"
                        >
                          🚀 Iniciar Viagem
                        </button>
                      )}
                      {isOperator && isEmAndamento && (
                        <button
                          onClick={() => finalizarViagemById(v.id)}
                          className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-[10px] font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-green-500/50"
                        >
                          ✓ Finalizar
                        </button>
                      )}
                      {isManager && (
                        <>
                          <button
                            onClick={() => openEditModal(v)}
                            className="px-3 py-1 rounded-md bg-primary-500/80 hover:bg-primary-500 text-[10px] font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="px-3 py-1 rounded-md bg-red-500/80 hover:bg-red-500 text-[10px] font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                </td>
              </tr>
              );
            })}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🚛</span>
                    <span>Nenhuma viagem encontrada.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Modal de Edição (apenas para gestores) */}
      {showModal && isManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                {editingItem ? "Editar Viagem" : "Nova Viagem"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Veículo *
                    </label>
                    <select
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.veiculo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          veiculo: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value={0}>Selecione um veículo</option>
                      {veiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Motorista *
                    </label>
                    <select
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.motorista}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          motorista: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value={0}>Selecione um motorista</option>
                      {motoristas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome_completo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Data/Hora Início *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.data_hora_inicio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_hora_inicio: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Data/Hora Fim *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.data_hora_fim}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_hora_fim: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hodômetro Saída *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.hodometro_saida}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hodometro_saida: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hodômetro Chegada *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.hodometro_chegada}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hodometro_chegada: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Origem *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.origem}
                      onChange={(e) =>
                        setFormData({ ...formData, origem: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Destino *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.destino}
                      onChange={(e) =>
                        setFormData({ ...formData, destino: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Finalidade
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.finalidade}
                    onChange={(e) =>
                      setFormData({ ...formData, finalidade: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-sm font-medium text-white transition-colors"
                  >
                    {editingItem ? "Salvar Alterações" : "Criar Viagem"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
