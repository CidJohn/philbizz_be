const db = require("../db_conn/db");

const getLanguage = (req, res) => {
  const sql = `SELECT * FROM tbltranslate`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Error fetching data" });
      return;
    }
    res.json(results);
  });
};

module.exports = { getLanguage };
