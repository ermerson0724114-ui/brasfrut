import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { mockHistoryOrders, MONTHS_FULL } from "@/lib/mockData";

const STATUS_LABELS: Record<string, string> = {
  draft: "Em edição",
  confirmed: "Confirmado",
  closed: "Fechado",
};

export default function HistoryPage() {
  const orders = mockHistoryOrders;
  const [selected, setSelected] = useState<any>(orders[0]);

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-gray-400 font-medium">Nenhum pedido encontrado no histórico.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="relative">
        <select
          value={selected?.id}
          onChange={e => setSelected(orders.find(o => o.id === parseInt(e.target.value)))}
          className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500"
          data-testid="select-history-month"
        >
          {orders.map(o => (
            <option key={o.id} value={o.id}>
              {MONTHS_FULL[(o.cycle?.month || 1) - 1]} / {o.cycle?.year}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {selected && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-bold text-gray-800">
              {MONTHS_FULL[(selected.cycle?.month || 1) - 1]} / {selected.cycle?.year}
            </p>
            <span className={"text-xs font-bold px-2.5 py-1 rounded-full " +
              (selected.status === "confirmed" ? "bg-green-100 text-green-700" :
               selected.status === "closed" ? "bg-gray-100 text-gray-500" :
               "bg-amber-100 text-amber-700")}
              data-testid="status-history-order"
            >
              {STATUS_LABELS[selected.status] || selected.status}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {selected.items?.map((item: any) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between" data-testid={`row-history-item-${item.id}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.product_name_snapshot}</p>
                  <p className="text-xs text-gray-500">
                    {item.group_name_snapshot}
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
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between">
            <p className="font-bold text-gray-700">Total</p>
            <p className="font-extrabold text-green-900" data-testid="text-history-total">
              R$ {parseFloat(selected.total).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
