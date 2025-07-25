
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RegistradorSpotManagement from "./pages/RegistradorSpotManagement";
import RegistradorReports from "./pages/RegistradorReports";
import ReservadorSearch from "./pages/ReservadorSearch";
import ReservadorReservations from "./pages/ReservadorReservations";
import ReservadorVehicles from "./pages/ReservadorVehicles";
import AdminUsers from "./pages/AdminUsers";
import AdminPlazas from "./pages/AdminPlazas";
import AdminReportes from "./pages/AdminReportes";
import AdminTickets from "./pages/AdminTickets";
import AdminNuevaPlaza from "./pages/AdminNuevaPlaza";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/registrador/spots" element={<RegistradorSpotManagement />} />
              <Route path="/registrador/reports" element={<RegistradorReports />} />
              <Route path="/reservador/search" element={<ReservadorSearch />} />
              <Route path="/reservador/reservations" element={<ReservadorReservations />} />
              <Route path="/reservador/vehicles" element={<ReservadorVehicles />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/plazas" element={<AdminPlazas />} />
              <Route path="/admin/plazas/nueva" element={<AdminNuevaPlaza />} />
              <Route path="/admin/reportes" element={<AdminReportes />} />
              <Route path="/admin/tickets" element={<AdminTickets />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
