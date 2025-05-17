
import React, { useState } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ParkingSpot, ReportFilter, Income } from '@/types';

const RegistradorReports = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { getSpotsByOwner, getIncomeReport } = useData();

  // Filter state
  const [filter, setFilter] = useState<ReportFilter>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
    endDate: new Date(),
  });

  // Period selection
  const [period, setPeriod] = useState<string>("week");

  // Redirect if not authenticated or not a registrador
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'registrador') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  if (!currentUser || currentUser.role !== 'registrador') {
    return null;
  }

  // Get spots owned by the current user
  const userSpots = getSpotsByOwner(currentUser.id);

  // Get income report data
  const reportData = getIncomeReport(filter, currentUser.id);

  // Calculate totals
  const totalIncome = reportData.reduce((sum, entry) => sum + entry.amount, 0);
  const totalReservations = reportData.reduce((sum, entry) => sum + entry.reservationCount, 0);
  const averageIncome = totalReservations > 0 ? totalIncome / totalReservations : 0;

  // Update period
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    
    const endDate = new Date();
    let startDate = new Date();
    
    switch (newPeriod) {
      case "day":
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    setFilter({
      ...filter,
      startDate,
      endDate
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format chart data
  const formatChartData = (data: Income[]) => {
    return data.map(item => ({
      date: formatDate(item.date),
      Ingresos: item.amount,
      Reservaciones: item.reservationCount
    }));
  };

  return (
    <MainLayout title="Reportes de Ingresos" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header section */}
        <div>
          <h2 className="text-2xl font-bold">Reportes de Ingresos</h2>
          <p className="text-gray-600">
            Visualice los ingresos generados por sus plazas de estacionamiento
          </p>
        </div>
        
        {/* Filters */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Periodo</label>
                <Select
                  value={period}
                  onValueChange={handlePeriodChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Hoy</SelectItem>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mes</SelectItem>
                    <SelectItem value="year">Último Año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Desde</label>
                <Input
                  type="date"
                  value={filter.startDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setFilter({
                      ...filter,
                      startDate: newDate
                    });
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hasta</label>
                <Input
                  type="date"
                  value={filter.endDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setFilter({
                      ...filter,
                      endDate: newDate
                    });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-parking-primary">
                ${totalIncome.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(filter.startDate)} - {formatDate(filter.endDate)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Reservaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-parking-secondary">
                {totalReservations}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(filter.startDate)} - {formatDate(filter.endDate)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Promedio por Reservación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-parking-success">
                ${averageIncome.toFixed(0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(filter.startDate)} - {formatDate(filter.endDate)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Chart */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Ingresos por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formatChartData(reportData)}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#0A2463" />
                  <YAxis yAxisId="right" orientation="right" stroke="#3E92CC" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Ingresos" fill="#0A2463" />
                  <Bar yAxisId="right" dataKey="Reservaciones" fill="#3E92CC" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RegistradorReports;
