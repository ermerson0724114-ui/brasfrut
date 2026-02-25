import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Lock, CalendarClock } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { MONTHS, MONTHS_FULL } from "@/lib/mockData";
import type { Cycle } from "@shared/schema";

interface OrderItem { id: number; product_id: number; quantity: number; product_name_snapshot: string; group_name_snapshot: string; subgroup_name_snapshot: string | null; unit_price: string; }
interface OrderData { id: number; employee_id: number; employee_name: string; status: string; total: string; cycle_id: number; items: OrderItem[]; }
interface GroupData { id: number; name: string; subgroups: { id: number; name: string; item_limit: number | null }[]; }
interface CurrentCycleData { cycle: Cycle; isOpen: boolean; daysRemaining: number; daysUntilOpen: number; }

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft:     { label: "Em edição",    color: "bg-amber-50 text-amber-700 border border-amber-200",  icon: Clock },
  confirmed: { label: "Confirmado",   color: "bg-green-50 text-green-700 border border-green-200",  icon: CheckCircle },
  closed:    { label: "Fechado",      color: "bg-gray-50 text-gray-500 border border-gray-200",     icon: Lock },
  none:      { label: "Não iniciado", color: "bg-blue-50 text-blue-600 border border-blue-200",     icon: AlertTriangle },
};

function groupItems(items: OrderItem[]) {
  const map = new Map<string, OrderItem[]>();
  for (const item of items) {
    const key = item.group_name_snapshot || "Outros";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([groupName, groupItems]) => ({
    groupName,
    items: groupItems,
    subtotal: groupItems.reduce((s, i) => s + parseFloat(i.unit_price) * i.quantity, 0),
  }));
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: orders = [] } = useQuery<OrderData[]>({ queryKey: ["/api/orders"] });
  const { data: cycles = [] } = useQuery<Cycle[]>({ queryKey: ["/api/cycles"] });
  const { data: groups = [] } = useQuery<GroupData[]>({ queryKey: ["/api/groups"] });
  const { data: currentCycleData } = useQuery<CurrentCycleData>({ queryKey: ["/api/cycle/current"] });
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const activeCycle = currentCycleData?.cycle;
  const isOpen = currentCycleData?.isOpen ?? false;
  const daysRemaining = currentCycleData?.daysRemaining ?? 0;
  const daysUntilOpen = currentCycleData?.daysUntilOpen ?? 0;

  const myOrders = orders.filter(o => o.employee_id === user?.id);
  const currentOrder = activeCycle ? myOrders.find(o => o.cycle_id === activeCycle.id) : undefined;

  const orderStatus = !isOpen ? "closed"
    : currentOrder?.status === "confirmed" ? "confirmed"
    : currentOrder?.status === "draft" ? "draft"
    : "none";

  const statusCfg = STATUS_CONFIG[orderStatus];
  const StatusIcon = statusCfg.icon;

  const endDate = activeCycle ? new Date(activeCycle.end_date) : null;
  const deadlineText = endDate
    ? endDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  const currentYear = new Date().getFullYear();
  const chartData = MONTHS.map((label, i) => {
    const monthOrders = myOrders.filter(o => {
      const cycle = cycles.find(c => c.id === o.cycle_id);
      return cycle && cycle.month === i + 1 && cycle.year === currentYear;
    });
    const total = monthOrders.reduce((s, o) => {
      if (selectedGroup === "all") return s + parseFloat(o.total || "0");
      const groupItems = o.items?.filter(item => item.group_name_snapshot === groups.find(g => String(g.id) === selectedGroup)?.name) || [];
      return s + groupItems.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0);
    }, 0);
    return { label, total };
  });

  const grouped = currentOrder?.items ? groupItems(currentOrder.items) : [];
  const grandTotal = parseFloat(currentOrder?.total || "0");

  return (
    <div className="px-4 py-4 space-y-4">
      {isOpen ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3" data-testid="banner-cycle-open">
          <CalendarClock size={20} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">
              Pedidos abertos — {daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"}
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              {activeCycle ? `${MONTHS_FULL[activeCycle.month - 1]} / ${activeCycle.year}` : ""} · Encerra em {deadlineText}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3" data-testid="banner-cycle-closed">
          <Lock size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">
              Pedidos fechados — abre em {daysUntilOpen} {daysUntilOpen === 1 ? "dia" : "dias"}
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Período de pedidos: dia 15 ao último dia do mês
            </p>
          </div>
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
            R$ {grandTotal.toFixed(2).replace(".", ",")}
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
            {groups.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
          </select>
        </div>
        {chartData.some(d => d.total > 0) ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => `R$ ${parseFloat(v).toFixed(2).replace(".", ",")}`} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length - 1 ? "#1e40af" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">Sem dados para exibir</p>
          </div>
        )}
      </div>

      {grouped.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-bold text-gray-800 text-sm">Pedido Atual</h2>
          </div>
          {grouped.map((group, gi) => (
            <div key={group.groupName}>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{group.groupName}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {group.items.map(item => (
                  <div key={item.id} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.product_name_snapshot}</p>
                      {item.subgroup_name_snapshot && (
                        <p className="text-xs text-gray-400">{item.subgroup_name_snapshot}</p>
                      )}
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
              <div className="px-4 py-2 bg-gray-50/60 flex justify-between border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500">Subtotal {group.groupName}</p>
                <p className="text-xs font-bold text-gray-700">R$ {group.subtotal.toFixed(2).replace(".", ",")}</p>
              </div>
              {gi < grouped.length - 1 && <div className="border-b border-gray-100" />}
            </div>
          ))}
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between bg-green-50/50">
            <p className="font-bold text-gray-700">Total Geral</p>
            <p className="font-extrabold text-green-900" data-testid="text-order-total">
              R$ {grandTotal.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
