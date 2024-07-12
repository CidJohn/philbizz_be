const db = require("../db_conn/db");

// Get all users
const getUsers = async (req, res) => {
  const sql = "SELECT * FROM tbluseraccount";
  try {
    const results = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new user
const addUser = async (req, res) => {
  const newUser = req.body;
  const sql = "INSERT INTO users SET ?";
  try {
    const result = await query(sql, newUser);
    res.status(201).json({ id: result.insertId, ...newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUsers, addUser };
