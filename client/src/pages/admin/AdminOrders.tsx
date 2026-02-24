import { useState } from "react";
import { Search, ChevronDown, ShoppingBag, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockAdminOrders, mockCycles, mockGroups, mockProducts, MONTHS_FULL } from "@/lib/mockData";

const STATUS_LABELS: Record<string, string> = { draft: "Em edição", confirmed: "Confirmado", closed: "Fechado" };

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders] = useState<any[]>(mockAdminOrders);
  const [selectedCycle, setSelectedCycle] = useState<any>(mockCycles[0]);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<any>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [selectedGroup, setSelectedGroup] = useState<number>(mockGroups[0].id);
  const [saving, setSaving] = useState(false);

  const openEdit = (order: any) => {
    const cartObj: Record<number, number> = {};
    order.items?.forEach((i: any, idx: number) => { cartObj[idx + 1] = 1; });
    setCart({});
    setEditModal(order);
    setSelectedGroup(mockGroups[0].id);
  };

  const isClosed = selectedCycle?.status === "closed";

  const setQty = (productId: number, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) { const n = { ...prev }; delete n[productId]; return n; }
      return { ...prev, [productId]: next };
    });
  };

  const handleSaveEdit = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setEditModal(null);
      toast({ title: "Pedido atualizado!" });
    }, 600);
  };

  const filtered = orders.filter(o =>
    o.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.employee?.registration_number?.includes(search)
  );

  const groupProducts = mockProducts.filter(p => p.group_id === selectedGroup);
  const totalValue = Object.entries(cart).reduce((s, [id, qty]) => {
    const p = mockProducts.find(p => p.id === parseInt(id));
    return s + (p ? parseFloat(p.price) * qty : 0);
  }, 0);

  return (
    <div className="bg-gray-50">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-green-800" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">Pedidos</h2>
              <p className="text-gray-500 text-xs">{orders.length} pedido(s)</p>
            </div>
          </div>
          <div className="relative">
            <select
              value={selectedCycle?.id || ""}
              onChange={e => setSelectedCycle(mockCycles.find(c => c.id === parseInt(e.target.value)))}
              className="appearance-none bg-gray-100 text-gray-800 text-xs rounded-xl px-3 py-2 pr-7 outline-none"
              data-testid="select-cycle"
            >
              {mockCycles.map(c => (
                <option key={c.id} value={c.id}>{MONTHS_FULL[c.month - 1]}/{c.year}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar funcionário..."
            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            data-testid="input-search-orders"
          />
        </div>
      </div>

      <div className="px-4 py-3 space-y-2 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum pedido encontrado</p>
          </div>
        ) : filtered.map(order => (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm" data-testid={`card-admin-order-${order.id}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{order.employee?.name}</p>
                <p className="text-xs text-gray-500">{order.employee?.registration_number} · {order.items?.length} item(s)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={"text-xs font-bold px-2 py-0.5 rounded-full " +
                  (order.status === "confirmed" ? "bg-green-100 text-green-700" :
                   order.status === "closed" ? "bg-gray-100 text-gray-500" : "bg-amber-100 text-amber-700")}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
                <button
                  onClick={() => openEdit(order)}
                  className="text-xs bg-green-900 text-white px-3 py-1.5 rounded-xl font-semibold"
                  data-testid={`button-view-order-${order.id}`}
                >
                  Ver
                </button>
              </div>
            </div>
            <p className="text-sm font-extrabold text-green-900">
              R$ {parseFloat(order.total).toFixed(2).replace(".", ",")}
            </p>
          </div>
        ))}
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "92vh" }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div>
                <h2 className="font-extrabold text-lg">{editModal.employee?.name}</h2>
                <p className="text-xs text-gray-500">{isClosed ? "Somente leitura" : "Editar pedido"}</p>
              </div>
              <button onClick={() => setEditModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-lg leading-none">✕</span>
              </button>
            </div>

            <div className="px-4 flex gap-2 overflow-x-auto pb-2 flex-shrink-0">
              {mockGroups.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  className={"flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold " +
                    (selectedGroup === g.id ? "bg-green-900 text-white" : "bg-gray-100 text-gray-600")}
                  data-testid={`tab-order-group-${g.id}`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 px-4 space-y-1 pb-2">
              {groupProducts.map(product => {
                const qty = cart[product.id] || 0;
                return (
                  <div key={product.id} className="flex items-center py-2.5 gap-3 border-b border-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">R$ {parseFloat(product.price).toFixed(2).replace(".", ",")} / {product.unit}</p>
                    </div>
                    {!isClosed ? (
                      <div className="flex items-center gap-2">
                        {qty > 0 && <button onClick={() => setQty(product.id, -1)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"><Minus size={12} /></button>}
                        {qty > 0 && <span className="font-bold text-gray-800 w-4 text-center text-sm">{qty}</span>}
                        <button onClick={() => setQty(product.id, 1)} className={"w-7 h-7 rounded-full flex items-center justify-center " + (qty > 0 ? "bg-green-900 text-white" : "bg-green-100 text-green-800")}>
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : qty > 0 ? <span className="text-sm font-bold text-gray-700">{qty}x</span> : null}
                  </div>
                );
              })}
            </div>

            {!isClosed && (
              <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0"
                style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
                <div className="flex justify-between mb-3">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="font-extrabold text-green-900">R$ {totalValue.toFixed(2).replace(".", ",")}</span>
                </div>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="w-full py-3.5 bg-green-900 text-white rounded-2xl font-bold disabled:opacity-60"
                  data-testid="button-save-admin-order"
                >
                  {saving ? "Salvando..." : "Salvar Pedido"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
