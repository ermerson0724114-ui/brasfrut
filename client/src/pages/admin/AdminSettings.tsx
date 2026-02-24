import { useState, useRef } from "react";
import { Settings, Upload, Trash2, Leaf, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/lib/store";

export default function AdminSettings() {
  const { toast } = useToast();
  const { logoUrl, companyName, setLogoUrl, setCompanyName } = useSettingsStore();
  const [nameInput, setNameInput] = useState(companyName);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione uma imagem válida", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx. 2MB)", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoUrl(dataUrl);
      toast({ title: "Logo atualizada!" });
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    toast({ title: "Logo removida" });
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) {
      toast({ title: "Nome não pode ser vazio", variant: "destructive" });
      return;
    }
    setCompanyName(nameInput.trim());
    toast({ title: "Nome atualizado!" });
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
            <Image size={18} className="text-green-700" />
            <h3 className="font-bold text-gray-800">Logo da tela de login</h3>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" data-testid="img-settings-logo" />
              ) : (
                <Leaf size={36} className="text-gray-300" />
              )}
            </div>

            <div className="flex gap-2 w-full">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 py-3 bg-green-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 text-sm"
                data-testid="button-upload-logo"
              >
                <Upload size={16} />
                {logoUrl ? "Trocar Logo" : "Enviar Logo"}
              </button>
              {logoUrl && (
                <button
                  onClick={handleRemoveLogo}
                  className="py-3 px-4 bg-red-50 text-red-500 rounded-2xl font-semibold flex items-center justify-center gap-2 text-sm"
                  data-testid="button-remove-logo"
                >
                  <Trash2 size={16} />
                </button>
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
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Nome da empresa"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              data-testid="input-company-name"
            />
            <button
              onClick={handleSaveName}
              className="w-full py-3 bg-green-900 text-white rounded-2xl font-bold text-sm"
              data-testid="button-save-name"
            >
              Salvar nome
            </button>
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
