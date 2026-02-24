# Brasfrut — Sistema de Pedidos

Aplicativo web mobile-first para gerenciamento de pedidos de frutos/polpas da empresa Brasfrut.

## Arquitetura

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js (serve o frontend, sem API de dados)
- **Roteamento**: Wouter v3
- **Estado Global**: Zustand com persistência (localStorage)
- **Gráficos**: Recharts
- **Toasts**: shadcn/ui Toaster

## Persistência de Dados

Todos os dados são persistidos via Zustand + localStorage (sem backend/banco de dados).
Três stores principais:

- `brasfrut_auth` — Usuário logado e token
- `brasfrut_settings` — Logo (base64), nome da empresa, senha do admin, email de recuperação
- `brasfrut_data` — Funcionários, grupos, produtos, ciclos, pedidos (CRUD completo)

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
- **Dashboard** `/admin` — Cards de stats (funcionários, pedidos, total, produtos ativos), gráfico anual
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
- Admin layout: header verde com título, sub-páginas com headers claros
- Tela de login com preview de logo personalizada

## Arquivos Principais

```
client/src/
├── lib/
│   ├── store.ts          # Zustand stores (auth + settings + data)
│   └── mockData.ts       # Apenas constantes MONTHS e MONTHS_FULL
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
