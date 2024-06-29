const db = require("../db_conn/db");

const getUsers = (req, res) => {
  const sql = "SELECT * FROM tbluseraccount";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

const addUser = (req, res) => {
  const newUser = req.body;
  const sql = "INSERT INTO users SET ?";
  db.query(sql, newUser, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...newUser });
  });
};

module.exports = { getUsers, addUser };
