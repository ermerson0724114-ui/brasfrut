import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Leaf, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [tab, setTab] = useState("employee");
  const [form, setForm] = useState({ registrationNumber: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [empId, setEmpId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const companyName = settings?.companyName || "Brasfrut";
  const logoUrl = settings?.logoUrl || null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", {
        type: tab === "admin" ? "admin" : "employee",
        username: form.registrationNumber,
        password: form.password,
      });
      const data = await res.json();
      if (data.needsPassword) {
        setNeedsPassword(true);
        setEmpId(data.employeeId);
      } else {
        setAuth(data.user, data.token);
        navigate(data.user.isAdmin ? "/admin" : "/dashboard");
        toast({ title: `Bem-vindo, ${data.user.name.split(" ")[0]}!` });
      }
    } catch (err: any) {
      const msg = err.message?.includes(":") ? err.message.split(": ").slice(1).join(": ") : "Credenciais inválidas";
      toast({ title: msg, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast({ title: "Mínimo 6 caracteres", variant: "destructive" });
    if (newPassword !== confirmPassword) return toast({ title: "Senhas não coincidem", variant: "destructive" });
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/create-password", { employeeId: empId, password: newPassword });
      const data = await res.json();
      setAuth(data.user, data.token);
      navigate("/dashboard");
      toast({ title: "Senha criada com sucesso!" });
    } catch {
      toast({ title: "Erro ao criar senha", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest("POST", "/api/auth/recover", { email: forgotEmail });
      const data = await res.json();
      setRecoveredPassword(data.password);
    } catch {
      toast({ title: "Email não autorizado para recuperação", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-green-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-green-800/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-green-700/20 blur-3xl" />
      </div>
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          {logoUrl ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 overflow-hidden bg-white/10 backdrop-blur-sm">
              <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-1" data-testid="img-login-logo" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-4">
              <Leaf size={40} className="text-green-300" />
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-white tracking-tight" data-testid="text-company-name">{companyName}</h1>
          <p className="text-green-300 text-sm mt-1 font-medium">Sistema de Pedidos</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          {forgotMode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => { setForgotMode(false); setRecoveredPassword(null); setForgotEmail(""); }}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center" data-testid="button-back-login">
                  <ArrowLeft size={16} />
                </button>
                <h2 className="font-bold text-gray-800">Recuperar senha</h2>
              </div>
              {recoveredPassword ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Sua senha atual é:</p>
                  <p className="text-2xl font-bold text-green-900 tracking-widest" data-testid="text-recovered-password">{recoveredPassword}</p>
                  <p className="text-xs text-gray-400 mt-3">Guarde em local seguro e altere após o login.</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-gray-500">Digite o email de recuperação cadastrado para visualizar a senha.</p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email de recuperação</label>
                    <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Digite o email cadastrado" data-testid="input-recovery-email" />
                  </div>
                  <button type="submit" className="w-full bg-green-900 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98]"
                    data-testid="button-recover-password">Recuperar senha</button>
                </form>
              )}
            </div>
          ) : !needsPassword ? (
            <>
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                {(["employee", "admin"] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setForm({ registrationNumber: "", password: "" }); }}
                    className={"flex-1 py-2 rounded-xl text-sm font-semibold transition-all " + (tab === t ? "bg-green-900 text-white shadow-sm" : "text-gray-500")}
                    data-testid={`tab-${t}`}>{t === "employee" ? "Funcionário" : "Administrador"}</button>
                ))}
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {tab === "employee" ? "Matrícula" : "Usuário"}
                  </label>
                  <input type="text" required value={form.registrationNumber}
                    onChange={e => setForm({ ...form, registrationNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder={tab === "employee" ? "Digite sua matrícula" : "Administrador"} data-testid="input-registration" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} required value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-12 transition-all"
                      placeholder="Digite sua senha" data-testid="input-password" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" data-testid="button-toggle-password">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-green-900 text-white font-bold py-3.5 rounded-2xl disabled:opacity-60 mt-2 transition-all active:scale-[0.98]"
                  data-testid="button-login">{loading ? "Entrando..." : "Entrar"}</button>
              </form>
              {tab === "admin" && (
                <button onClick={() => setForgotMode(true)} className="w-full text-center text-sm text-green-700 font-medium mt-4"
                  data-testid="button-forgot-password">Esqueci minha senha</button>
              )}
            </>
          ) : (
            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Leaf size={22} className="text-green-700" />
                </div>
                <h2 className="font-bold text-gray-800">Crie sua senha</h2>
                <p className="text-gray-500 text-sm mt-1">Primeiro acesso detectado</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nova senha</label>
                <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Mínimo 6 caracteres" data-testid="input-new-password" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar senha</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Repita a senha" data-testid="input-confirm-password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-green-900 text-white font-bold py-3.5 rounded-2xl disabled:opacity-60"
                data-testid="button-create-password">{loading ? "Salvando..." : "Criar senha"}</button>
            </form>
          )}
        </div>
        <p className="text-center text-green-400/60 text-xs mt-6">{companyName} Frutos do Brasil</p>
      </div>
    </div>
  );
}
