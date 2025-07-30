import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;

export function openDatabase(): SQLite.SQLiteDatabase {
  if (dbInstance && isDatabaseValid(dbInstance)) {
    console.log('Returning existing database instance');
    const tables = dbInstance.getAllSync(
      "SELECT name FROM sqlite_master WHERE type='table';"
    );
    console.log('Existing database tables:', tables);
    return dbInstance;
  }

  if (isInitializing) {
    console.log('Database initialization in progress, waiting...');
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isInitializing && dbInstance && isDatabaseValid(dbInstance)) {
          clearInterval(checkInterval);
          resolve(dbInstance);
        }
      }, 100);
    }) as any;
  }

  try {
    isInitializing = true;
    console.log('Opening new database: truckersApp.db');
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        dbInstance = SQLite.openDatabaseSync('truckersApp.db');
        console.log('Database opened successfully');
        console.log('Database path:', dbInstance.databasePath);
        break;
      } catch (dbError) {
        console.error(`Database open attempt ${attempts + 1} failed:`, dbError);
        attempts++;
        if (attempts === maxAttempts) {
          throw new Error('Failed to open database after multiple attempts');
        }
        new Promise((resolve) => setTimeout(resolve, 500)).then(() => {});
      }
    }
    if (!dbInstance) {
      throw new Error('Failed to initialize dbInstance');
    }
    initializeDatabase();
    const tables = dbInstance.getAllSync(
      "SELECT name FROM sqlite_master WHERE type='table';"
    );
    const requiredTables = [
      'auth',
      'pending_refuel',
      'pending_service_stations',
    ];
    const missingTables = requiredTables.filter(
      (table) => !tables.some((t: any) => t.name === table)
    );
    if (missingTables.length > 0) {
      console.error('Missing tables after initialization:', missingTables);
      throw new Error(`Failed to create tables: ${missingTables.join(', ')}`);
    }
    console.log('Database initialization verified:', tables);
    return dbInstance;
  } catch (error) {
    console.error('Error opening database:', error);
    dbInstance = null;
    throw error;
  } finally {
    isInitializing = false;
  }
}

function initializeDatabase() {
  if (!dbInstance) {
    console.error('Database instance is null before initialization');
    throw new Error('Database instance is null');
  }

  try {
    dbInstance.withTransactionSync(() => {
      if (!dbInstance) {
        console.error(
          'Database instance became null during auth table creation'
        );
        throw new Error('Database instance is null');
      }
      dbInstance.runSync(`
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
    });

    dbInstance.withTransactionSync(() => {
      if (!dbInstance) {
        console.error(
          'Database instance became null during pending_refuel table creation'
        );
        throw new Error('Database instance is null');
      }
      dbInstance.runSync(`
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
    });

    dbInstance.withTransactionSync(() => {
      if (!dbInstance) {
        console.error(
          'Database instance became null during pending_service_stations table creation'
        );
        throw new Error('Database instance is null');
      }
      dbInstance.runSync(`
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
    dbInstance = null;
    throw error;
  }
}

function isDatabaseValid(db: SQLite.SQLiteDatabase): boolean {
  try {
    db.getAllSync('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database instance invalid:', error);
    return false;
  }
}

export function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.closeSync();
      console.log('Database closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
    dbInstance = null;
  }
}

export function debugDatabase() {
  try {
    const db = openDatabase();
    const tables = db.getAllSync(
      "SELECT name FROM sqlite_master WHERE type='table';"
    );
    console.log('Debug database - Tables:', tables);
  } catch (error) {
    console.error('Error debugging database:', error);
  }
}
