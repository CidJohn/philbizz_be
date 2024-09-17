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
  const sql = `SELECT t1.Header, t1.descname, t2.title, t2.images, t2.description, t2.created_at 
                FROM tblbusinesses t1
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

const getBusinessCategories = async (req, res) => {
  const sql = `SELECT t1.name AS parentName,t2.id AS childID, t2.name AS childName,
                t1.path AS parentPath, t2.path AS childPath
                FROM tblcompanycategory t1 
                JOIN tblcategory t2 
                ON t1.id = t2.parentID`;
  try {
    const [result] = await db.query(sql);
    const categoryMap = result.reduce((acc, row) => {
      if (!acc[row.parentName]) {
        acc[row.parentName] = {
          title: row.parentName,
          href: row.parentPath || "/",
          links: [],
        };
      }
      acc[row.parentName].links.push({
        id: row.childID,
        name: row.childName,
        href: row.childPath || "/",
      });
      return acc;
    }, {});

    const categories = Object.values(categoryMap);

    res.json(categories);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCompanySettings = async (req, res) => {
  const sql = `
    SELECT  t1.name AS parentName,
    t2.name AS title, t2.description AS description, t2.image 
    FROM tblcategory t1 JOIN  tblcompanysettings t2 ON
    t1.id = t2.parentID JOIN  tblcompanycategory t3 ON
    t3.id = t1.parentID
    GROUP BY t2.name, t3.id, t1.name, t2.id, t2.description, t2.image 
    ORDER BY t1.created_at DESC;
`;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const companyFilter = async (req, res) => {
  const { name, title, description } = req.query;

  let sql = `SELECT  t1.name AS parentName, 
    t2.name AS title, t2.description AS description, t2.image 
    FROM tblcategory t1 
    JOIN tblcompanysettings t2 ON t1.id = t2.parentID 
    JOIN tblcompanycategory t3 ON t3.id = t1.parentID`;

  const params = [];
  const conditions = [];

  if (name) {
    conditions.push("t1.name = ?");
    params.push(`${name}`);
  }
  if (title) {
    conditions.push("t2.name LIKE ?");
    params.push(`%${title}%`);
  }
  if (description) {
    conditions.push("t2.description LIKE ?");
    params.push(`%${description}%`);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  try {
    const [result] = await db.query(sql, params);
    res.json(result);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getbusinessCompanyView = async (req, res) => {
  const { company } = req.query;
  let sql = `
    SELECT 
      t1.name AS companyName, 
      t1.image AS imgLOGO,
      t2.desc AS description, 
      t2.contact AS contact, 
      t2.email AS email, 
      t2.address AS address, 
      t2.person AS person,
      t2.establish AS establish,
      t2.employee AS employee,
      t2.business AS business,
      t2.locationURL,
    FROM 
      tblcompanysettings t1 
    JOIN 
      tblcompany_viewpage t2 ON t1.id = t2.companyID
  `;
  const params = [];
  if (company) {
    sql += ` WHERE t1.name = ?`;
    params.push(company);
  }

  try {
    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(rows);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCompany_Image = async (req, res) => {
  const { company } = req.query;
  let sql = `SELECT t3.imageURL AS companyImage, 
      t3.contentEditor AS content,
      t3.desc AS imgDesc
      FROM  tblcompanysettings t1 
      JOIN  tblcompany_viewpage t2 ON t1.id = t2.companyID
      JOIN tblcompany_image t3 ON t2.id = t3.imageID
      WHERE t1.name = ? `;

  try {
    const [result] = await db.query(sql, [company]);
    if (result.length > 0) {
      res.json(result);
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCompany_product = async (req, res) => {
  const { company } = req.query;
  let sql = `SELECT t3.name AS productName, 
      t3.imageURL as productImage, 
      t3.desc AS productDesc FROM tblcompanysettings t1
      JOIN tblcompany_viewpage t2 ON t1.id = t2.companyID
      JOIN tblcompany_product t3 ON t2.id = t3.productID
      WHERE t1.name = ?`;
  try {
    const [result] = await db.query(sql, [company]);
    if (result.length) {
      res.json(result);
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCompany_personnel = async (req, res) => {
  const { company } = req.query;
  let sql = `SELECT t3.personName,
      t3.position,
      t3.imageURL AS personPhoto FROM tblcompanysettings t1
      JOIN tblcompany_viewpage t2 ON t1.id = t2.companyID
      JOIN tblcompany_personnel t3 ON t2.id = t3.companyID
       WHERE t1.name = ?`;
  try {
    const [result] = await db.query(sql, [company]);
    if (result.length) {
      res.json(result);
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCompany_social = async (req, res) => {
  const { company } = req.query;
  let sql = `SELECT t3.Facebook AS facebook,
        t3.Instragram AS instagram,
        t3.x AS x,
        t3.kakaotalk AS Kakaotalk,
        t3.website AS website,
        t3.Telegram AS telegram,
        t3.whatsapps AS WhatsApp,
        t3.wechat AS WeChat FROM tblcompanysettings t1
      JOIN tblcompany_viewpage t2 ON t1.id = t2.companyID
      JOIN  tblcompany_social t3 ON t2.id = t3.socialID
      WHERE t1.name = ?`;
  try {
    const [result] = await db.query(sql, [company]);
    if (result.length) {
      res.json(result);
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

const postCategory = async (req, res) => {
  const { parent, path, child } = req.body;
  let _sql = `SELECT name FROM tblcompanycategory`;
  let sql = `INSERT INTO tblcompanycategory(name, path) VALUES(?,?)`;
  let sql_1 = `SELECT id FROM tblcompanycategory WHERE name = ? AND path = ?`;
  let sql_2 = `INSERT INTO tblcategory(parentID,name,path) VALUES (?, ?, ?)`;
  try {
    const [parentResult] = await db.query(_sql);

    const isParentExists = parentResult.some(
      (item) => item.name.trim().toLowerCase() === parent.trim().toLowerCase()
    );

    if (isParentExists) {
      return res.status(400).send("The Parent Name already exists!");
    }
    await db.query(sql, [parent, path]);

    const [result] = await db.query(sql_1, [parent, path]);

    if (result.length === 0) {
      return res.status(404).send("The parent is not Created!");
    }
    const parentID = result[0].id;

    for (const { child: childname, path: childPath } of child) {
      if (childname && childname.trim() !== "") {
        await db.query(sql_2, [parentID, childname, childPath]);
      }
    }

    // Success response after all children are inserted
    return res.status(201).send("Categories successfully created!");
  } catch (error) {
    // Error handling
    res.status(400).send(`Error: ${error.message}`);
  }
};

const putCategoryHeader = async (req, res) => {
  const { header, path } = req.body;
  let _sql = `SELECT id FROM tblcompanycategory WHERE name = ? AND path = ?`;
  let sql = `UPDATE tblcompanycategory SET name = ? WHERE id = ?`;

  try {
    for (const [oldName, newName] of Object.entries(header)) {
      const [parentName] = await db.query(_sql, [oldName, path]);

      if (parentName.length > 0) {
        const parentID = parentName[0].id;

        await db.query(sql, [newName, parentID]);
      } else {
        return res
          .status(404)
          .send(`Category ${oldName} not found for path ${path}`);
      }
    }

    return res.status(200).send("Category headers updated successfully!");
  } catch (error) {
    res.status(500).send(`Error updating categories: ${error.message}`);
  }
};

const putCategoryChild = async (req, res) => {
  const { child } = req.body;
  let _sql = `UPDATE tblcategory SET name = ? WHERE id = ?`;

  try {
    // Loop through the child object and update the corresponding rows
    for (const key in child) {
      if (child.hasOwnProperty(key)) {
        const { id, name } = child[key];
        // Only update if the name exists and is not empty
        if (name && name.trim() !== "") {
          await db.query(_sql, [name, id]);
        }
      }
    }
    return res.status(200).send("Category children updated successfully!");
  } catch (error) {
    res.status(500).send(`Error updating children: ${error.message}`);
  }
};

const postCategoryChildUpdate = async (req, res) => {
  const { addNew, path } = req.body;
  let _sql = `SELECT id FROM tblcompanycategory WHERE name = ? and path = ?`;
  let sql = `INSERT INTO tblcategory(parentID,name,path) VALUES (?,?,?)`;

  try {
    for (const [header, categories] of Object.entries(addNew)) {
      const [result] = await db.query(_sql, [header, path]);
      if (result.length === 0) {
        return res
          .status(404)
          .send(`Parent category "${header}" not found for path "${path}".`);
      }

      const parentID = result[0].id;

      for (const { id, value } of categories) {
        if (value && value.trim() !== "") {
          await db.query(sql, [parentID, value, path]);
        }
      }
    }

    return res.status(201).send("Categories added successfully!");
  } catch (error) {
    res.status(500).send(`Error adding categories: ${error.message}`);
  }
};

const postBusinessContent = async (req, res) => {
  const { Treeview, TextLine, TextEditor, Personnel } = req.body;

  // Queries
  let _sql = `SELECT id FROM tblcategory WHERE name = ?`;
  let _sql_2 = `SELECT id FROM tblcompanysettings WHERE name = ? AND parentID = ?`;
  let _sql_3 = `SELECT id FROM tblcompany_viewpage WHERE companyID = ?`;

  let sql = `INSERT INTO tblcompanysettings(parentID, name, description, image) VALUES (?,?,?,?)`;
  let sql_2 = `INSERT INTO tblcompany_viewpage(companyID, \`desc\`, person, contact, email, address, business, locationURL)
               VALUES (?,?,?,?,?,?,?,?)`;
  let sql_3 = `INSERT INTO tblcompany_image(imageID, contentEditor) VALUES (?,?)`;
  let sql_4 = `INSERT INTO tblcompany_product(productID, imageURL) VALUES (?,?)`;
  let sql_5 = `INSERT INTO tblcompany_personnel(companyID, personName, position, imageURL) VALUES (?,?,?,?)`;
  let sql_6 = `INSERT INTO tblcompany_social(socialID) VALUES(?)`;

  try {
    const [categoryResult] = await db.query(_sql, [Treeview.child]);
    if (categoryResult.length > 0) {
      const childID = categoryResult[0].id;

      await db.query(sql, [
        childID,
        TextLine.required.title,
        TextLine.required.description,
        TextLine.required.image,
      ]);

      const [settingsResult] = await db.query(_sql_2, [
        TextLine.required.title,
        childID,
      ]);

      if (settingsResult.length > 0) {
        const companyID = settingsResult[0].id;
        const person = Personnel.entries
          .slice(0, 1)
          .map((item) => item.personnelName)
          .join(", ");

        await db.query(sql_2, [
          companyID,
          TextLine.required.description,
          person,
          TextLine.required.contact,
          TextLine.required.email,
          TextLine.required.description,
          TextLine.required.service,
          TextLine.required.location,
        ]);

        const [companyResult] = await db.query(_sql_3, [companyID]);
        if (companyResult.length > 0) {
          const pageID = companyResult[0].id;

          await db.query(sql_3, [pageID, TextEditor]);

          for (const [key, option] of Object.entries(TextLine.option)) {
            const value = option.value;
            await db.query(sql_4, [pageID, value]);
          }

          for (const entry of Personnel.entries) {
            const { personnelName, position, imagePreview } = entry;
            await db.query(sql_5, [
              pageID,
              personnelName,
              position,
              imagePreview,
            ]);
          }
          await db.query(sql_6, [pageID]);
        }
      }
    }

    return res.status(200).send(`New ${Treeview.name} Card is being Created!`);
  } catch (error) {
    console.error("Error in postBusinessContent:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBusinessData,
  getHomeViewBusiness,
  getBusinessCategories,
  getCompanySettings,
  companyFilter,
  getbusinessCompanyView,
  getCompany_Image,
  getCompany_personnel,
  getCompany_product,
  getCompany_social,
  postCategory,
  putCategoryHeader,
  putCategoryChild,
  postCategoryChildUpdate,
  postBusinessContent,
};
