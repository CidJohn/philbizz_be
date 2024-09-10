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
      t3.imageURL AS companyImage, 
      t3.desc AS imgDesc, 
      t4.name AS productName, 
      t4.imageURL as productImage, 
      t4.desc AS productDesc,
       t5.Facebook AS facebook,
        t5.Instragram AS instagram,
        t5.x AS x,
        t5.Gmail AS Gmail,
        t5.website AS website,
        t5.linkin AS linkin
    FROM 
      tblcompanysettings t1 
    JOIN 
      tblcompany_viewpage t2 ON t1.id = t2.companyID
    JOIN 
      tblcompany_image t3 ON t2.id = t3.imageID
    JOIN 
      tblcompany_product t4 ON t2.id = t4.productID
    JOIN 
      tblcompany_social t5 ON t2.id = t5.socialID
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

    // Extract unique company details
    const companyData = {
      companyName: rows[0].companyName,
      imgLOGO: rows[0].imgLOGO,
      description: rows[0].description,
      contact: rows[0].contact,
      email: rows[0].email,
      address: rows[0].address,
      person: rows[0].person,
      establish: rows[0].establish,
      employee: rows[0].employee,
      business: rows[0].business,
      locationURL: rows[0].locationURL,
    };

    // Extract unique images and products
    const images = [];
    const products = [];
    const socials = [];

    rows.forEach((row) => {
      if (
        !images.some(
          (image) =>
            image.companyImage === row.companyImage &&
            image.imgDesc === row.imgDesc
        )
      ) {
        images.push({ companyImage: row.companyImage, imgDesc: row.imgDesc });
      }

      if (
        !products.some(
          (product) =>
            product.productName === row.productName &&
            product.productImage === row.productImage &&
            product.productDesc === row.productDesc
        )
      ) {
        products.push({
          productName: row.productName,
          productImage: row.productImage,
          productDesc: row.productDesc,
        });
      }
      if (
        !socials.some(
          (social) =>
            social.facebook === row.facebook &&
            social.instagram === row.instagram &&
            social.x === row.x &&
            social.website === row.website &&
            social.linkin === row.linkin
        )
      ) {
        socials.push({
          facebook: row.facebook,
          instagram: row.instagram,
          x: row.x,
          website: row.website,
          linkin: row.linkin,
        });
      }
    });

    // Combine company data with images and products
    const formattedData = {
      ...companyData,
      images,
      products,
      socials,
    };

    res.json(formattedData);
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
    res.status(201).send("Categories successfully created!");
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

    res.status(200).send("Category headers updated successfully!");
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
    res.status(200).send("Category children updated successfully!");
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

    res.status(201).send("Categories added successfully!");
  } catch (error) {
    res.status(500).send(`Error adding categories: ${error.message}`);
  }
};

module.exports = {
  getBusinessData,
  getHomeViewBusiness,
  getBusinessCategories,
  getCompanySettings,
  companyFilter,
  getbusinessCompanyView,
  postCategory,
  putCategoryHeader,
  putCategoryChild,
  postCategoryChildUpdate
};
