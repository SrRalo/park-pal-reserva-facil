import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import MainLayout from '@/components/layout/MainLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Income, ReportFilter } from '@/types';
import { DollarSign, Users, Car, TrendingUp } from 'lucide-react';

const AdminReportes = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { parkingSpots, reservations } = useData();

  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<string>("week");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  // Calculate system-wide statistics
  const totalReservations = reservations.length;
  const completedReservations = reservations.filter(r => r.status === 'completed').length;
  const activeReservations = reservations.filter(r => r.status === 'active').length;
  const totalIncome = reservations
    .filter(r => r.status === 'completed' && r.totalCost)
    .reduce((sum, r) => sum + (r.totalCost || 0), 0);

  // Data for charts
  const statusData = [
    { name: 'Completadas', value: completedReservations, color: '#22c55e' },
    { name: 'Activas', value: activeReservations, color: '#3b82f6' },
    { name: 'Canceladas', value: reservations.filter(r => r.status === 'cancelled').length, color: '#ef4444' },
    { name: 'Pendientes', value: reservations.filter(r => r.status === 'pending').length, color: '#f59e0b' },
  ];

  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayReservations = reservations.filter(r => {
      if (!r.entryTime && !r.estimatedEntryTime) return false;
      const reservationDate = new Date(r.entryTime || r.estimatedEntryTime);
      return reservationDate.toDateString() === date.toDateString() && r.status === 'completed';
    });
    
    return {
      date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      ingresos: dayReservations.reduce((sum, r) => sum + (r.totalCost || 0), 0),
      reservas: dayReservations.length
    };
  });

  return (
    <MainLayout title="Reportes del Sistema" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Reportes del Sistema</h2>
          <p className="text-gray-600">
            Consulte reportes completos del sistema y estadísticas generales
          </p>
        </div>

        {/* Period Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Período</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Hoy</SelectItem>
                    <SelectItem value="week">Esta Semana</SelectItem>
                    <SelectItem value="month">Este Mes</SelectItem>
                    <SelectItem value="year">Este Año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                  <p className="text-2xl font-bold text-parking-primary">
                    ${totalIncome.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-parking-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                  <p className="text-2xl font-bold text-parking-secondary">
                    {totalReservations}
                  </p>
                </div>
                <Car className="w-8 h-8 text-parking-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plazas Totales</p>
                  <p className="text-2xl font-bold text-parking-success">
                    {parkingSpots.length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-parking-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa Ocupación</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {parkingSpots.length > 0 
                      ? Math.round((parkingSpots.filter(s => s.status === 'occupied').length / parkingSpots.length) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Ingresos de los Últimos 7 Días</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#0A2463" name="Ingresos ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parking Spots Details */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Plazas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Disponibles</span>
                  <span className="text-sm font-bold text-green-600">
                    {parkingSpots.filter(s => s.status === 'available').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ocupadas</span>
                  <span className="text-sm font-bold text-red-600">
                    {parkingSpots.filter(s => s.status === 'occupied').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">En Mantenimiento</span>
                  <span className="text-sm font-bold text-yellow-600">
                    {parkingSpots.filter(s => s.status === 'maintenance').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ingreso Promedio</span>
                  <span className="text-sm font-bold">
                    ${completedReservations > 0 ? (totalIncome / completedReservations).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tasa de Finalización</span>
                  <span className="text-sm font-bold text-green-600">
                    {totalReservations > 0 ? Math.round((completedReservations / totalReservations) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reservas Activas</span>
                  <span className="text-sm font-bold text-blue-600">
                    {activeReservations}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminReportes;
