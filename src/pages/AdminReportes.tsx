import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import MainLayout from '@/components/layout/MainLayout';
import { CheckCircle, Clock, XCircle, DollarSign, TrendingUp } from 'lucide-react';

const AdminReportes = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { parkingSpots, reservations } = useData();

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

  // Calculate statistics
  const completedTickets = reservations.filter(r => r.status === 'completed').length;
  const pendingTickets = reservations.filter(r => r.status === 'pending' || r.status === 'active').length;
  const cancelledTickets = reservations.filter(r => r.status === 'cancelled').length;
  
  const totalIncome = reservations
    .filter(r => r.status === 'completed' && r.totalCost)
    .reduce((sum, r) => sum + (r.totalCost || 0), 0);

  const averageIncomePerSpot = parkingSpots.length > 0 ? totalIncome / parkingSpots.length : 0;

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tickets Status Card */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Estado de Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pendientes</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{pendingTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Cumplidos</span>
                </div>
                <span className="text-lg font-bold text-green-600">{completedTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Cancelados</span>
                </div>
                <span className="text-lg font-bold text-red-600">{cancelledTickets}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Income Card */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Ingresos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-parking-primary">
                  ${isNaN(totalIncome) ? '0.00' : totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  De {completedTickets} tickets cumplidos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Average Income per Spot Card */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Promedio por Plaza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-parking-secondary">
                  ${isNaN(averageIncomePerSpot) ? '0.00' : averageIncomePerSpot.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Ingreso promedio por plaza
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminReportes;
