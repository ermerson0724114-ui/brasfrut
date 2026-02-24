import { useState } from "react";
import { Plus, Edit2, Trash2, X, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockGroups } from "@/lib/mockData";

export default function AdminGroups() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>(mockGroups);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: 0, itemLimit: "" });
  const [subModal, setSubModal] = useState<{ groupId: number; id?: number } | null>(null);
  const [subForm, setSubForm] = useState({ name: "", itemLimit: "" });
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number } | null>(null);

  const openEdit = (g: any) => {
    setForm({ name: g.name, description: g.description || "", sortOrder: g.sort_order || 0, itemLimit: g.item_limit || "" });
    setEditId(g.id);
    setModal("edit");
  };

  const handleSave = () => {
    const payload = { ...form, item_limit: form.itemLimit ? parseInt(String(form.itemLimit)) : null, sort_order: form.sortOrder };
    if (modal === "add") {
      const newG = { id: Date.now(), name: payload.name, description: payload.description, item_limit: payload.item_limit, sort_order: payload.sort_order, subgroups: [] };
      setGroups(prev => [...prev, newG]);
      toast({ title: "Grupo adicionado!" });
    } else {
      setGroups(prev => prev.map(g => g.id === editId ? { ...g, ...payload } : g));
      toast({ title: "Grupo atualizado!" });
    }
    setModal(null);
  };

  const handleSaveSub = () => {
    if (!subModal) return;
    const payload = { name: subForm.name, item_limit: parseInt(subForm.itemLimit) };
    if (subModal.id) {
      setGroups(prev => prev.map(g => g.id === subModal.groupId ? { ...g, subgroups: g.subgroups.map((s: any) => s.id === subModal.id ? { ...s, ...payload } : s) } : g));
      toast({ title: "Subgrupo atualizado!" });
    } else {
      const newSub = { id: Date.now(), ...payload };
      setGroups(prev => prev.map(g => g.id === subModal.groupId ? { ...g, subgroups: [...g.subgroups, newSub] } : g));
      toast({ title: "Subgrupo adicionado!" });
    }
    setSubModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "group") {
      setGroups(prev => prev.filter(g => g.id !== deleteTarget.id));
    } else {
      setGroups(prev => prev.map(g => ({ ...g, subgroups: g.subgroups.filter((s: any) => s.id !== deleteTarget.id) })));
    }
    toast({ title: "Excluído com sucesso!" });
    setDeleteTarget(null);
  };

  return (
    <div className="bg-gray-50">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
            <Layers size={20} className="text-green-800" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-800">Grupos</h2>
            <p className="text-gray-500 text-xs">{groups.length} grupo(s)</p>
          </div>
        </div>
        <button
          onClick={() => { setForm({ name: "", description: "", sortOrder: 0, itemLimit: "" }); setEditId(null); setModal("add"); }}
          className="w-9 h-9 bg-green-900 text-white rounded-xl flex items-center justify-center"
          data-testid="button-add-group"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-2 pb-24">
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid={`card-group-${g.id}`}>
            <div className="flex items-center px-4 py-3 gap-3">
              <button className="flex-1 text-left" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                <p className="font-semibold text-gray-800">{g.name}</p>
                <p className="text-xs text-gray-500">
                  {g.item_limit ? `Limite: ${g.item_limit} itens` : `${g.subgroups?.length || 0} subgrupo(s)`}
                </p>
              </button>
              <div className="flex gap-1">
                <button
                  onClick={() => { setSubModal({ groupId: g.id }); setSubForm({ name: "", itemLimit: "" }); }}
                  className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"
                  data-testid={`button-add-subgroup-${g.id}`}
                >
                  <Plus size={13} />
                </button>
                <button onClick={() => openEdit(g)} className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-700" data-testid={`button-edit-group-${g.id}`}><Edit2 size={14} /></button>
                <button onClick={() => setDeleteTarget({ type: "group", id: g.id })} className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-500" data-testid={`button-delete-group-${g.id}`}><Trash2 size={14} /></button>
                <button onClick={() => setExpanded(expanded === g.id ? null : g.id)} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  {expanded === g.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>
            {expanded === g.id && g.subgroups?.length > 0 && (
              <div className="border-t border-gray-50 divide-y divide-gray-50">
                {g.subgroups.map((sub: any) => (
                  <div key={sub.id} className="flex items-center px-4 py-2.5 gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{sub.name}</p>
                      <p className="text-xs text-gray-500">Limite: {sub.item_limit} itens</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setSubModal({ groupId: g.id, id: sub.id }); setSubForm({ name: sub.name, itemLimit: String(sub.item_limit) }); }}
                        className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center text-green-700"><Edit2 size={12} /></button>
                      <button onClick={() => setDeleteTarget({ type: "subgroup", id: sub.id })}
                        className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl p-5"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-lg">{modal === "add" ? "Novo Grupo" : "Editar Grupo"}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "name", label: "Nome", placeholder: "Ex: Polpas" },
                { key: "description", label: "Descrição", placeholder: "Opcional" },
                { key: "sortOrder", label: "Ordem", placeholder: "0" },
                { key: "itemLimit", label: "Limite de itens (deixe vazio se tiver subgrupos)", placeholder: "Ex: 4" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-600 font-semibold">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3.5 bg-green-900 text-white rounded-2xl font-bold" data-testid="button-save-group">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {subModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl p-5"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-lg">{subModal.id ? "Editar Subgrupo" : "Novo Subgrupo"}</h2>
              <button onClick={() => setSubModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</label>
                <input value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })}
                  placeholder="Ex: Balde 3,2kg"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Limite de itens</label>
                <input type="number" value={subForm.itemLimit} onChange={e => setSubForm({ ...subForm, itemLimit: e.target.value })}
                  placeholder="Ex: 2"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setSubModal(null)} className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-600 font-semibold">Cancelar</button>
              <button onClick={handleSaveSub} className="flex-1 py-3.5 bg-green-900 text-white rounded-2xl font-bold" data-testid="button-save-subgroup">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-extrabold text-lg mb-2">Confirmar exclusão</h3>
            <p className="text-gray-500 text-sm mb-5">
              {deleteTarget.type === "group" ? "O grupo e todos os seus subgrupos serão excluídos." : "O subgrupo será excluído."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 border border-gray-200 rounded-2xl font-semibold text-gray-600">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold" data-testid="button-confirm-delete-group">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
