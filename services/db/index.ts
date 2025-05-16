import * as SQLite from 'expo-sqlite';

export function openDatabase() {
  return SQLite.openDatabaseSync('truckingExpo.db');
}

export function runMigration(
  db: SQLite.SQLiteDatabase,
  sql: string,
  args: any[] = []
) {
  try {
    db.runSync(sql, args);
    console.log('Migration executed:', sql.split('\n')[0]);
  } catch (error) {
    console.error('Migration error:', error);
  }
}
