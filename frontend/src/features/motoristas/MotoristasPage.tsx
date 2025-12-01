import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../../hooks";

type Motorista = {
  id: number;
  nome_completo: string;
  cpf: string;
  cnh_numero: string;
  cnh_categoria: string;
  cnh_validade: string;
  ativo: boolean;
  cnh_vencida?: boolean;
};

type MotoristaFormData = {
  nome_completo: string;
  cpf: string;
  cnh_numero: string;
  cnh_categoria: string;
  cnh_validade: string;
  ativo: boolean;
};

export function MotoristasPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const role = useAppSelector((s) => s.auth.role);
  const isManager = role === "MANAGER";
  const [items, setItems] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Motorista | null>(null);
  const [formData, setFormData] = useState<MotoristaFormData>({
    nome_completo: "",
    cpf: "",
    cnh_numero: "",
    cnh_categoria: "",
    cnh_validade: "",
    ativo: true,
  });

  useEffect(() => {
    loadData();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get<Motorista[]>("/api/motoristas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (error) {
      console.error("Erro ao carregar motoristas:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      nome_completo: "",
      cpf: "",
      cnh_numero: "",
      cnh_categoria: "",
      cnh_validade: "",
      ativo: true,
    });
    setShowModal(true);
  }

  function openEditModal(item: Motorista) {
    setEditingItem(item);
    setFormData({
      nome_completo: item.nome_completo,
      cpf: item.cpf,
      cnh_numero: item.cnh_numero,
      cnh_categoria: item.cnh_categoria,
      cnh_validade: item.cnh_validade.split("T")[0],
      ativo: item.ativo,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        ...formData,
        cnh_validade: formData.cnh_validade,
      };

      if (editingItem) {
        await axios.put(`/api/motoristas/${editingItem.id}/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/motoristas/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Erro ao salvar motorista"
      );
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm("Tem certeza que deseja excluir este motorista?")) return;

    try {
      await axios.delete(`/api/motoristas/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (error) {
      alert("Erro ao excluir motorista");
    }
  }

  function formatCPF(cpf: string) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Motoristas</h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastro e consulta de motoristas da frota.
          </p>
        </div>
        {isManager && (
          <button
            onClick={openCreateModal}
            className="px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-xs font-medium text-white transition-colors"
          >
            + Novo Motorista
          </button>
        )}
      </div>

      {loading && <div className="text-sm text-slate-300">Carregando...</div>}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Nome
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                CPF
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                CNH
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Categoria
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Validade CNH
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-300">
                Status
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
                <td className="px-3 py-2 text-slate-50">{m.nome_completo}</td>
                <td className="px-3 py-2 text-slate-200">{formatCPF(m.cpf)}</td>
                <td className="px-3 py-2 text-slate-200">{m.cnh_numero}</td>
                <td className="px-3 py-2 text-slate-200">
                  {m.cnh_categoria}
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {new Date(m.cnh_validade).toLocaleDateString("pt-BR")}
                  {m.cnh_vencida && (
                    <span className="ml-2 text-red-400 text-[10px]">
                      (Vencida)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      m.ativo
                        ? "border-emerald-500 text-emerald-300"
                        : "border-slate-600 text-slate-300"
                    }`}
                  >
                    {m.ativo ? "Ativo" : "Inativo"}
                  </span>
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
                  Nenhum motorista encontrado.
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
                {editingItem ? "Editar Motorista" : "Novo Motorista"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.nome_completo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nome_completo: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.cpf}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, cpf: value });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Número da CNH *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.cnh_numero}
                    onChange={(e) =>
                      setFormData({ ...formData, cnh_numero: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoria CNH *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="Ex: B, AB, C, D"
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.cnh_categoria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cnh_categoria: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Validade CNH *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.cnh_validade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cnh_validade: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500"
                      checked={formData.ativo}
                      onChange={(e) =>
                        setFormData({ ...formData, ativo: e.target.checked })
                      }
                    />
                    <span className="text-xs font-medium text-slate-300">
                      Motorista ativo
                    </span>
                  </label>
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
                    {editingItem ? "Salvar Alterações" : "Criar Motorista"}
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
