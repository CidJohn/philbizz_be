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
  const sql = `SELECT t2.id AS ParentID, t2.name AS Name,t2.desc,t2.content AS Content, t2.icon_image
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

const postCardContent = async (req, res) => {
  const { Treeview, TextLine, TextEditor } = req.body;

  const _sql = `SELECT id FROM tblbusinesses WHERE header = ?`;
  const _sql_2 = `SELECT id FROM tblcard_settings WHERE location = ? AND title = ?`;
  const _sql_3 = `SELECT id FROM tblcard_info WHERE cardID = ?`;
  const sql_1 = `INSERT INTO tblcard_settings(businessId, location, title, images, description) VALUES (?, ?, ?, ?, ?)`;
  const sql_2 = `INSERT INTO tblcard_info(cardID, name, contact, email, \`desc\`, content, servicetype, icon_image, location_image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const sql_3 = `INSERT INTO tblcard_image(imageID, imageURL) VALUES (?, ?)`;

  try {
    // Check if the business exists
    const [result] = await db.query(_sql, [Treeview.name]);
    if (result.length > 0) {
      const businessID = result[0].id;

      // Insert into tblcard_settings
      await db.query(sql_1, [
        businessID,
        Treeview.child,
        TextLine.required.title,
        TextLine.required.image,
        TextLine.required.description,
      ]);

      // Check if the card settings exist
      const [settingResult] = await db.query(_sql_2, [
        Treeview.child,
        TextLine.required.title,
      ]);

      if (settingResult.length > 0) {
        const cardID = settingResult[0].id;

        // Insert into tblcard_info
        await db.query(sql_2, [
          cardID,
          TextLine.required.title,
          TextLine.required.contact,
          TextLine.required.email,
          TextLine.required.description,
          TextEditor, // Insert QuillJS content here
          TextLine.required.service,
          TextLine.required.image,
          TextLine.required.location,
        ]);

        // Fetch card info and insert images from the options
        const [resultCardInfo] = await db.query(_sql_3, [cardID]);
        if (resultCardInfo.length > 0) {
          const infoID = resultCardInfo[0].id;

          // Insert each image from TextLine.option
          for (const key in TextLine.option) {
            const value = TextLine.option[key].value;
            await db.query(sql_3, [infoID, value]);
          }
        }
      }
    }

    res.status(200).send(`New ${Treeview.name} Card is being Created!`);
  } catch (error) {
    console.error("Error in postCardContent:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  cardSettings,
  cardPath,
  cardDesc,
  cardInfo,
  imageURL,
  postCardContent,
};
