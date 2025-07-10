import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function openDatabase(): SQLite.SQLiteDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = SQLite.openDatabaseSync('truckersApp.db');
    console.log('Database opened successfully');
    initializeDatabase();
    return dbInstance;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

function initializeDatabase() {
  if (!dbInstance) {
    console.error('Database instance is null during initialization');
    return;
  }

  try {
    dbInstance.withTransactionSync(() => {
      dbInstance!.runSync(`
        CREATE TABLE IF NOT EXISTS auth (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT,
          user_id TEXT,
          user_name TEXT,
          user_email TEXT,
          tenant TEXT
        );
      `);
      console.log('Auth table created');

      dbInstance!.runSync(`
        CREATE TABLE IF NOT EXISTS pending_trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          origin TEXT,
          destination TEXT,
          beginning_kilometers TEXT,
          started_at TEXT,
          active INTEGER,
          end_notification_sent INTEGER,
          created_at TEXT
        );
      `);
      console.log('Pending trips table created');

      dbInstance!.runSync(`
        CREATE TABLE IF NOT EXISTS pending_refuel (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          service_station_id TEXT,
          kilometers_at_refuel TEXT,
          litres_fueled TEXT,
          price_per_litre TEXT,
          created_at TEXT
        );
      `);
      console.log('Pending refuel table created');

      dbInstance!.runSync(`
        CREATE TABLE IF NOT EXISTS pending_service_stations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          location TEXT,
          fuel_price TEXT,
          rating TEXT,
          is_global INTEGER,
          created_at TEXT
        );
      `);
      console.log('Pending service stations table created');
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.closeSync();
    dbInstance = null;
    console.log('Database closed');
  }
}

export function debugDatabase() {
  try {
    const db = openDatabase();
    const tables = db.getAllSync(
      "SELECT name FROM sqlite_master WHERE type='table';"
    );
    console.log('Database tables:', tables);
  } catch (error) {
    console.error('Error debugging database:', error);
  }
}
