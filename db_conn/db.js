const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to database:", err);
      setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
    } else {
      console.log("Connected to database.");
      //createDatabaseAndTable(); // Create database and table on successful connection
    }
  });

  connection.on("error", (err) => {
    console.error("Database error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect(); // Reconnect if connection is lost
    } else {
      throw err;
    }
  });
}

function createDatabaseAndTable() {
  connection.query(
    "CREATE DATABASE IF NOT EXISTS ??",
    [dbConfig.database],
    (err, result) => {
      if (err) {
        console.error("Error creating database:", err);
        return;
      }
      console.log("Database created or already exists.");

      connection.query("USE ??", [dbConfig.database], (err) => {
        if (err) {
          console.error("Error switching to database:", err);
          return;
        }
        console.log(`Using ${dbConfig.database} database.`);

        const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL,
          email VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

        connection.query(createUsersTable, (err) => {
          if (err) {
            console.error("Error creating users table:", err);
            return;
          }
          console.log("Users table created or already exists.");
        });
      });
    }
  );
}

handleDisconnect();

module.exports = connection;
