const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Create a pool with options
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Get a promise-based connection from the pool
const connection = pool.promise();

// Add reconnect and connection status console logs
pool.on("connection", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Database connection error:", err.code);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Attempting to reconnect...");
    // Attempt to reconnect
    pool.getConnection((error, connection) => {
      if (error) {
        console.error("Error reconnecting:", error.message);
      } else {
        console.log("Reconnected successfully");
        connection.release();
      }
    });
  } else {
    throw err;
  }
});

module.exports = connection;
