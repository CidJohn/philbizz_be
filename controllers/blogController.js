const db = require("../db_conn/db");

const BlogSettings = async (req, res) => {
  const sql = `SELECT t1.username,t2.id, t2.title, t2.description, t2.created_at, t2.image 
                FROM tblusers t1 JOIN tblblog_settings t2
                ON t1.id = t2.user_id`;
  try {
    const [result] = await db.query(sql);
    res.json(result);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const BlogContent = async (req, res) => {
  const { id } = req.query;
  let sql = `SELECT t1.username, t2.title, t2.description, t3.image, t3.description AS contentDESC
                 FROM tblusers t1
                 JOIN tblblog_settings t2 ON t1.id = t2.user_id
                 JOIN tblblog_content t3 ON t2.id = t3.contentID`;
  const params = [];

  if (id) {
    sql += " WHERE t2.id = ?";
    params.push(id);
  }

  try {
    const [result] = await db.query(sql, params);
    res.json(result);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { BlogSettings, BlogContent };
