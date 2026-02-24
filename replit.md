# Brasfrut — Sistema de Pedidos

Aplicativo web mobile-first para gerenciamento de pedidos de frutos/polpas da empresa Brasfrut.

## Arquitetura

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js
- **Roteamento**: Wouter v3
- **Estado Global**: Zustand (autenticação + configurações)
- **Gráficos**: Recharts
- **Toasts**: shadcn/ui Toaster

## Estrutura de Páginas

### Funcionário (rota `/dashboard`)
- **Dashboard** `/dashboard` — Status do pedido, total, prazo, gráfico de histórico 12 meses
- **Pedido** `/pedido` — Seleção de produtos por grupo/subgrupo, limites, termo de aceite
- **Histórico** `/historico` — Listagem de pedidos anteriores por mês/ano

### Admin (rota `/admin`)
- **Dashboard** `/admin` — Cards de stats, gráfico anual combinado (barras + linha)
- **Funcionários** `/admin/funcionarios` — CRUD, importação CSV, alterar senha, desbloquear
- **Grupos** `/admin/grupos` — CRUD de grupos e subgrupos, limites de itens
- **Produtos** `/admin/produtos` — CRUD de produtos com grupo/subgrupo
- **Pedidos** `/admin/pedidos` — Visualização e edição de pedidos por ciclo
- **Ciclos** `/admin/ciclos` — CRUD de ciclos de pedido (mês/ano, datas, status)
- **Configurações** `/admin/config` — Logo e nome da empresa (tela de login)

## Autenticação (Demo)

- **Funcionário**: matrícula `001234` / senha `123456`
- **Admin**: usuário `admin` / senha `admin123`

## Stores (Zustand com persistência)

- `brasfrut_auth` — Usuário logado e token
- `brasfrut_settings` — Logo (base64 data URL) e nome da empresa

## Design

- Cores: Verde escuro (`green-900`) como cor primária
- Layout mobile-first, max-width 2xl centralizado
- Bottom navigation bar fixa (3 abas para funcionário, 7 para admin)
- Modais bottom-sheet para formulários
- Dados demo com mock data para visualização do layout
- Admin layout: header verde com título, sub-páginas com headers claros (sem duplicação)

## Arquivos Principais

```
client/src/
├── lib/
│   ├── store.ts          # Zustand stores (auth + settings)
│   └── mockData.ts       # Dados de demonstração
├── pages/
│   ├── LoginPage.tsx
│   ├── employee/
│   │   ├── EmployeeLayout.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── OrderPage.tsx
│   │   └── HistoryPage.tsx
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminEmployees.tsx
│       ├── AdminGroups.tsx
│       ├── AdminProducts.tsx
│       ├── AdminOrders.tsx
│       ├── AdminCycles.tsx
│       └── AdminSettings.tsx
└── App.tsx               # Roteamento principal
```
