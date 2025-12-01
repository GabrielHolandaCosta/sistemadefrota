import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Veiculo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
};

type Manutencao = {
  id: number;
  veiculo: number;
  data: string;
  tipo: string;
  descricao: string;
  custo: string;
  fornecedor?: string;
  hodometro?: number;
  proxima_manutencao_km?: number;
  proxima_manutencao_data?: string;
  status: string;
};

type ManutencaoFormData = {
  veiculo: number;
  data: string;
  tipo: string;
  descricao: string;
  custo: string;
  fornecedor: string;
  hodometro: string;
  proxima_manutencao_km: string;
  proxima_manutencao_data: string;
  status: string;
};

export function ManutencoesPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const role = useAppSelector((s) => s.auth.role);
  const isManager = role === "MANAGER";
  const [items, setItems] = useState<Manutencao[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Manutencao | null>(null);
  const [formData, setFormData] = useState<ManutencaoFormData>({
    veiculo: 0,
    data: new Date().toISOString().split("T")[0],
    tipo: "PREVENTIVA",
    descricao: "",
    custo: "",
    fornecedor: "",
    hodometro: "",
    proxima_manutencao_km: "",
    proxima_manutencao_data: "",
    status: "PENDENTE",
  });

  useEffect(() => {
    loadData();
    loadVeiculos();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get<Manutencao[]>("/api/manutencoes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadVeiculos() {
    if (!token) return;
    try {
      const res = await axios.get<Veiculo[]>("/api/veiculos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVeiculos(res.data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      veiculo: veiculos[0]?.id || 0,
      data: new Date().toISOString().split("T")[0],
      tipo: "PREVENTIVA",
      descricao: "",
      custo: "",
      fornecedor: "",
      hodometro: "",
      proxima_manutencao_km: "",
      proxima_manutencao_data: "",
      status: "PENDENTE",
    });
    setShowModal(true);
  }

  function openEditModal(item: Manutencao) {
    setEditingItem(item);
    setFormData({
      veiculo: item.veiculo,
      data: item.data.split("T")[0],
      tipo: item.tipo,
      descricao: item.descricao,
      custo: item.custo,
      fornecedor: item.fornecedor || "",
      hodometro: item.hodometro?.toString() || "",
      proxima_manutencao_km: item.proxima_manutencao_km?.toString() || "",
      proxima_manutencao_data: item.proxima_manutencao_data
        ? item.proxima_manutencao_data.split("T")[0]
        : "",
      status: item.status,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        veiculo: formData.veiculo,
        data: formData.data,
        tipo: formData.tipo,
        descricao: formData.descricao,
        custo: parseFloat(formData.custo) || 0,
        fornecedor: formData.fornecedor || "",
        hodometro: formData.hodometro ? parseInt(formData.hodometro) : null,
        proxima_manutencao_km: formData.proxima_manutencao_km
          ? parseInt(formData.proxima_manutencao_km)
          : null,
        proxima_manutencao_data:
          formData.proxima_manutencao_data || null,
        status: formData.status,
      };

      if (editingItem) {
        await axios.put(`/api/manutencoes/${editingItem.id}/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/manutencoes/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Erro ao salvar manutenção"
      );
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm("Tem certeza que deseja excluir esta manutenção?")) return;

    try {
      await axios.delete(`/api/manutencoes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (error) {
      alert("Erro ao excluir manutenção");
    }
  }

  function getVeiculoPlaca(veiculoId: number) {
    const veiculo = veiculos.find((v) => v.id === veiculoId);
    return veiculo ? `${veiculo.placa} - ${veiculo.marca} ${veiculo.modelo}` : "N/A";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Manutenções</h1>
          <p className="text-sm text-slate-400 mt-1">
            Histórico de manutenções preventivas e corretivas.
          </p>
        </div>
        {isManager && (
          <button
            onClick={openCreateModal}
            className="px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs font-medium text-white transition-colors"
          >
            + Nova Manutenção
          </button>
        )}
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
                Veículo
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Tipo
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Descrição
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Custo
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Ações
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
                <td className="px-3 py-2 text-slate-200">
                  {getVeiculoPlaca(m.veiculo)}
                </td>
                <td className="px-3 py-2 text-slate-200">{m.tipo}</td>
                <td className="px-3 py-2 text-slate-200 max-w-xs truncate">
                  {m.descricao}
                </td>
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
                <td className="px-3 py-2">
                  {isManager && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="text-primary-400 hover:text-primary-300 text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                  {!isManager && (
                    <span className="text-xs text-slate-500">Apenas visualização</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Nenhuma manutenção encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                {editingItem ? "Editar Manutenção" : "Nova Manutenção"}
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
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.data}
                      onChange={(e) =>
                        setFormData({ ...formData, data: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tipo *
                    </label>
                    <select
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value })
                      }
                    >
                      <option value="PREVENTIVA">Preventiva</option>
                      <option value="CORRETIVA">Corretiva</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Status *
                    </label>
                    <select
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="CONCLUIDA">Concluída</option>
                      <option value="VENCIDA">Vencida</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Custo (R$) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.custo}
                      onChange={(e) =>
                        setFormData({ ...formData, custo: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.fornecedor}
                      onChange={(e) =>
                        setFormData({ ...formData, fornecedor: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hodômetro
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.hodometro}
                      onChange={(e) =>
                        setFormData({ ...formData, hodometro: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Próxima Manutenção (Km)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.proxima_manutencao_km}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proxima_manutencao_km: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Próxima Manutenção (Data)
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.proxima_manutencao_data}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proxima_manutencao_data: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
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
                    {editingItem ? "Salvar Alterações" : "Criar Manutenção"}
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
