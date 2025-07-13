import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { CheckCircle, AlertTriangle, Search, Filter, Clock, Car, MapPin, RefreshCw } from 'lucide-react';
import { adminTicketService, TicketAdmin } from '@/services/adminTicketService';

const AdminTickets = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<TicketAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketAdmin | null>(null);
  const [actionType, setActionType] = useState<'complete' | 'report' | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

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

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const allTickets = await adminTicketService.getAllTickets();
      setTickets(allTickets);
      
      toast({
        title: "Tickets cargados",
        description: `Se cargaron ${allTickets.length} tickets exitosamente`,
      });
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load tickets when component mounts
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadTickets();
    }
  }, [currentUser?.role, loadTickets]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.codigo_ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.vehiculo_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.usuario_id.toString().includes(searchTerm) ||
      ticket.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.usuario?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.estacionamiento?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCompleteTicket = async () => {
    if (!selectedTicket) return;
    
    setIsActionLoading(true);
    try {
      await adminTicketService.finalizeTicket(selectedTicket.id);
      
      toast({
        title: "Ticket finalizado",
        description: "El ticket se ha finalizado exitosamente",
      });
      
      // Recargar los datos
      await loadTickets();
      
      setSelectedTicket(null);
      setActionType(null);
    } catch (error) {
      console.error('Error al finalizar ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo finalizar el ticket",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReportTicket = async () => {
    if (!selectedTicket || !reportReason.trim()) return;
    
    setIsActionLoading(true);
    try {
      await adminTicketService.reportTicket(selectedTicket.id, reportReason);
      
      toast({
        title: "Ticket reportado",
        description: "El ticket ha sido reportado y cancelado",
      });
      
      // Recargar los datos
      await loadTickets();
      
      setSelectedTicket(null);
      setActionType(null);
      setReportReason('');
    } catch (error) {
      console.error('Error al reportar ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo reportar el ticket",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finalizado':
        return <Badge className="bg-green-100 text-green-800">Finalizado</Badge>;
      case 'activo':
        return <Badge className="bg-blue-100 text-blue-800">Activo</Badge>;
      case 'pagado':
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'No definido';
    return new Date(date).toLocaleString('es-ES');
  };

  return (
    <MainLayout title="Gestión de Tickets" backLink="/dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Gestión de Tickets</h2>
          <p className="text-gray-600">
            Administre tickets del sistema, finalice reservas y reporte problemas
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Search className="w-4 h-4 inline mr-1" />
                  Buscar
                </label>
                <Input
                  placeholder="Buscar por código, placa, cliente, email o estacionamiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Estado
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Acciones
                </label>
                <Button
                  onClick={loadTickets}
                  variant="outline"
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.estado === 'activo').length}
                </h3>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.estado === 'finalizado').length}
                </h3>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.estado === 'pagado').length}
                </h3>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.estado === 'cancelado').length}
                </h3>
                <p className="text-sm text-gray-600">Cancelados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parking-primary mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No se encontraron tickets.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="font-medium">Ticket #{ticket.codigo_ticket}</p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Car className="w-4 h-4 mr-1" />
                            {ticket.vehiculo_id} - {ticket.vehiculo?.modelo || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {ticket.estacionamiento?.nombre || 'Estacionamiento no disponible'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Cliente</p>
                          <p className="text-sm text-gray-600">
                            {ticket.usuario?.nombre || 'Usuario no disponible'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ticket.usuario?.email || 'Email no disponible'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Estado</p>
                          {getStatusBadge(ticket.estado)}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Entrada</p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDateTime(new Date(ticket.fecha_entrada))}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Costo</p>
                          <p className="text-sm font-bold text-parking-primary">
                            ${ticket.precio_total ? parseFloat(ticket.precio_total.toString()).toFixed(2) : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {ticket.estado === 'activo' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setActionType('complete');
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Finalizar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setActionType('report');
                              }}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Reportar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Ticket Dialog */}
        <Dialog open={actionType === 'complete'} onOpenChange={() => {
          setActionType(null);
          setSelectedTicket(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar Ticket</DialogTitle>
              <DialogDescription>
                ¿Está seguro de que desea finalizar el ticket #{selectedTicket?.id}?
                Esta acción marcará la reserva como completada.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActionType(null);
                  setSelectedTicket(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCompleteTicket}
                disabled={isActionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isActionLoading ? 'Finalizando...' : 'Finalizar Ticket'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Ticket Dialog */}
        <Dialog open={actionType === 'report'} onOpenChange={() => {
          setActionType(null);
          setSelectedTicket(null);
          setReportReason('');
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reportar Problema</DialogTitle>
              <DialogDescription>
                Describa el problema encontrado con el ticket #{selectedTicket?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Describa el problema o motivo del reporte..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActionType(null);
                  setSelectedTicket(null);
                  setReportReason('');
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleReportTicket}
                disabled={isActionLoading || !reportReason.trim()}
                variant="destructive"
              >
                {isActionLoading ? 'Reportando...' : 'Reportar Problema'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AdminTickets;
