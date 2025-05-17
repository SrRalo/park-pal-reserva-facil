
import { User, ParkingSpot, Reservation } from "../types";

// Mock users
export const users: User[] = [
  {
    id: "u1",
    name: "Juan Pérez",
    email: "juan@parksmart.com",
    role: "registrador"
  },
  {
    id: "u2",
    name: "Ana García",
    email: "ana@parksmart.com",
    role: "reservador"
  }
];

// Mock parking spots
export const parkingSpots: ParkingSpot[] = [
  {
    id: "p1",
    name: "A-01",
    location: "Nivel 1, Zona A",
    hourlyRate: 5000,
    type: "Regular",
    status: "available",
    ownerId: "u1"
  },
  {
    id: "p2",
    name: "A-02",
    location: "Nivel 1, Zona A",
    hourlyRate: 5000,
    type: "Regular",
    status: "available",
    ownerId: "u1"
  },
  {
    id: "p3",
    name: "B-01",
    location: "Nivel 1, Zona B",
    hourlyRate: 6000,
    type: "Premium",
    status: "occupied",
    ownerId: "u1"
  },
  {
    id: "p4",
    name: "B-02",
    location: "Nivel 1, Zona B",
    hourlyRate: 6000,
    type: "Premium",
    status: "reserved",
    ownerId: "u1"
  },
  {
    id: "p5",
    name: "C-01",
    location: "Nivel 2, Zona C",
    hourlyRate: 4000,
    type: "Económico",
    status: "available",
    ownerId: "u1"
  }
];

// Generate a date object for a specific time today
const getTimeToday = (hours: number, minutes: number = 0): Date => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Generate a future date (hours from now)
const getFutureTime = (hoursFromNow: number): Date => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date;
};

// Mock reservations
export const reservations: Reservation[] = [
  {
    id: "r1",
    userId: "u2",
    spotId: "p3",
    entryTime: getTimeToday(10, 30),
    exitTime: null,
    estimatedEntryTime: getTimeToday(10, 0),
    estimatedExitTime: getTimeToday(12, 0),
    status: "active",
    totalCost: null,
    licensePlate: "ABC123"
  },
  {
    id: "r2",
    userId: "u2",
    spotId: "p4",
    entryTime: null,
    exitTime: null,
    estimatedEntryTime: getFutureTime(2),
    estimatedExitTime: getFutureTime(4),
    status: "pending",
    totalCost: null,
    licensePlate: "XYZ789"
  }
];

// Mock income data for charts
export const incomeData = [
  { date: new Date(2023, 4, 1), amount: 250000, reservationCount: 10 },
  { date: new Date(2023, 4, 2), amount: 320000, reservationCount: 12 },
  { date: new Date(2023, 4, 3), amount: 180000, reservationCount: 8 },
  { date: new Date(2023, 4, 4), amount: 420000, reservationCount: 15 },
  { date: new Date(2023, 4, 5), amount: 350000, reservationCount: 13 },
  { date: new Date(2023, 4, 6), amount: 280000, reservationCount: 11 },
  { date: new Date(2023, 4, 7), amount: 390000, reservationCount: 14 }
];
