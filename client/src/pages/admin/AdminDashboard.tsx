import { useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, ShoppingBag, DollarSign, Package } from "lucide-react";
import { useDataStore } from "@/lib/store";
import { MONTHS } from "@/lib/mockData";

const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

export default function AdminDashboard() {
  const employees = useDataStore(s => s.employees);
  const products = useDataStore(s => s.products);
  const orders = useDataStore(s => s.orders);
  const groups = useDataStore(s => s.groups);
  const cycles = useDataStore(s => s.cycles);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const activeProducts = products.filter(p => p.available).length;
  const totalValue = orders.reduce((s, o) => s + parseFloat(o.total || "0"), 0);

  const currentMonth = new Date().getMonth();
  const currentMonthOrders = orders.filter(o => {
    const cycle = cycles.find(c => c.id === o.cycle_id);
    return cycle && cycle.month === currentMonth + 1 && cycle.year === selectedYear;
  });

  const chartData = MONTHS.map((label, i) => {
    const monthOrders = orders.filter(o => {
      const cycle = cycles.find(c => c.id === o.cycle_id);
      return cycle && cycle.month === i + 1 && cycle.year === selectedYear;
    });
    const valor = monthOrders.reduce((s, o) => s + parseFloat(o.total || "0"), 0);
    const funcionarios = new Set(monthOrders.map(o => o.employee_id)).size;
    return { label, valor, funcionarios };
  });

  const cards = [
    { icon: Users, label: "Funcionários", value: employees.length, color: "bg-blue-50 text-blue-700" },
    { icon: ShoppingBag, label: "Pedidos este mês", value: currentMonthOrders.length, color: "bg-amber-50 text-amber-700" },
    { icon: DollarSign, label: "Total em pedidos", value: `R$ ${totalValue.toFixed(2).replace(".", ",")}`, color: "bg-green-50 text-green-700" },
    { icon: Package, label: "Produtos ativos", value: activeProducts, color: "bg-purple-50 text-purple-700" },
  ];

  const recentOrders = orders.slice(-5).reverse();

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm" data-testid={`card-stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + color}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-bold text-gray-800 text-sm">Visão Anual</h2>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="text-xs border border-gray-200 rounded-xl px-2 py-1.5 outline-none focus:ring-2 focus:ring-green-500"
              data-testid="select-year"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-2 py-1.5 outline-none focus:ring-2 focus:ring-green-500"
              data-testid="select-group"
            >
              <option value="all">Todos</option>
              {groups.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
            </select>
          </div>
        </div>
        {chartData.some(d => d.valor > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="valor" name="Valor (R$)" fill="#86efac" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="funcionarios" name="Funcionários" stroke="#14532d" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">Sem dados para exibir</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-bold text-gray-800 text-sm">Pedidos Recentes</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <div key={order.id} className="px-4 py-3 flex items-center justify-between" data-testid={`row-order-${order.id}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{order.employee_name}</p>
                  <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={"text-xs font-bold px-2 py-0.5 rounded-full " +
                    (order.status === "confirmed" ? "bg-green-100 text-green-700" :
                     order.status === "closed" ? "bg-gray-100 text-gray-500" : "bg-amber-100 text-amber-700")}>
                    {order.status === "confirmed" ? "Confirmado" : order.status === "closed" ? "Fechado" : "Em edição"}
                  </span>
                  <p className="text-sm font-extrabold text-green-900">R$ {parseFloat(order.total).toFixed(2).replace(".", ",")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
