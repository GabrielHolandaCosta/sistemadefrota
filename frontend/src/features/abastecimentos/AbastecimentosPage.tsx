import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Veiculo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  tipo_combustivel: string;
};

type Abastecimento = {
  id: number;
  veiculo: number;
  data: string;
  hodometro: number;
  litros: string;
  custo_total: string;
  tipo_combustivel: string;
  posto?: string;
  media_km_l: string | null;
};

type AbastecimentoFormData = {
  veiculo: number;
  data: string;
  hodometro: string;
  litros: string;
  custo_total: string;
  tipo_combustivel: string;
  posto: string;
};

export function AbastecimentosPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const role = useAppSelector((s) => s.auth.role);
  const isManager = role === "MANAGER";
  const [items, setItems] = useState<Abastecimento[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Abastecimento | null>(null);
  const [formData, setFormData] = useState<AbastecimentoFormData>({
    veiculo: 0,
    data: new Date().toISOString().split("T")[0],
    hodometro: "",
    litros: "",
    custo_total: "",
    tipo_combustivel: "GASOLINA",
    posto: "",
  });

  useEffect(() => {
    loadData();
    loadVeiculos();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get<Abastecimento[]>("/api/abastecimentos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (error) {
      console.error("Erro ao carregar abastecimentos:", error);
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
      hodometro: "",
      litros: "",
      custo_total: "",
      tipo_combustivel: "GASOLINA",
      posto: "",
    });
    setShowModal(true);
  }

  function openEditModal(item: Abastecimento) {
    setEditingItem(item);
    setFormData({
      veiculo: item.veiculo,
      data: item.data.split("T")[0],
      hodometro: item.hodometro.toString(),
      litros: item.litros,
      custo_total: item.custo_total,
      tipo_combustivel: item.tipo_combustivel,
      posto: item.posto || "",
    });
    setShowModal(true);
  }

  function handleVeiculoChange(veiculoId: number) {
    const veiculo = veiculos.find((v) => v.id === veiculoId);
    setFormData({
      ...formData,
      veiculo: veiculoId,
      tipo_combustivel: veiculo?.tipo_combustivel || "GASOLINA",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        veiculo: formData.veiculo,
        data: formData.data,
        hodometro: parseInt(formData.hodometro) || 0,
        litros: parseFloat(formData.litros) || 0,
        custo_total: parseFloat(formData.custo_total) || 0,
        tipo_combustivel: formData.tipo_combustivel,
        posto: formData.posto || "",
      };

      if (editingItem) {
        await axios.put(`/api/abastecimentos/${editingItem.id}/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/abastecimentos/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Erro ao salvar abastecimento"
      );
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm("Tem certeza que deseja excluir este abastecimento?"))
      return;

    try {
      await axios.delete(`/api/abastecimentos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (error) {
      alert("Erro ao excluir abastecimento");
    }
  }

  function getVeiculoPlaca(veiculoId: number) {
    const veiculo = veiculos.find((v) => v.id === veiculoId);
    return veiculo ? veiculo.placa : "N/A";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            Abastecimentos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registro de abastecimentos e consumo médio da frota.
          </p>
        </div>
        {isManager && (
          <button
            onClick={openCreateModal}
            className="px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs font-medium text-white transition-colors"
          >
            + Novo Abastecimento
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
                Hodômetro
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Litros
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Combustível
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Custo Total
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Média (Km/L)
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Ações
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
                <td className="px-3 py-2 text-slate-200">
                  {getVeiculoPlaca(a.veiculo)}
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {a.hodometro.toLocaleString("pt-BR")} km
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {Number(a.litros).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  L
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {a.tipo_combustivel}
                </td>
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
                <td className="px-3 py-2">
                  {isManager && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(a)}
                        className="text-primary-400 hover:text-primary-300 text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
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
                  colSpan={8}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Nenhum abastecimento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                {editingItem ? "Editar Abastecimento" : "Novo Abastecimento"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Veículo *
                  </label>
                  <select
                    required
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.veiculo}
                    onChange={(e) =>
                      handleVeiculoChange(parseInt(e.target.value))
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

                <div className="grid grid-cols-2 gap-4">
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
                      Hodômetro *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.hodometro}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hodometro: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Litros *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.litros}
                      onChange={(e) =>
                        setFormData({ ...formData, litros: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Custo Total (R$) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.custo_total}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          custo_total: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tipo de Combustível *
                    </label>
                    <select
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.tipo_combustivel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo_combustivel: e.target.value,
                        })
                      }
                    >
                      <option value="GASOLINA">Gasolina</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="ETANOL">Etanol</option>
                      <option value="FLEX">Flex</option>
                      <option value="GNV">GNV</option>
                      <option value="ELETRICO">Elétrico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Posto
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.posto}
                      onChange={(e) =>
                        setFormData({ ...formData, posto: e.target.value })
                      }
                    />
                  </div>
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
                    {editingItem
                      ? "Salvar Alterações"
                      : "Criar Abastecimento"}
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
