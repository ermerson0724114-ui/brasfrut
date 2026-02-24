import { useState } from "react";
import { Plus, Edit2, X, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockCycles, MONTHS_FULL } from "@/lib/mockData";

const STATUS_LABELS: Record<string, string> = { open: "Aberto", closed: "Fechado" };
const emptyForm = { month: "", year: "", startDate: "", endDate: "", status: "open" };

export default function AdminCycles() {
  const { toast } = useToast();
  const [cycles, setCycles] = useState<any[]>(mockCycles);
  const [modal, setModal] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);

  const openEdit = (c: any) => {
    setForm({
      month: c.month,
      year: c.year,
      startDate: c.start_date?.slice(0, 16),
      endDate: c.end_date?.slice(0, 16),
      status: c.status,
    });
    setEditId(c.id);
    setModal("edit");
  };

  const handleSave = () => {
    if (modal === "add") {
      const newC = { id: Date.now(), month: parseInt(String(form.month)), year: parseInt(String(form.year)),
        start_date: form.startDate, end_date: form.endDate, status: form.status };
      setCycles(prev => [newC, ...prev]);
      toast({ title: "Ciclo adicionado!" });
    } else {
      setCycles(prev => prev.map(c => c.id === editId ? { ...c, month: parseInt(String(form.month)), year: parseInt(String(form.year)),
        start_date: form.startDate, end_date: form.endDate, status: form.status } : c));
      toast({ title: "Ciclo atualizado!" });
    }
    setModal(null);
    setForm(emptyForm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-900 text-white px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock size={22} />
          <div>
            <h1 className="text-xl font-extrabold">Ciclos</h1>
            <p className="text-green-200 text-xs">{cycles.length} ciclo(s)</p>
          </div>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setModal("add"); }}
          className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"
          data-testid="button-add-cycle"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-2 pb-24">
        {cycles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarClock size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum ciclo cadastrado</p>
          </div>
        ) : cycles.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between" data-testid={`card-cycle-${c.id}`}>
            <div>
              <p className="font-semibold text-gray-800">{MONTHS_FULL[c.month - 1]} / {c.year}</p>
              <p className="text-xs text-gray-500">
                {new Date(c.start_date).toLocaleDateString("pt-BR")} → {new Date(c.end_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={"text-xs font-bold px-2.5 py-1 rounded-full " +
                (c.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}
                data-testid={`status-cycle-${c.id}`}
              >
                {STATUS_LABELS[c.status]}
              </span>
              <button
                onClick={() => openEdit(c)}
                className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-700"
                data-testid={`button-edit-cycle-${c.id}`}
              >
                <Edit2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl p-5"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-lg">{modal === "add" ? "Novo Ciclo" : "Editar Ciclo"}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mês</label>
                  <select value={form.month} onChange={e => setForm({ ...form, month: parseInt(e.target.value) })}
                    className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Selecione</option>
                    {MONTHS_FULL.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ano</label>
                  <input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                    placeholder={String(new Date().getFullYear())}
                    className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de início</label>
                <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de encerramento</label>
                <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              {modal === "edit" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500">
                    <option value="open">Aberto</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-600 font-semibold">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3.5 bg-green-900 text-white rounded-2xl font-bold" data-testid="button-save-cycle">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
