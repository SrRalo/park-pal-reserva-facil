
export type UserRole = "registrador" | "reservador";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ParkingSpot {
  id: string;
  name: string;
  location: string;
  hourlyRate: number;
  type: string;
  status: "available" | "occupied" | "reserved";
  ownerId: string;
}

export interface Reservation {
  id: string;
  userId: string;
  spotId: string;
  entryTime: Date | null;
  exitTime: Date | null;
  estimatedEntryTime: Date;
  estimatedExitTime: Date;
  status: "pending" | "active" | "completed" | "cancelled";
  totalCost: number | null;
  licensePlate: string;
}

export interface TicketInfo {
  reservationId: string;
  userName: string;
  licensePlate: string;
  spotName: string;
  entryTime: Date | null;
  estimatedEntryTime: Date;
  estimatedExitTime: Date;
  estimatedCost: number;
  fiscalId?: string;
}

export interface ReportFilter {
  startDate: Date;
  endDate: Date;
  spotIds?: string[];
}

export interface Income {
  date: Date;
  amount: number;
  reservationCount: number;
}
