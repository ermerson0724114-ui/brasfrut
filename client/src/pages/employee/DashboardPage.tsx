import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Lock } from "lucide-react";
import { mockChartData, mockCurrentOrder, mockGroups } from "@/lib/mockData";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft:     { label: "Em edição",    color: "bg-amber-50 text-amber-700 border border-amber-200",  icon: Clock },
  confirmed: { label: "Confirmado",   color: "bg-green-50 text-green-700 border border-green-200",  icon: CheckCircle },
  closed:    { label: "Fechado",      color: "bg-gray-50 text-gray-500 border border-gray-200",     icon: Lock },
  none:      { label: "Não iniciado", color: "bg-blue-50 text-blue-600 border border-blue-200",     icon: AlertTriangle },
};

export default function DashboardPage() {
  const [chartData] = useState(mockChartData);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const currentOrder = mockCurrentOrder;
  const cycle = currentOrder?.cycle;

  const orderStatus = cycle?.status === "closed" ? "closed"
    : currentOrder?.status === "confirmed" ? "confirmed"
    : currentOrder?.status === "draft" ? "draft"
    : "none";

  const statusCfg = STATUS_CONFIG[orderStatus];
  const StatusIcon = statusCfg.icon;

  const now = new Date();
  const endDate = cycle ? new Date(cycle.end_date) : null;
  const isPastDeadline = endDate ? now > endDate : false;

  const deadlineText = endDate
    ? endDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "Sem ciclo ativo";

  return (
    <div className="px-4 py-4 space-y-4">
      {isPastDeadline && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <Lock size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-semibold">Prazo encerrado. Pedidos fechados.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className={"col-span-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1 " + statusCfg.color}
          data-testid="status-order">
          <StatusIcon size={20} />
          <p className="text-xs font-bold leading-tight">{statusCfg.label}</p>
        </div>
        <div className="col-span-1 bg-white rounded-2xl p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-gray-500 font-medium">Total</p>
          <p className="text-base font-extrabold text-green-900" data-testid="text-total">
            R$ {parseFloat(currentOrder?.total || "0").toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="col-span-1 bg-white rounded-2xl p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-gray-500 font-medium">Prazo</p>
          <p className="text-xs font-bold text-gray-800" data-testid="text-deadline">{deadlineText}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 text-sm">Histórico de Gastos</h2>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-2 py-1.5 outline-none focus:ring-2 focus:ring-green-500"
            data-testid="select-group-filter"
          >
            <option value="all">Todos os grupos</option>
            {mockGroups.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: any) => `R$ ${parseFloat(v).toFixed(2).replace(".", ",")}`} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === chartData.length - 1 ? "#14532d" : "#86efac"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {currentOrder?.items && currentOrder.items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-bold text-gray-800 text-sm">Pedido Atual — Fev/2026</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {currentOrder.items.map(item => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.product_name_snapshot}</p>
                  <p className="text-xs text-gray-500">{item.group_name_snapshot}
                    {item.subgroup_name_snapshot ? ` · ${item.subgroup_name_snapshot}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{item.quantity}x</p>
                  <p className="text-xs text-gray-500">
                    R$ {(parseFloat(item.unit_price) * item.quantity).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
