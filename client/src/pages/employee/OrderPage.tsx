import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, CheckCircle, Leaf } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Cycle } from "@shared/schema";

interface OrderItem { id: number; product_id: number; quantity: number; product_name_snapshot: string; group_name_snapshot: string; subgroup_name_snapshot: string | null; unit_price: string; order_id: number; }
interface OrderData { id: number; employee_id: number; employee_name: string; employee_registration: string | null; status: string; total: string; cycle_id: number; items: OrderItem[]; }
interface GroupData { id: number; name: string; item_limit: number | null; subgroups: { id: number; name: string; item_limit: number | null }[]; }

export default function OrderPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data: groups = [] } = useQuery<GroupData[]>({ queryKey: ["/api/groups"] });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: orders = [] } = useQuery<OrderData[]>({ queryKey: ["/api/orders"] });
  const { data: cycles = [] } = useQuery<Cycle[]>({ queryKey: ["/api/cycles"] });

  const [cart, setCart] = useState<Record<number, number>>({});
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerm, setShowTerm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeCycle = cycles.find(c => c.status === "open");
  const isClosed = !activeCycle || (activeCycle && new Date() > new Date(activeCycle.end_date));
  const existingOrder = orders.find(o => o.employee_id === user?.id && o.cycle_id === activeCycle?.id);

  const createOrder = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/orders", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/orders"] }),
  });
  const updateOrder = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/orders/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/orders"] }),
  });

  useEffect(() => {
    if (groups.length > 0 && selectedGroup === 0) setSelectedGroup(groups[0].id);
  }, [groups, selectedGroup]);

  useEffect(() => {
    if (existingOrder) {
      const cartObj: Record<number, number> = {};
      existingOrder.items?.forEach(i => { cartObj[i.product_id] = i.quantity; });
      setCart(cartObj);
      setSubmitted(existingOrder.status === "confirmed");
    }
  }, [existingOrder?.id]);

  const availableProducts = products.filter(p => p.available);

  const getGroupTotal = (groupId: number) =>
    availableProducts.filter(p => p.group_id === groupId).reduce((s, p) => s + (cart[p.id] || 0), 0);

  const getSubgroupTotal = (subgroupId: number) =>
    availableProducts.filter(p => p.subgroup_id === subgroupId).reduce((s, p) => s + (cart[p.id] || 0), 0);

  const canAdd = (product: any) => {
    const group = groups.find(g => g.id === product.group_id);
    if (!group) return false;
    if (group.subgroups.length > 0 && product.subgroup_id) {
      const sub = group.subgroups.find(s => s.id === product.subgroup_id);
      if (!sub || !sub.item_limit) return true;
      return getSubgroupTotal(product.subgroup_id) < sub.item_limit;
    }
    if (group.item_limit !== null) {
      return getGroupTotal(product.group_id) < group.item_limit;
    }
    return true;
  };

  const setQty = (productId: number, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) { const n = { ...prev }; delete n[productId]; return n; }
      return { ...prev, [productId]: next };
    });
  };

  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);
  const totalValue = Object.entries(cart).reduce((s, [id, qty]) => {
    const p = availableProducts.find(p => p.id === parseInt(id));
    return s + (p ? parseFloat(p.price) * qty : 0);
  }, 0);

  const buildOrderItems = () => {
    return Object.entries(cart).map(([pid, qty]) => {
      const p = products.find(pr => pr.id === parseInt(pid));
      const g = groups.find(gr => gr.id === p?.group_id);
      const sub = g?.subgroups.find(s => s.id === p?.subgroup_id);
      return {
        product_id: parseInt(pid),
        quantity: qty,
        product_name_snapshot: p?.name || "",
        group_name_snapshot: g?.name || "",
        subgroup_name_snapshot: sub?.name || null,
        unit_price: p?.price || "0",
      };
    });
  };

  const handleSubmit = async () => {
    if (!agreed) return toast({ title: "Aceite o termo para confirmar", variant: "destructive" });
    if (totalItems === 0) return toast({ title: "Adicione pelo menos um produto", variant: "destructive" });
    if (!activeCycle || !user) return;
    setSubmitting(true);
    const items = buildOrderItems();
    try {
      if (existingOrder) {
        await updateOrder.mutateAsync({ id: existingOrder.id, data: { items, total: totalValue.toFixed(2), status: "confirmed" } });
      } else {
        await createOrder.mutateAsync({
          employee_id: user.id,
          employee_name: user.name,
          employee_registration: "",
          status: "confirmed",
          total: totalValue.toFixed(2),
          cycle_id: activeCycle.id,
          items,
        });
      }
      setSubmitted(true);
      setShowTerm(false);
      toast({ title: "Pedido confirmado com sucesso!" });
    } catch {
      toast({ title: "Erro ao salvar pedido", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setCart({});
    setSubmitted(false);
    setAgreed(false);
    if (existingOrder) {
      await updateOrder.mutateAsync({ id: existingOrder.id, data: { items: [], total: "0.00", status: "draft" } });
    }
    toast({ title: "Pedido excluído" });
  };

  const selectedGroupData = groups.find(g => g.id === selectedGroup);
  const groupProducts = availableProducts.filter(p => p.group_id === selectedGroup);
  const groupLimit = selectedGroupData?.item_limit;
  const groupTotal = getGroupTotal(selectedGroup);

  if (groups.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <Leaf size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-400 font-medium">Nenhum grupo/produto cadastrado ainda.</p>
        <p className="text-gray-400 text-sm mt-1">Aguarde o administrador configurar os produtos.</p>
      </div>
    );
  }

  return (
    <div className="pb-36">
      {submitted && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-sm font-semibold text-green-800">Pedido confirmado</p>
          </div>
          <button onClick={handleDelete} className="text-xs text-red-500 font-semibold underline" data-testid="button-delete-order">Excluir</button>
        </div>
      )}

      <div className="px-4 pt-4 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {groups.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={"flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold transition-all " +
              (selectedGroup === g.id ? "bg-green-900 text-white" : "bg-white text-gray-600 border border-gray-200")}
            data-testid={`tab-group-${g.id}`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {groupLimit !== null && groupLimit !== undefined && (
        <div className="mx-4 mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Limite do grupo</span>
            <span className={groupTotal >= groupLimit ? "text-red-500 font-bold" : "font-semibold"}>
              {groupTotal}/{groupLimit}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={"h-2 rounded-full transition-all " + (groupTotal >= groupLimit ? "bg-red-500" : "bg-green-600")}
              style={{ width: `${Math.min(100, (groupTotal / (groupLimit || 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="px-4 pt-3 space-y-2">
        {selectedGroupData && selectedGroupData.subgroups.length > 0 ? (
          selectedGroupData.subgroups.map((sub) => {
            const subProducts = groupProducts.filter(p => p.subgroup_id === sub.id);
            const subTotal = getSubgroupTotal(sub.id);
            return (
              <div key={sub.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm text-gray-700">{sub.name}</p>
                    {sub.item_limit && (
                      <span className={"text-xs font-bold px-2 py-0.5 rounded-full " +
                        (subTotal >= sub.item_limit ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700")}>
                        {subTotal}/{sub.item_limit}
                      </span>
                    )}
                  </div>
                </div>
                {subProducts.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    qty={cart[product.id] || 0}
                    canAdd={canAdd(product)}
                    isClosed={isClosed}
                    onAdd={() => setQty(product.id, 1)}
                    onRemove={() => setQty(product.id, -1)}
                  />
                ))}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {groupProducts.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">Nenhum produto neste grupo</p>
              </div>
            ) : groupProducts.map(product => (
              <ProductRow
                key={product.id}
                product={product}
                qty={cart[product.id] || 0}
                canAdd={canAdd(product)}
                isClosed={isClosed}
                onAdd={() => setQty(product.id, 1)}
                onRemove={() => setQty(product.id, -1)}
              />
            ))}
          </div>
        )}
      </div>

      {!isClosed && totalItems > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-gray-100 px-4 pt-3"
          style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-green-900" />
              <span className="font-bold text-gray-800">{totalItems} item(s)</span>
            </div>
            <span className="font-extrabold text-green-900 text-lg">
              R$ {totalValue.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <button
            onClick={() => setShowTerm(true)}
            disabled={submitting}
            className="w-full py-4 bg-green-900 text-white font-bold rounded-2xl disabled:opacity-60"
            data-testid="button-confirm-order"
          >
            {submitted ? "Atualizar Pedido" : "Confirmar Pedido"}
          </button>
        </div>
      )}

      {showTerm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div
            className="w-full max-w-2xl bg-white rounded-t-3xl p-5"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <h3 className="font-extrabold text-lg mb-3">Termo de Autorização</h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-2xl p-4 mb-4">
              Eu, <strong>{user?.name}</strong>, declaro estar ciente e de acordo com os valores referentes
              aos produtos selecionados neste pedido, autorizando expressamente o desconto correspondente
              em minha folha de pagamento, conforme as regras internas da empresa.
            </p>
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded accent-green-900"
                data-testid="checkbox-agree"
              />
              <span className="text-sm font-medium text-gray-700">Li e concordo com o termo acima</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTerm(false)}
                className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-600 font-semibold"
                data-testid="button-cancel-term"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!agreed || submitting}
                className="flex-1 py-3.5 bg-green-900 text-white rounded-2xl font-bold disabled:opacity-60"
                data-testid="button-confirm-term"
              >
                {submitting ? "Confirmando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, qty, canAdd, isClosed, onAdd, onRemove }: {
  product: any; qty: number; canAdd: boolean; isClosed: boolean;
  onAdd: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center px-4 py-3 gap-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800">{product.name}</p>
        <p className="text-xs text-gray-500">R$ {parseFloat(product.price).toFixed(2).replace(".", ",")} / {product.unit}</p>
      </div>
      {!isClosed && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {qty > 0 && (
            <button
              onClick={onRemove}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"
              data-testid={`button-remove-${product.id}`}
            >
              <Minus size={14} />
            </button>
          )}
          {qty > 0 && <span className="font-bold text-gray-800 w-5 text-center">{qty}</span>}
          <button
            onClick={onAdd}
            disabled={!canAdd}
            className={"w-8 h-8 rounded-full flex items-center justify-center transition-colors " +
              (qty > 0 ? "bg-green-900 text-white" : "bg-green-100 text-green-800") +
              (!canAdd ? " opacity-30 cursor-not-allowed" : "")}
            data-testid={`button-add-${product.id}`}
          >
            <Plus size={14} />
          </button>
        </div>
      )}
      {isClosed && qty > 0 && (
        <span className="text-sm font-bold text-gray-700">{qty}x</span>
      )}
    </div>
  );
}
