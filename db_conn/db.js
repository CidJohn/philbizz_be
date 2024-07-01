const mysql = require("mysql2");

const dbConfig = {
  // host: process.env.DB_HOTS || "localhost",
  // user: process.env.DB_USER || "root",
  // password: process.env.DB_PASSWORD || "C1dj0hn31",
  // database: process.env.DB_DATABASE || "philtongzonedb",
  host:
    process.env.DB_HOTS ||
    "bnrj6ffsalbrdllei68k-mysql.services.clever-cloud.com",
  user: process.env.DB_USER || "uojccqt6egyefdao",
  password: process.env.DB_PASSWORD || "cUdZJpVngxAowWytcw4N",
  database: process.env.DB_DATABASE || "bnrj6ffsalbrdllei68k",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
