const db = require("../db_conn/db");

const getLanguage = async (req, res) => {
  const sql = `SELECT * FROM tbltranslate`;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getLanguage };
