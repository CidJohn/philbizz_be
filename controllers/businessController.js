const db = require("../db_conn/db");
const path = require("path");
const fs = require("fs");

const getBusinessData = (req, res) => {
  const filePath = path.join(
    __dirname,
    "../database/businessNavbarContent.json"
  );
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(JSON.parse(data));
  });
};

const getHomeViewBusiness = async (req, res) => {
  const sql = `SELECT t1.Header,t1.descname,t2.title,t2.images FROM tblbusinesses t1
                 JOIN tblcard_settings t2
                 ON t1.id = t2.businessId 
                 ORDER BY created_at desc `;
  try {
    const [result] = await db.query(sql);
    res.json(result);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = { getBusinessData, getHomeViewBusiness };
