const db = require("../db_conn/db");
require("dotenv").config();
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images")); // Ensure correct path for saving images
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

// Handle fetching blog settings
const BlogSettings = async (req, res) => {
  const sql = `
    SELECT t1.username, t2.title, t2.description, t2.created_at, t2.image, t2.imageURL
    FROM tblusers t1
    JOIN tblblog_settings t2 ON t1.id = t2.user_id
  `;
  try {
    const [result] = await db.query(sql);
    res.json(result);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Handle fetching blog content
const BlogContent = async (req, res) => {
  const { title } = req.query;
  let sql = `
    SELECT t1.title, t1.description, t1.imageURL AS titleImage, t2.imageURL AS contentImage, t2.description AS contentDESC
    FROM tblblog_settings t1
    JOIN tblblog_content t2 ON t1.id = t2.contentID
  `;
  const params = [];

  if (title) {
    sql += " WHERE t1.title = ?";
    params.push(title);
  }

  try {
    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const blogData = {
      title: rows[0].title,
      description: rows[0].description,
      contentDesc: rows[0].contentDesc,
      image: rows[0].titleImage,
    };

    const images = [];

    rows.forEach((row) => {
      if (
        !images.some(
          (imageURL) =>
            imageURL.contentImage === row.contentImage &&
            imageURL.contentDESC === row.contentDESC
        )
      ) {
        images.push({
          imageURL: row.contentImage,
          contentDESC: row.contentDESC,
        });
      }
    });

    const formattedData = {
      ...blogData,
      images,
    };

    res.json(formattedData);
  } catch (error) {
    console.error("Database query error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Handle creating a blog post title
const BlogPostTitle = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).send("Error uploading file");
    }

    const { username, title, desc } = req.body;
    const image = req.file ? req.file.filename : null;
    const getUserIdSql = "SELECT id FROM tblusers WHERE username = ? ";
    const insertBlogSql =
      "INSERT INTO tblblog_settings (user_id, title, imageURL, description) VALUES (?, ?, ?, ?)";

    try {
      // Get the user ID
      const [userRows] = await db.query(getUserIdSql, [username]);
      if (userRows.length === 0) {
        return res.status(404).send("User not found");
      }
      const userId = userRows[0].id;

      // Insert the blog post
      await db.query(insertBlogSql, [userId, title, image, desc]);
      res.status(201).send("Posted!");
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
};

// Handle creating blog post content
const BlogPostContent = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).send("Error uploading file");
    }
    const { username, title, desc } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!username || !title || !desc) {
      return res.status(400).send("Missing required fields");
    }

    // SQL queries
    const getUserIdSql = "SELECT id FROM tblusers WHERE username = ?";
    const getBlogIdSql =
      "SELECT id FROM tblblog_settings WHERE title = ? AND user_id = ?";
    const insertContentSql =
      "INSERT INTO tblblog_content (contentID, imageURL, description) VALUES (?, ?, ?)";

    try {
      // Get the user ID
      const [userRows] = await db.query(getUserIdSql, [username]);
      if (userRows.length === 0) {
        return res.status(404).send("User not found");
      }
      const userId = userRows[0].id;

      // Get the blog post ID
      const [blogRows] = await db.query(getBlogIdSql, [title, userId]);
      if (blogRows.length === 0) {
        return res.status(404).send("Blog post not found");
      }
      const contentID = blogRows[0].id;

      // Insert the blog content
      await db.query(insertContentSql, [contentID, image, desc]);

      res.status(201).send("Posted!");
    } catch (error) {
      console.error("Error inserting blog content:", error);
      res.status(500).send("Internal Server Error");
    }
  });
};

// Export the routes and upload middleware
module.exports = {
  BlogSettings,
  BlogContent,
  BlogPostTitle,
  BlogPostContent,
  upload,
};
