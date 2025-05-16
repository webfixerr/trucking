import { openDatabase, runMigration } from './index';

export function runMigrations() {
  const db = openDatabase();

  // Auth table
  runMigration(
    db,
    `CREATE TABLE IF NOT EXISTS auth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT,
      user_id TEXT,
      user_name TEXT,
      user_email TEXT
    );`
  );

  // Trips table
  runMigration(
    db,
    `CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pickUpToDestiny TEXT NOT NULL,
      distance TEXT NOT NULL,
      date TEXT NOT NULL
    );`
  );

  // Refuel table
  runMigration(
    db,
    `CREATE TABLE IF NOT EXISTS refuel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station TEXT NOT NULL,
      capacity TEXT NOT NULL,
      date TEXT NOT NULL
    );`
  );
}