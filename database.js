import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'carbiforce.db');

/**
 * Executes a SELECT SQL query against the SQLite database.
 * @param {string} sqlQuery - The SELECT SQL query to execute.
 * @param {Array<any>} [params=[]] - Optional parameters for the SQL query.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of result objects, or an empty array if no results.
 * @throws {Error} If there's an error during database operation.
 */
async function executeQuery(sqlQuery, params = []) {
  return new Promise((resolve, reject) => {
    // Use verbose mode for more detailed error messages during development
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        return reject(new Error(`Failed to open database: ${err.message}`));
      }
      // console.log('Connected to the SQLite database.');
    });

    db.all(sqlQuery, params, (err, rows) => {
      if (err) {
        console.error('Error running query:', err.message);
        reject(new Error(`Database query failed: ${err.message}`));
      } else {
        resolve(rows);
      }
    });

    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        // Even if closing fails, we might have already resolved/rejected,
        // but it's good to log this.
      }
      // console.log('Closed the database connection.');
    });
  });
}

export default { executeQuery };
