const db = require("../db_conn/db");

const cardSettings = async (req, res) => {
  const businessType = req.params.type;
  const query = `
  SELECT 
      bt.businessType,
      b.header,
      b.image AS business_image,
      b.paragraph,
      b.description AS headdesc,
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
      ORDER BY cs.created_at DESC
  `;

  try {
    const [results] = await db.query(query, [businessType]);
    res.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const cardPath = async (req, res) => {
  const sql = `
    SELECT 
      t2.id, 
      t1.title 
    FROM 
      tblcard_settings t1 
    JOIN 
      tblbusinesses t2 
    ON 
      t1.businessID = t2.id
  `;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const cardDesc = async (req, res) => {
  const header = req.params.type;
  const sql = "SELECT * FROM tblbusinesses WHERE descname = ?";

  try {
    const [results] = await db.query(sql, [header]);
    res.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const cardInfo = async (req, res) => {
  const header = req.params.type;
  const sql = `SELECT t2.id AS ParentID, t2.name AS Name,t2.desc, t2.icon_image
                ,t2.menu_image, t2.location_image, t2.servicetype AS type FROM tblcard_settings t1
                INNER JOIN tblcard_info t2
                ON t1.id = t2.cardID 
                WHERE t2.name = ?`;
  try {
    const [results] = await db.query(sql, [header]);
    res.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const imageURL = async (req, res) => {
  const header = req.params.type;
  const sql = `SELECT t1.id AS ParentID, t2.imageURL FROM tblcard_info t1
                LEFT JOIN tblcard_image t2
                ON t1.id = t2.imageID
                WHERE t1.name = ?`;
  try {
    const [results] = await db.query(sql, [header]);
    res.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = { cardSettings, cardPath, cardDesc, cardInfo, imageURL };
