const db = require("../db_conn/db");

const cardSettings = (req, res) => {
  const businessType = req.params.type;
  const query = `
  SELECT 
      bt.businessType,
      b.header,
      b.image AS business_image,
      b.paragraph,
      cs.location,
      cs.title,
      cs.images AS card_image,
      cs.description
  FROM 
      tblbusiness_types bt
  JOIN 
      tblbusinesses b ON bt.id = b.businessTypeId
  JOIN 
      tblcard_settings cs ON b.id = cs.businessId
  WHERE 
      bt.path = ?
`;

  db.query(query, [businessType], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
};

const cardPath = (req, res) => {
  const sql = `SELECT t2.id, t1.title FROM tblcard_settings t1 
  JOIN tblbusinesses t2 ON t1.businessID = t2.id`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

const cardDesc = (req, res) => {
  const header = req.params.type;

  const sql = `SELECT * FROM tblbusinesses WHERE descname = ?`;

  db.query(sql, [header], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
};
module.exports = { cardSettings, cardPath, cardDesc };
