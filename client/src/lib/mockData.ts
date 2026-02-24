export const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
export const MONTHS_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export const mockGroups = [
  {
    id: 1,
    name: "Polpas",
    description: "Polpas de frutas",
    item_limit: null,
    sort_order: 1,
    subgroups: [
      { id: 1, name: "Balde 3,2kg", item_limit: 2 },
      { id: 2, name: "Sachê 100g", item_limit: 4 },
    ],
  },
  {
    id: 2,
    name: "Sucos",
    description: "Sucos naturais",
    item_limit: 4,
    sort_order: 2,
    subgroups: [],
  },
  {
    id: 3,
    name: "Frutas",
    description: "Frutas frescas",
    item_limit: 6,
    sort_order: 3,
    subgroups: [],
  },
];

export const mockProducts = [
  { id: 1, name: "Polpa de Açaí", group_id: 1, subgroup_id: 1, price: "28.50", unit: "balde", available: true },
  { id: 2, name: "Polpa de Cupuaçu", group_id: 1, subgroup_id: 1, price: "22.00", unit: "balde", available: true },
  { id: 3, name: "Polpa de Maracujá", group_id: 1, subgroup_id: 2, price: "3.50", unit: "sachê", available: true },
  { id: 4, name: "Polpa de Goiaba", group_id: 1, subgroup_id: 2, price: "3.00", unit: "sachê", available: true },
  { id: 5, name: "Suco de Laranja 500ml", group_id: 2, subgroup_id: null, price: "7.50", unit: "garrafa", available: true },
  { id: 6, name: "Suco de Uva 500ml", group_id: 2, subgroup_id: null, price: "8.00", unit: "garrafa", available: true },
  { id: 7, name: "Suco de Maçã 1L", group_id: 2, subgroup_id: null, price: "12.00", unit: "caixa", available: true },
  { id: 8, name: "Banana Prata", group_id: 3, subgroup_id: null, price: "4.90", unit: "kg", available: true },
  { id: 9, name: "Maçã Fuji", group_id: 3, subgroup_id: null, price: "8.90", unit: "kg", available: true },
  { id: 10, name: "Mamão Formosa", group_id: 3, subgroup_id: null, price: "6.50", unit: "kg", available: true },
];

export const mockEmployees = [
  { id: 1, name: "Ana Paula Silva", registration_number: "001234", email: "ana@brasfrut.com.br", whatsapp: "(11) 99999-1111", funcao: "Operadora", setor: "Produção", distribuicao: "Matriz", is_locked: false, profile_image_url: null },
  { id: 2, name: "Carlos Eduardo Mendes", registration_number: "001235", email: "carlos@brasfrut.com.br", whatsapp: "(11) 99999-2222", funcao: "Supervisor", setor: "Logística", distribuicao: "Filial SP", is_locked: false, profile_image_url: null },
  { id: 3, name: "Maria Fernanda Costa", registration_number: "001236", email: "maria@brasfrut.com.br", whatsapp: "(11) 99999-3333", funcao: "Analista", setor: "Qualidade", distribuicao: "Matriz", is_locked: true, profile_image_url: null },
  { id: 4, name: "João Roberto Alves", registration_number: "001237", email: "joao@brasfrut.com.br", whatsapp: "(11) 99999-4444", funcao: "Técnico", setor: "Manutenção", distribuicao: "Matriz", is_locked: false, profile_image_url: null },
  { id: 5, name: "Patricia Souza Lima", registration_number: "001238", email: "patricia@brasfrut.com.br", whatsapp: "(11) 99999-5555", funcao: "Assistente", setor: "RH", distribuicao: "Matriz", is_locked: false, profile_image_url: null },
];

export const mockCycles = [
  { id: 3, month: 2, year: 2026, start_date: "2026-02-01T08:00:00", end_date: "2026-02-28T23:59:59", status: "open" },
  { id: 2, month: 1, year: 2026, start_date: "2026-01-01T08:00:00", end_date: "2026-01-31T23:59:59", status: "closed" },
  { id: 1, month: 12, year: 2025, start_date: "2025-12-01T08:00:00", end_date: "2025-12-31T23:59:59", status: "closed" },
];

export const mockCurrentOrder = {
  id: 1,
  status: "draft",
  total: "45.00",
  cycle: mockCycles[0],
  items: [
    { id: 1, product_id: 5, quantity: 2, product_name_snapshot: "Suco de Laranja 500ml", group_name_snapshot: "Sucos", subgroup_name_snapshot: null, unit_price: "7.50" },
    { id: 2, product_id: 8, quantity: 3, product_name_snapshot: "Banana Prata", group_name_snapshot: "Frutas", subgroup_name_snapshot: null, unit_price: "4.90" },
    { id: 3, product_id: 1, quantity: 1, product_name_snapshot: "Polpa de Açaí", group_name_snapshot: "Polpas", subgroup_name_snapshot: "Balde 3,2kg", unit_price: "28.50" },
  ],
};

export const mockHistoryOrders = [
  {
    id: 1,
    status: "draft",
    total: "45.00",
    cycle: mockCycles[0],
    items: mockCurrentOrder.items,
  },
  {
    id: 2,
    status: "confirmed",
    total: "89.50",
    cycle: mockCycles[1],
    items: [
      { id: 4, product_id: 1, quantity: 2, product_name_snapshot: "Polpa de Açaí", group_name_snapshot: "Polpas", subgroup_name_snapshot: "Balde 3,2kg", unit_price: "28.50" },
      { id: 5, product_id: 6, quantity: 2, product_name_snapshot: "Suco de Uva 500ml", group_name_snapshot: "Sucos", subgroup_name_snapshot: null, unit_price: "8.00" },
      { id: 6, product_id: 9, quantity: 2, product_name_snapshot: "Maçã Fuji", group_name_snapshot: "Frutas", subgroup_name_snapshot: null, unit_price: "8.90" },
    ],
  },
  {
    id: 3,
    status: "closed",
    total: "67.80",
    cycle: mockCycles[2],
    items: [
      { id: 7, product_id: 3, quantity: 4, product_name_snapshot: "Polpa de Maracujá", group_name_snapshot: "Polpas", subgroup_name_snapshot: "Sachê 100g", unit_price: "3.50" },
      { id: 8, product_id: 10, quantity: 4, product_name_snapshot: "Mamão Formosa", group_name_snapshot: "Frutas", subgroup_name_snapshot: null, unit_price: "6.50" },
      { id: 9, product_id: 7, quantity: 2, product_name_snapshot: "Suco de Maçã 1L", group_name_snapshot: "Sucos", subgroup_name_snapshot: null, unit_price: "12.00" },
    ],
  },
];

export const mockChartData = [
  { label: "Mar/25", total: 45.0 },
  { label: "Abr/25", total: 72.5 },
  { label: "Mai/25", total: 58.0 },
  { label: "Jun/25", total: 91.0 },
  { label: "Jul/25", total: 64.5 },
  { label: "Ago/25", total: 83.0 },
  { label: "Set/25", total: 77.0 },
  { label: "Out/25", total: 95.5 },
  { label: "Nov/25", total: 68.0 },
  { label: "Dez/25", total: 89.5 },
  { label: "Jan/26", total: 112.0 },
  { label: "Fev/26", total: 45.0 },
];

export const mockAdminChartData = [
  { label: "Jan", valor: 4230, funcionarios: 38 },
  { label: "Fev", valor: 2890, funcionarios: 29 },
  { label: "Mar", valor: 5120, funcionarios: 44 },
  { label: "Abr", valor: 3670, funcionarios: 35 },
  { label: "Mai", valor: 6480, funcionarios: 51 },
  { label: "Jun", valor: 5890, funcionarios: 47 },
  { label: "Jul", valor: 4320, funcionarios: 39 },
  { label: "Ago", valor: 7210, funcionarios: 58 },
  { label: "Set", valor: 6140, funcionarios: 52 },
  { label: "Out", valor: 8390, funcionarios: 67 },
  { label: "Nov", valor: 7650, funcionarios: 62 },
  { label: "Dez", valor: 9120, funcionarios: 73 },
];

export const mockAdminOrders = [
  { id: 1, employee: { name: "Ana Paula Silva", registration_number: "001234" }, status: "confirmed", total: "89.50", items: [{ id: 1 }, { id: 2 }, { id: 3 }] },
  { id: 2, employee: { name: "Carlos Eduardo Mendes", registration_number: "001235" }, status: "draft", total: "45.00", items: [{ id: 1 }, { id: 2 }] },
  { id: 3, employee: { name: "Maria Fernanda Costa", registration_number: "001236" }, status: "confirmed", total: "134.00", items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
  { id: 4, employee: { name: "João Roberto Alves", registration_number: "001237" }, status: "closed", total: "67.80", items: [{ id: 1 }, { id: 2 }] },
  { id: 5, employee: { name: "Patricia Souza Lima", registration_number: "001238" }, status: "draft", total: "22.50", items: [{ id: 1 }] },
];
