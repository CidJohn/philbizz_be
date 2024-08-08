const db = require("../db_conn/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const BlogSettings = async (req, res) => {
  const sql = `SELECT t1.username, t2.title, t2.description, t2.created_at, t2.image 
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
  const { usename } = req.query;
  let sql = `SELECT t1.username, t2.title, t2.description, t3.image, t3.description AS contentDESC
                 FROM tblusers t1
                 JOIN tblblog_settings t2 ON t1.id = t2.user_id
                 JOIN tblblog_content t3 ON t2.id = t3.user_id`;
  const params = [];

  if (usename) {
    sql += " WHERE t2.username = ?";
    params.push(usename);
  }

  try {
    const [result] = await db.query(sql, params);
    res.json(result);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const BlogPostTitle = async (req, res) => {
  const { username, title, image, desc } = req.query;
  let getUserIdSql = "SELECT id FROM tblusers WHERE username = ?";
  let insertBlogSql =
    "INSERT INTO tblblog_settings (user_id, title, image, descrtion) VALUES (?, ?, ?, ?)";

  try {
    // Get the user ID
    const [userRows] = await db.query(getUserIdSql, [username]);
    if (userRows.length === 0) {
      return res.status(404).send("User not found");
    }
    const userId = userRows[0].id;

    // Insert the blog post
    await db.query(insertBlogSql, [userId, title, image, desc]);
    res.status(201).send("Created new blog");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const BlogPostContent = async () => {
  const { username, image, desc } = req.query;
  let getUserIdSql = "SELECT id FROM tblusers WHERE username = ?";
  let sql =
    "INSERT INTO tblblog_content (contentID, image, description) VALUES (?,?,?)";

  try {
    // Get the user ID
    const [userRows] = await db.query(getUserIdSql, [username]);
    if (userRows.length === 0) {
      return res.status(404).send("User not found");
    }
    const userId = userRows[0].id;

    await db.query(sql, [userId, title, image, desc]);
    res.status(201).send("Created new blog");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { BlogSettings, BlogContent, BlogPostTitle, BlogPostContent };
