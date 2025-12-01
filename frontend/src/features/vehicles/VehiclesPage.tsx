import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Veiculo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor?: string;
  chassi?: string;
  tipo_combustivel: string;
  status: string;
  hodometro_atual: number;
  ipva_validade?: string;
  licenciamento_validade?: string;
  link_doc_ipva?: string;
  link_doc_licenciamento?: string;
  ipva_vencido?: boolean;
  licenciamento_vencido?: boolean;
};

type VeiculoFormData = {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  chassi: string;
  tipo_combustivel: string;
  status: string;
  hodometro_atual: number;
  ipva_validade: string;
  licenciamento_validade: string;
  link_doc_ipva: string;
  link_doc_licenciamento: string;
};

export function VehiclesPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const role = useAppSelector((s) => s.auth.role);
  const isManager = role === "MANAGER";
  const [items, setItems] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Veiculo | null>(null);
  const [formData, setFormData] = useState<VeiculoFormData>({
    placa: "",
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    cor: "",
    chassi: "",
    tipo_combustivel: "GASOLINA",
    status: "ATIVO",
    hodometro_atual: 0,
    ipva_validade: "",
    licenciamento_validade: "",
    link_doc_ipva: "",
    link_doc_licenciamento: "",
  });

  useEffect(() => {
    loadData();
  }, [token, search]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get<Veiculo[]>("/api/veiculos/", {
        headers: { Authorization: `Bearer ${token}` },
        params: search ? { placa: search } : undefined,
      });
      setItems(res.data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      placa: "",
      marca: "",
      modelo: "",
      ano: new Date().getFullYear(),
      cor: "",
      chassi: "",
      tipo_combustivel: "GASOLINA",
      status: "ATIVO",
      hodometro_atual: 0,
      ipva_validade: "",
      licenciamento_validade: "",
      link_doc_ipva: "",
      link_doc_licenciamento: "",
    });
    setShowModal(true);
  }

  function openEditModal(item: Veiculo) {
    setEditingItem(item);
    setFormData({
      placa: item.placa,
      marca: item.marca,
      modelo: item.modelo,
      ano: item.ano,
      cor: item.cor || "",
      chassi: item.chassi || "",
      tipo_combustivel: item.tipo_combustivel,
      status: item.status,
      hodometro_atual: item.hodometro_atual,
      ipva_validade: item.ipva_validade
        ? item.ipva_validade.split("T")[0]
        : "",
      licenciamento_validade: item.licenciamento_validade
        ? item.licenciamento_validade.split("T")[0]
        : "",
      link_doc_ipva: item.link_doc_ipva || "",
      link_doc_licenciamento: item.link_doc_licenciamento || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        ...formData,
        ipva_validade: formData.ipva_validade || null,
        licenciamento_validade: formData.licenciamento_validade || null,
        link_doc_ipva: formData.link_doc_ipva || "",
        link_doc_licenciamento: formData.link_doc_licenciamento || "",
      };

      if (editingItem) {
        await axios.put(`/api/veiculos/${editingItem.id}/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/veiculos/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Erro ao salvar veículo"
      );
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;

    try {
      await axios.delete(`/api/veiculos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (error) {
      alert("Erro ao excluir veículo");
    }
  }

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
          {isManager && (
            <button
              onClick={openCreateModal}
              className="px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs font-medium text-white transition-colors"
            >
              + Novo Veículo
            </button>
          )}
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
                Ano
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Combustível
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Hodômetro
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Ações
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
                <td className="px-3 py-2 text-slate-200">{v.ano}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200">
                    {v.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {v.tipo_combustivel}
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {v.hodometro_atual.toLocaleString("pt-BR")} km
                </td>
                <td className="px-3 py-2">
                  {isManager && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(v)}
                        className="text-primary-400 hover:text-primary-300 text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
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
                  Nenhum veículo encontrado.
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
                {editingItem ? "Editar Veículo" : "Novo Veículo"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Placa *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.placa}
                      onChange={(e) =>
                        setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.marca}
                      onChange={(e) =>
                        setFormData({ ...formData, marca: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.modelo}
                      onChange={(e) =>
                        setFormData({ ...formData, modelo: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Ano *
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.ano}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ano: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Cor
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.cor}
                      onChange={(e) =>
                        setFormData({ ...formData, cor: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Chassi
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.chassi}
                      onChange={(e) =>
                        setFormData({ ...formData, chassi: e.target.value })
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
                      <option value="ATIVO">Ativo</option>
                      <option value="MANUTENCAO">Manutenção</option>
                      <option value="INATIVO">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hodômetro Atual *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.hodometro_atual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hodometro_atual: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Validade IPVA
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.ipva_validade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ipva_validade: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Validade Licenciamento
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.licenciamento_validade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenciamento_validade: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Link Documento IPVA
                    </label>
                    <input
                      type="url"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.link_doc_ipva}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          link_doc_ipva: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Link Documento Licenciamento
                    </label>
                    <input
                      type="url"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.link_doc_licenciamento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          link_doc_licenciamento: e.target.value,
                        })
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
                    {editingItem ? "Salvar Alterações" : "Criar Veículo"}
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
