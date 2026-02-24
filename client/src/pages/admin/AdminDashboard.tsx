import { useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, ShoppingBag, DollarSign, Package } from "lucide-react";
import { mockAdminChartData, mockGroups, mockEmployees, mockAdminOrders, mockProducts } from "@/lib/mockData";

const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

export default function AdminDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [chartData] = useState(mockAdminChartData);

  const activeProducts = mockProducts.filter(p => p.available).length;
  const totalValue = mockAdminOrders.reduce((s, o) => s + parseFloat(o.total), 0);

  const cards = [
    { icon: Users, label: "Funcionários", value: mockEmployees.length, color: "bg-blue-50 text-blue-700" },
    { icon: ShoppingBag, label: "Pedidos este mês", value: mockAdminOrders.length, color: "bg-amber-50 text-amber-700" },
    { icon: DollarSign, label: "Total em pedidos", value: `R$ ${totalValue.toFixed(2).replace(".", ",")}`, color: "bg-green-50 text-green-700" },
    { icon: Package, label: "Produtos ativos", value: activeProducts, color: "bg-purple-50 text-purple-700" },
  ];

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
              {mockGroups.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
            </select>
          </div>
        </div>
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
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-bold text-gray-800 text-sm">Pedidos Recentes — Fev/2026</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {mockAdminOrders.slice(0, 3).map(order => (
            <div key={order.id} className="px-4 py-3 flex items-center justify-between" data-testid={`row-order-${order.id}`}>
              <div>
                <p className="text-sm font-semibold text-gray-800">{order.employee.name}</p>
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
      </div>
    </div>
  );
}
