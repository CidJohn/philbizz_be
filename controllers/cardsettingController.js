const db = require("../db_conn/db");

const cardSettings = (req, res) => {
  const searchInput = `%${req.body.searchInput}%`; // Extract the search input from the request body and format it for the SQL query
  const sql = `SELECT * FROM tblcardsetting t1
               INNER JOIN tblsettings t2 ON t1.setting_id = t2.id 
               WHERE tblsettings.name LIKE ?`;

  db.query(sql, [searchInput], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results); // Return the search results
  });
};

module.exports = { cardSettings };
