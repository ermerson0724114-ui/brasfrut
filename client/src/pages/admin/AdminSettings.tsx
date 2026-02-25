import { useState, useRef } from "react";
import { Settings, Upload, Trash2, Leaf, Image, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });
  const companyName = settings?.companyName || "Brasfrut";
  const logoUrl = settings?.logoUrl || null;
  const [nameInput, setNameInput] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [nameLoaded, setNameLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (settings && !nameLoaded) {
    setNameInput(companyName);
    setNameLoaded(true);
  }

  const updateSettings = useMutation({
    mutationFn: (data: Record<string, string>) => apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/settings"] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast({ title: "Selecione uma imagem válida", variant: "destructive" });
    if (file.size > 2 * 1024 * 1024) return toast({ title: "Imagem muito grande (máx. 2MB)", variant: "destructive" });
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings.mutate({ logoUrl: reader.result as string }, {
        onSuccess: () => toast({ title: "Logo atualizada!" }),
        onError: () => toast({ title: "Erro ao salvar logo", variant: "destructive" }),
      });
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemoveLogo = () => {
    updateSettings.mutate({ logoUrl: "" }, {
      onSuccess: () => toast({ title: "Logo removida" }),
    });
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) return toast({ title: "Nome não pode ser vazio", variant: "destructive" });
    updateSettings.mutate({ companyName: nameInput.trim() });
    toast({ title: "Nome atualizado!" });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPw !== settings?.adminPassword) return toast({ title: "Senha atual incorreta", variant: "destructive" });
    if (newPw.length < 6) return toast({ title: "Nova senha: mínimo 6 caracteres", variant: "destructive" });
    if (newPw !== confirmPw) return toast({ title: "Senhas não coincidem", variant: "destructive" });
    updateSettings.mutate({ adminPassword: newPw });
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast({ title: "Senha alterada com sucesso!" });
  };

  return (
    <div className="bg-gray-50">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
            <Settings size={20} className="text-green-800" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-800">Configurações</h2>
            <p className="text-gray-500 text-xs">Personalização do sistema</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-green-700" />
            <h3 className="font-bold text-gray-800">Alterar senha do administrador</h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Senha atual</label>
              <input type="password" required value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Digite a senha atual" data-testid="input-current-password" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nova senha</label>
              <input type="password" required minLength={6} value={newPw} onChange={e => setNewPw(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Mínimo 6 caracteres" data-testid="input-settings-new-password" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmar nova senha</label>
              <input type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Repita a nova senha" data-testid="input-settings-confirm-password" />
            </div>
            <button type="submit" className="w-full py-3 bg-green-900 text-white rounded-2xl font-bold text-sm"
              data-testid="button-change-admin-password">Alterar senha</button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Image size={18} className="text-green-700" />
            <h3 className="font-bold text-gray-800">Logo da tela de login</h3>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" data-testid="img-settings-logo" />
                : <Leaf size={36} className="text-gray-300" />}
            </div>
            <div className="flex gap-2 w-full">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileRef.current?.click()}
                className="flex-1 py-3 bg-green-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 text-sm"
                data-testid="button-upload-logo"><Upload size={16} />{logoUrl ? "Trocar Logo" : "Enviar Logo"}</button>
              {logoUrl && (
                <button onClick={handleRemoveLogo}
                  className="py-3 px-4 bg-red-50 text-red-500 rounded-2xl font-semibold flex items-center justify-center gap-2 text-sm"
                  data-testid="button-remove-logo"><Trash2 size={16} /></button>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center">Formatos: PNG, JPG, SVG. Máximo: 2MB</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-green-700" />
            <h3 className="font-bold text-gray-800">Nome da empresa</h3>
          </div>
          <div className="space-y-3">
            <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Nome da empresa"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              data-testid="input-company-name" />
            <button onClick={handleSaveName} className="w-full py-3 bg-green-900 text-white rounded-2xl font-bold text-sm"
              data-testid="button-save-name">Salvar nome</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Pré-visualização</h3>
          <div className="bg-gradient-to-br from-green-950 via-green-900 to-green-800 rounded-2xl p-6">
            <div className="text-center">
              {logoUrl ? (
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2 overflow-hidden bg-white/10 backdrop-blur-sm">
                  <img src={logoUrl} alt="Preview" className="w-full h-full object-contain p-0.5" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl mb-2">
                  <Leaf size={28} className="text-green-300" />
                </div>
              )}
              <h4 className="text-lg font-extrabold text-white">{companyName}</h4>
              <p className="text-green-300 text-xs mt-0.5">Sistema de Pedidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
