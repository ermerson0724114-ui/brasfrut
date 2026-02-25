import { useState, useRef } from "react";
import { Plus, Search, Edit2, Trash2, Unlock, Upload, X, Users, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Employee } from "@shared/schema";

const emptyForm = { name: "", registrationNumber: "", email: "", whatsapp: "", funcao: "", setor: "", distribuicao: "" };

export default function AdminEmployees() {
  const { toast } = useToast();
  const { data: employees = [], isLoading } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [passwordModal, setPasswordModal] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const csvRef = useRef<HTMLInputElement>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/employees"] });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/employees", data),
    onSuccess: invalidate,
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/employees/${id}`, data),
    onSuccess: invalidate,
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/employees/${id}`),
    onSuccess: invalidate,
  });
  const bulkMut = useMutation({
    mutationFn: (data: any[]) => apiRequest("POST", "/api/employees/bulk", data),
    onSuccess: invalidate,
  });

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.registration_number?.includes(search)
  );

  const openEdit = (emp: Employee) => {
    setForm({
      name: emp.name, registrationNumber: emp.registration_number, email: emp.email || "",
      whatsapp: emp.whatsapp || "", funcao: emp.funcao || "", setor: emp.setor || "", distribuicao: emp.distribuicao || "",
    });
    setEditId(emp.id);
    setModal("edit");
  };

  const handleSave = () => {
    if (modal === "add") {
      createMut.mutate({
        name: form.name, registration_number: form.registrationNumber, password: "",
        email: form.email, whatsapp: form.whatsapp, funcao: form.funcao,
        setor: form.setor, distribuicao: form.distribuicao, is_locked: false,
      });
      toast({ title: "Funcionário adicionado!" });
    } else if (editId !== null) {
      updateMut.mutate({
        id: editId, data: {
          name: form.name, registration_number: form.registrationNumber,
          email: form.email, whatsapp: form.whatsapp, funcao: form.funcao,
          setor: form.setor, distribuicao: form.distribuicao,
        }
      });
      toast({ title: "Funcionário atualizado!" });
    }
    setModal(null);
    setForm(emptyForm);
  };

  const handleDelete = () => {
    if (deleteId !== null) deleteMut.mutate(deleteId);
    toast({ title: "Funcionário excluído" });
    setDeleteId(null);
  };

  const handleUnlock = (id: number) => {
    updateMut.mutate({ id, data: { is_locked: false } });
    toast({ title: "Funcionário desbloqueado" });
  };

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) return toast({ title: "Mínimo 6 caracteres", variant: "destructive" });
    if (passwordModal !== null) updateMut.mutate({ id: passwordModal, data: { password: newPassword } });
    toast({ title: "Senha alterada com sucesso!" });
    setPasswordModal(null);
    setNewPassword("");
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const emps = lines.map(line => {
        const cols = line.split(",").map(c => c.trim());
        return {
          registration_number: cols[0] || "", name: cols[1] || "", email: cols[2] || "",
          whatsapp: cols[3] || "", funcao: cols[4] || "", setor: cols[5] || "",
          distribuicao: cols[6] || "", password: "", is_locked: false,
        };
      }).filter(e => e.name);
      bulkMut.mutate(emps);
      toast({ title: `${emps.length} funcionário(s) importado(s)!` });
      setModal(null);
    };
    reader.readAsText(file);
    if (csvRef.current) csvRef.current.value = "";
  };

  const fields = [
    { key: "name", label: "Nome completo", placeholder: "Nome do funcionário" },
    { key: "registrationNumber", label: "Matrícula", placeholder: "Ex: 001234" },
    { key: "email", label: "E-mail", placeholder: "email@brasfrut.com.br" },
    { key: "whatsapp", label: "WhatsApp", placeholder: "(11) 99999-9999" },
    { key: "funcao", label: "Função", placeholder: "Ex: Operador" },
    { key: "setor", label: "Setor", placeholder: "Ex: Produção" },
    { key: "distribuicao", label: "Distribuição", placeholder: "Ex: Matriz" },
  ];

  if (isLoading) return <div className="text-center py-20 text-gray-400"><p className="text-sm">Carregando...</p></div>;

  return (
    <div className="bg-gray-50">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
              <Users size={20} className="text-green-800" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">Funcionários</h2>
              <p className="text-gray-500 text-xs">{employees.length} cadastrado(s)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal("csv")} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600" data-testid="button-import-csv"><Upload size={16} /></button>
            <button onClick={() => { setForm(emptyForm); setEditId(null); setModal("add"); }} className="w-9 h-9 bg-green-900 text-white rounded-xl flex items-center justify-center" data-testid="button-add-employee"><Plus size={18} /></button>
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou matrícula..."
            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            data-testid="input-search-employees" />
        </div>
      </div>

      <div className="px-4 py-3 space-y-2 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum funcionário</p>
          </div>
        ) : filtered.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3" data-testid={`card-employee-${emp.id}`}>
            <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-green-800 text-sm">{emp.name.split(" ").slice(0, 2).map(n => n[0]).join("")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-800 text-sm truncate">{emp.name}</p>
                {emp.is_locked && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Bloqueado</span>}
              </div>
              <p className="text-xs text-gray-500">{emp.registration_number} · {emp.funcao || emp.setor || "-"}</p>
            </div>
            <div className="flex gap-1">
              {emp.is_locked && <button onClick={() => handleUnlock(emp.id)} className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600" data-testid={`button-unlock-${emp.id}`}><Unlock size={14} /></button>}
              <button onClick={() => { setPasswordModal(emp.id); setNewPassword(""); }} className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600" data-testid={`button-password-${emp.id}`}><Key size={13} /></button>
              <button onClick={() => openEdit(emp)} className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-700" data-testid={`button-edit-employee-${emp.id}`}><Edit2 size={14} /></button>
              <button onClick={() => setDeleteId(emp.id)} className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-500" data-testid={`button-delete-employee-${emp.id}`}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "92vh" }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <h2 className="font-extrabold text-lg">{modal === "add" ? "Novo Funcionário" : "Editar Funcionário"}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 space-y-3 pb-2">
              {fields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                    className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500" data-testid={`input-${key}`} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-5 py-4 flex-shrink-0 bg-white border-t border-gray-100" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
              <button onClick={() => setModal(null)} className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-600 font-semibold">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3.5 bg-green-900 text-white rounded-2xl font-bold" data-testid="button-save-employee">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {passwordModal !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg">Alterar Senha</h3>
              <button onClick={() => setPasswordModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} /></button>
            </div>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="Nova senha (mín. 6 caracteres)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500 mb-4"
              data-testid="input-new-password-admin" />
            <div className="flex gap-3">
              <button onClick={() => setPasswordModal(null)} className="flex-1 py-3 border border-gray-200 rounded-2xl text-gray-600 font-semibold">Cancelar</button>
              <button onClick={handleChangePassword} className="flex-1 py-3 bg-green-900 text-white rounded-2xl font-bold" data-testid="button-save-password">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {modal === "csv" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl p-5" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-lg">Importar CSV</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-600 font-medium mb-1">Formato (7 colunas):</p>
              <code className="text-xs text-gray-500">matricula, nome, email, whatsapp, funcao, setor, distribuicao</code>
            </div>
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
            <button onClick={() => csvRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-green-300 rounded-2xl text-green-700 font-semibold flex items-center justify-center gap-2"
              data-testid="button-select-csv"><Upload size={20} /> Selecionar CSV</button>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-extrabold text-lg mb-2">Confirmar exclusão</h3>
            <p className="text-gray-500 text-sm mb-5">O funcionário será desativado e não aparecerá mais na lista.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-gray-200 rounded-2xl font-semibold text-gray-600">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold" data-testid="button-confirm-delete-employee">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
