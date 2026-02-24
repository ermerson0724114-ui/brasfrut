import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/store";

import LoginPage from "@/pages/LoginPage";
import EmployeeLayout from "@/pages/employee/EmployeeLayout";
import DashboardPage from "@/pages/employee/DashboardPage";
import OrderPage from "@/pages/employee/OrderPage";
import HistoryPage from "@/pages/employee/HistoryPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEmployees from "@/pages/admin/AdminEmployees";
import AdminGroups from "@/pages/admin/AdminGroups";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCycles from "@/pages/admin/AdminCycles";

function EmployeeRoutes() {
  const { user } = useAuthStore();
  if (!user || user.isAdmin) return <Redirect to="/login" />;
  return (
    <EmployeeLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/pedido" component={OrderPage} />
        <Route path="/historico" component={HistoryPage} />
        <Route><Redirect to="/" /></Route>
      </Switch>
    </EmployeeLayout>
  );
}

function AdminRoutes() {
  const { user } = useAuthStore();
  if (!user || !user.isAdmin) return <Redirect to="/login" />;
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/funcionarios" component={AdminEmployees} />
        <Route path="/admin/grupos" component={AdminGroups} />
        <Route path="/admin/produtos" component={AdminProducts} />
        <Route path="/admin/pedidos" component={AdminOrders} />
        <Route path="/admin/ciclos" component={AdminCycles} />
        <Route><Redirect to="/admin" /></Route>
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  const { user } = useAuthStore();

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/admin/:rest*" component={AdminRoutes} />
      <Route path="/:rest*">
        {() => {
          if (!user) return <Redirect to="/login" />;
          if (user.isAdmin) return <Redirect to="/admin" />;
          return <EmployeeRoutes />;
        }}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
