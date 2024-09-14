const db = require("../db_conn/db");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    SELECT 
      t1.id AS userid,
      t1.username,
      t2.id AS commentID, 
      t2.title, 
      t2.description, 
      t2.created_at, 
      t2.image, 
      t2.imageURL,
      t2.like_counter,
      IF(t3.userid = t1.id AND t3.userid IS NOT NULL AND t3.postid IS NOT NULL, TRUE, FALSE) AS likes
    FROM tblusers t1
    JOIN tblblog_settings t2 ON t1.id = t2.user_id
    LEFT JOIN tblblog_liked t3 ON t1.id = t3.userid AND t2.id = t3.postid
  `;

  try {
    const [result] = await db.query(sql);

    // Encrypt the id for each result using jwt
    const encryptedResults = result.map((result) => {
      const commentToken = jwt.sign(
        { commentID: result.commentID },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
          algorithm: "HS256",
        }
      );
      const userToken = jwt.sign(
        { userid: result.userid },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
          algorithm: "HS256",
        }
      );
      return {
        ...result,
        userid: userToken,
        commentID: commentToken,
      };
    });

    res.json(encryptedResults);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Handle fetching blog content
const BlogContent = async (req, res) => {
  const { title, username } = req.query;
  let sql = `
    SELECT t1.title, t1.description, t1.imageURL AS titleImage, t1.image, t2.imageURL AS contentImage, t2.description AS contentDESC,
    t2.content
    FROM tblblog_settings t1
    JOIN tblblog_content t2 ON t1.id = t2.contentID
    JOIN tblusers t3 ON t3.id = t1.user_id
     WHERE t1.title = ? AND t3.username = ?
  `;
  try {
    const [rows] = await db.query(sql, [title, username]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const blogData = {
      title: rows[0].title,
      description: rows[0].description,
      contentDesc: rows[0].contentDesc,
      image1: rows[0].titleImage,
      image2: rows[0].image,
    };

    const images = [];

    rows.forEach((row) => {
      if (
        !images.some(
          (imageURL) =>
            imageURL.contentImage === row.contentImage &&
            imageURL.contentDESC === row.contentDESC &&
            imageURL.content === row.content
        )
      ) {
        images.push({
          imageURL: row.contentImage,
          contentDESC: row.contentDESC,
          content: row.content,
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
    const { userid, title, desc } = req.body;
    const image = req.file ? req.file.filename : null;
    const insertBlogSql =
      "INSERT INTO tblblog_settings (user_id, title, imageURL, description, like_counter) VALUES (?, ?, ?, ?, 0)";

    try {
      // Get the user ID
      const decuserid = jwt.verify(userid, process.env.SECRET_KEY);
      // Insert the blog post
      await db.query(insertBlogSql, [decuserid.id, title, image, desc]);
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
    const { userid, title, desc } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!userid || !title || !desc) {
      return res.status(400).send("Missing required fields");
    }

    // SQL queries
    const getBlogIdSql =
      "SELECT id FROM tblblog_settings WHERE title = ? AND user_id = ?";
    const insertContentSql =
      "INSERT INTO tblblog_content (contentID, imageURL, description) VALUES (?, ?, ?)";

    try {
      // Get the user ID
      const decuserid = jwt.verify(userid, process.env.SECRET_KEY).id;

      // Get the blog post ID
      const [blogRows] = await db.query(getBlogIdSql, [title, decuserid]);
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

const BlogComment = async (req, res) => {
  const { id } = req.query; // This should get the id from the URL path
  let sql = `SELECT t1.comment, t2.username FROM tblblog_comment t1 
              JOIN tblusers t2 ON t1.userid = t2.id 
              WHERE commentID = ?`;

  try {
    const decryptedId = jwt.verify(id, process.env.SECRET_KEY);
    const [result] = await db.query(sql, [decryptedId.commentID]);
    res.json(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const BlogCommentPost = async (req, res) => {
  const { userid, commentID, comment } = req.body;
  let sql = `INSERT INTO tblblog_comment (userID,commentID,comment) VALUES (? , ? , ?)`;

  try {
    const decryptedUserId = jwt.verify(userid, process.env.SECRET_KEY);
    const decryptedCommentId = jwt.verify(commentID, process.env.SECRET_KEY);
    await db.query(sql, [
      decryptedUserId.id,
      decryptedCommentId.commentID,
      comment,
    ]);
    res.status(201).send("Comment Posted!");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const BlogLiked = async (req, res) => {
  const { postid, userid } = req.body;
  let decryptedUserId, decryptedPostId;

  try {
    decryptedUserId = jwt.verify(userid, process.env.SECRET_KEY).id;
    decryptedPostId = jwt.verify(postid, process.env.SECRET_KEY).commentID;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }

  const selectLikeQuery = `SELECT * FROM tblblog_liked WHERE postid = ? AND userID = ?`;
  const deleteLikeQuery = `DELETE FROM tblblog_liked WHERE postid = ? AND userID = ?`;
  const decrementLikeQuery = `UPDATE tblblog_settings SET like_counter = like_counter - 1 WHERE id = ?`;
  const insertLikeQuery = `INSERT INTO tblblog_liked (postid, userID) VALUES (?, ?)`;
  const incrementLikeQuery = `UPDATE tblblog_settings SET like_counter = like_counter + 1 WHERE id = ?`;

  try {
    const [resultSelect] = await db.query(selectLikeQuery, [
      decryptedPostId,
      decryptedUserId,
    ]);

    if (resultSelect.length > 0) {
      await db.query(deleteLikeQuery, [decryptedPostId, decryptedUserId]);
      await db.query(decrementLikeQuery, [decryptedPostId]);
      return res.json({ liked: false, message: "Post unliked successfully" });
    } else {
      await db.query(insertLikeQuery, [decryptedPostId, decryptedUserId]);
      await db.query(incrementLikeQuery, [decryptedPostId]);
      return res.json({ liked: true, message: "Post liked successfully" });
    }
  } catch (error) {
    console.error("Error in liking/unliking post:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const GetBlogLikedStatus = async (req, res) => {
  const { postid, userid } = req.body;
  let decryptedUserId, decryptedPostId;

  try {
    if (!postid || !userid) return;
    decryptedUserId = jwt.verify(userid, process.env.SECRET_KEY).id;
    decryptedPostId = jwt.verify(postid, process.env.SECRET_KEY).commentID;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }

  const selectLikeQuery = `SELECT * FROM tblblog_liked WHERE postid = ? AND userID = ?`;

  try {
    const [resultSelect] = await db.query(selectLikeQuery, [
      decryptedPostId,
      decryptedUserId,
    ]);

    if (resultSelect.length > 0) {
      return res.json({ liked: true });
    } else {
      return res.json({ liked: false });
    }
  } catch (error) {
    console.error("Error fetching like status:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const postBlogContent = async (req, res) => {
  const { header, content } = req.body;
  let _sql = `INSERT INTO tblblog_settings (user_id, title, description, image) VALUES (?,?,?,?)`;
  let _sql_2 = `INSERT INTO tblblog_content (contentID, content) VALUES (?,?)`;
  let sql_1 = `SELECT id FROM tblblog_settings WHERE user_id = ? AND title = ?`;
  try {
    await db.query(_sql, [
      5,
      header.text.title,
      header.text.description,
      header.image,
    ]);
    const [result] = await db.query(sql_1, [5, header.text.title]);
    if (result.length > 0) {
      const contentId = result[0].id;
      await db.query(_sql_2, [contentId, content]);
    }

    res.status(200).send("New Blog Being Posted!");
  } catch (error) {
    console.error("Error fetching like status:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  BlogSettings,
  BlogContent,
  BlogComment,
  BlogPostTitle,
  BlogPostContent,
  BlogCommentPost,
  BlogLiked,
  GetBlogLikedStatus,
  postBlogContent,
  upload,
};
