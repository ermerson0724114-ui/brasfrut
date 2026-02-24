import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  isAdmin: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
      },
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    { name: "brasfrut_auth" }
  )
);

interface SettingsStore {
  logoUrl: string | null;
  companyName: string;
  adminUser: string;
  adminPassword: string;
  recoveryEmail: string;
  setLogoUrl: (url: string | null) => void;
  setCompanyName: (name: string) => void;
  setAdminPassword: (pw: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      logoUrl: null,
      companyName: "Brasfrut",
      adminUser: "admin",
      adminPassword: "admin123",
      recoveryEmail: "ermerson0724114@gmail.com",
      setLogoUrl: (url) => set({ logoUrl: url }),
      setCompanyName: (name) => set({ companyName: name }),
      setAdminPassword: (pw) => set({ adminPassword: pw }),
    }),
    { name: "brasfrut_settings" }
  )
);

export interface Employee {
  id: number;
  name: string;
  registration_number: string;
  password: string;
  email: string;
  whatsapp: string;
  funcao: string;
  setor: string;
  distribuicao: string;
  is_locked: boolean;
  profile_image_url: string | null;
}

export interface Subgroup {
  id: number;
  name: string;
  item_limit: number | null;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  item_limit: number | null;
  sort_order: number;
  subgroups: Subgroup[];
}

export interface Product {
  id: number;
  name: string;
  group_id: number;
  subgroup_id: number | null;
  price: string;
  unit: string;
  available: boolean;
}

export interface Cycle {
  id: number;
  month: number;
  year: number;
  start_date: string;
  end_date: string;
  status: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  product_name_snapshot: string;
  group_name_snapshot: string;
  subgroup_name_snapshot: string | null;
  unit_price: string;
}

export interface Order {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_registration: string;
  status: string;
  total: string;
  cycle_id: number;
  items: OrderItem[];
}

interface DataStore {
  employees: Employee[];
  groups: Group[];
  products: Product[];
  cycles: Cycle[];
  orders: Order[];

  setEmployees: (emps: Employee[]) => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: number, data: Partial<Employee>) => void;
  removeEmployee: (id: number) => void;

  setGroups: (gs: Group[]) => void;
  addGroup: (g: Group) => void;
  updateGroup: (id: number, data: Partial<Group>) => void;
  removeGroup: (id: number) => void;

  setProducts: (ps: Product[]) => void;
  addProduct: (p: Product) => void;
  updateProduct: (id: number, data: Partial<Product>) => void;
  removeProduct: (id: number) => void;

  setCycles: (cs: Cycle[]) => void;
  addCycle: (c: Cycle) => void;
  updateCycle: (id: number, data: Partial<Cycle>) => void;

  setOrders: (os: Order[]) => void;
  addOrder: (o: Order) => void;
  updateOrder: (id: number, data: Partial<Order>) => void;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      employees: [],
      groups: [],
      products: [],
      cycles: [],
      orders: [],

      setEmployees: (employees) => set({ employees }),
      addEmployee: (emp) => set((s) => ({ employees: [...s.employees, emp] })),
      updateEmployee: (id, data) => set((s) => ({
        employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e)
      })),
      removeEmployee: (id) => set((s) => ({
        employees: s.employees.filter(e => e.id !== id)
      })),

      setGroups: (groups) => set({ groups }),
      addGroup: (g) => set((s) => ({ groups: [...s.groups, g] })),
      updateGroup: (id, data) => set((s) => ({
        groups: s.groups.map(g => g.id === id ? { ...g, ...data } : g)
      })),
      removeGroup: (id) => set((s) => ({
        groups: s.groups.filter(g => g.id !== id)
      })),

      setProducts: (products) => set({ products }),
      addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
      updateProduct: (id, data) => set((s) => ({
        products: s.products.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      removeProduct: (id) => set((s) => ({
        products: s.products.filter(p => p.id !== id)
      })),

      setCycles: (cycles) => set({ cycles }),
      addCycle: (c) => set((s) => ({ cycles: [...s.cycles, c] })),
      updateCycle: (id, data) => set((s) => ({
        cycles: s.cycles.map(c => c.id === id ? { ...c, ...data } : c)
      })),

      setOrders: (orders) => set({ orders }),
      addOrder: (o) => set((s) => ({ orders: [...s.orders, o] })),
      updateOrder: (id, data) => set((s) => ({
        orders: s.orders.map(o => o.id === id ? { ...o, ...data } : o)
      })),
    }),
    { name: "brasfrut_data" }
  )
);
