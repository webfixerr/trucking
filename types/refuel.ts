export interface Refuel {
  id?: number; // Added for SQLite primary key
  station: string;
  capacity: string;
  date: string;
}