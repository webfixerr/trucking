export interface Trip {
  id?: number; // Added for SQLite primary key
  pickUpToDestiny: string;
  distance: string;
  date: string;
}