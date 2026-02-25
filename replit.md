# Brasfrut — Sistema de Pedidos

Aplicativo web mobile-first para gerenciamento de pedidos de frutos/polpas da empresa Brasfrut.

## Arquitetura

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Roteamento**: Wouter v3
- **Estado**: Zustand (somente auth), TanStack Query (dados do servidor)
- **Gráficos**: Recharts
- **Toasts**: shadcn/ui Toaster

## Persistência de Dados

Todos os dados são persistidos no PostgreSQL via API REST:
- Tabelas: `settings`, `employees`, `groups`, `subgroups`, `products`, `cycles`, `orders`, `order_items`
- ORM: Drizzle com conexão via `DATABASE_URL`
- Frontend usa TanStack Query para cache e sincronização

Somente a sessão de autenticação usa Zustand + localStorage (`brasfrut_auth`).

## API Endpoints

- `GET/PATCH /api/settings` — Configurações (companyName, adminPassword, recoveryEmail, logoUrl)
- `POST /api/auth/login` — Login admin/funcionário
- `POST /api/auth/recover` — Recuperação de senha admin
- `POST /api/auth/create-password` — Primeiro acesso do funcionário
- `GET/POST/PATCH/DELETE /api/employees` — CRUD de funcionários
- `POST /api/employees/bulk` — Importação em lote (CSV)
- `GET/POST/PATCH/DELETE /api/groups` — CRUD de grupos (retorna subgrupos aninhados)
- `POST/PATCH/DELETE /api/subgroups` — CRUD de subgrupos
- `GET/POST/PATCH/DELETE /api/products` — CRUD de produtos
- `GET/POST/PATCH /api/cycles` — CRUD de ciclos
- `GET/POST/PATCH /api/orders` — CRUD de pedidos (com items)
- `POST /api/migrate` — Migração de dados do localStorage para o banco

## Autenticação

- **Admin**: usuário `admin` / senha `admin123` (alterável em Configurações)
- **Funcionário**: matrícula cadastrada pelo admin, primeiro acesso cria a senha
- **Recuperação de senha**: admin digita email de recuperação (`ermerson0724114@gmail.com`), senha é exibida na tela

## Estrutura de Páginas

### Funcionário (rota `/dashboard`)
- **Dashboard** `/dashboard` — Status do pedido, total, prazo, gráfico de histórico 12 meses
- **Pedido** `/pedido` — Seleção de produtos por grupo/subgrupo com limites, termo de aceite
- **Histórico** `/historico` — Listagem de pedidos anteriores por mês/ano

### Admin (rota `/admin`)
- **Dashboard** `/admin` — Cards de stats, gráfico anual
- **Funcionários** `/admin/funcionarios` — CRUD, importação CSV, alterar senha, desbloquear
- **Grupos** `/admin/grupos` — CRUD de grupos e subgrupos com limites de itens
- **Produtos** `/admin/produtos` — CRUD de produtos com grupo/subgrupo, preço, unidade
- **Pedidos** `/admin/pedidos` — Visualização e edição de pedidos por ciclo
- **Ciclos** `/admin/ciclos` — CRUD de ciclos de pedido (mês/ano, datas, status aberto/fechado)
- **Configurações** `/admin/config` — Alterar senha admin, logo da empresa, nome da empresa

## Design

- Cores: Verde escuro (`green-900`) como cor primária
- Layout mobile-first, max-width 2xl centralizado
- Bottom navigation bar fixa (3 abas para funcionário, 7 para admin)
- Modais bottom-sheet para formulários

## Arquivos Principais

```
shared/schema.ts              # Drizzle schema + tipos
server/db.ts                   # Conexão PostgreSQL
server/storage.ts              # DatabaseStorage (CRUD)
server/routes.ts               # Rotas REST API
client/src/
├── lib/
│   ├── store.ts               # Zustand auth store
│   ├── queryClient.ts         # TanStack Query config
│   └── mockData.ts            # Constantes MONTHS
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
└── App.tsx
```
