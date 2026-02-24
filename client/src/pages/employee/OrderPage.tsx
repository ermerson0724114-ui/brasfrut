import { useState } from "react";
import { Plus, Minus, ShoppingCart, CheckCircle, AlertTriangle, Leaf } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { mockGroups, mockProducts } from "@/lib/mockData";

export default function OrderPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [selectedGroup, setSelectedGroup] = useState<number>(mockGroups[0].id);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerm, setShowTerm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cycle = { status: "open", end_date: "2026-02-28T23:59:59" };
  const isClosed = false;

  const getGroupTotal = (groupId: number) =>
    mockProducts.filter(p => p.group_id === groupId).reduce((s, p) => s + (cart[p.id] || 0), 0);

  const getSubgroupTotal = (subgroupId: number) =>
    mockProducts.filter(p => p.subgroup_id === subgroupId).reduce((s, p) => s + (cart[p.id] || 0), 0);

  const canAdd = (product: any) => {
    const group = mockGroups.find(g => g.id === product.group_id);
    if (!group) return false;
    if (group.subgroups.length > 0 && product.subgroup_id) {
      const sub = group.subgroups.find((s: any) => s.id === product.subgroup_id);
      if (!sub) return true;
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
    const p = mockProducts.find(p => p.id === parseInt(id));
    return s + (p ? parseFloat(p.price) * qty : 0);
  }, 0);

  const handleSubmit = () => {
    if (!agreed) return toast({ title: "Aceite o termo para confirmar", variant: "destructive" });
    if (totalItems === 0) return toast({ title: "Adicione pelo menos um produto", variant: "destructive" });
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setShowTerm(false);
      setSubmitting(false);
      toast({ title: "Pedido confirmado com sucesso!" });
    }, 800);
  };

  const handleDelete = () => {
    setCart({});
    setSubmitted(false);
    setAgreed(false);
    toast({ title: "Pedido excluído" });
  };

  const selectedGroupData = mockGroups.find(g => g.id === selectedGroup);
  const groupProducts = mockProducts.filter(p => p.group_id === selectedGroup);
  const groupLimit = selectedGroupData?.item_limit;
  const groupTotal = getGroupTotal(selectedGroup);

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
        {mockGroups.map(g => (
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
          selectedGroupData.subgroups.map((sub: any) => {
            const subProducts = groupProducts.filter(p => p.subgroup_id === sub.id);
            const subTotal = getSubgroupTotal(sub.id);
            return (
              <div key={sub.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm text-gray-700">{sub.name}</p>
                    <span className={"text-xs font-bold px-2 py-0.5 rounded-full " +
                      (subTotal >= sub.item_limit ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700")}>
                      {subTotal}/{sub.item_limit}
                    </span>
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
            {groupProducts.map(product => (
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
