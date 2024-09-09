const db = require("../db_conn/db");

const getTreeViewParent = async (req, res) => {
  const sql = "SELECT * FROM tbltreeviewparent";
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTreeViewChild = async (req, res) => {
  const queryStr = `
    SELECT t1.id AS parentID, t1.name AS parentName, t1.path AS parentPath, 
           t2.id AS childID, t2.name AS childName, t2.path AS childPath,
           t3.id AS grandchildID, t3.name AS grandchildName, t3.path AS grandchildPath
    FROM tbltreeviewparent t1
    LEFT JOIN tbltreeviewchildmenu t2 ON t1.id = t2.parentID 
    LEFT JOIN tbltreeviewgrandchild t3 ON t2.id = t3.childID
    ORDER BY t2.name ASC, t3.name ASC;
  `;

  try {
    const [results] = await db.query(queryStr);
    // Format data into desired JSON structure
    const formattedData = results.reduce(
      (
        acc,
        {
          parentID,
          parentName,
          parentPath,
          childID,
          childName,
          childPath,
          grandchildID,
          grandchildName,
          grandchildPath,
        }
      ) => {
        let parent = acc.find((item) => item.parentID === parentID);
        if (!parent) {
          parent = {
            parentID: parentID,
            name: parentName,
            path: parentPath,
            children: [],
          };
          acc.push(parent);
        }

        if (childID) {
          let child = parent.children.find((item) => item.id === childID);
          if (!child) {
            child = {
              id: childID,
              name: childName,
              path: childPath,
              children: [],
            };
            parent.children.push(child);
          }

          if (grandchildID) {
            child.children.push({
              id: grandchildID,
              name: grandchildName,
              path: grandchildPath,
            });
          }
        }

        return acc;
      },
      []
    );

    // Remove parentID from the final JSON structure
    const finalData = formattedData.map(({ parentID, ...rest }) => rest);
    res.status(200).json(finalData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
};

const postParentTreeView = async (req, res) => {
  const { name, path } = req.body;
  let sql = `INSERT INTO tbltreeviewparent (name, path, type) VALUES (?, ?, 5)`;

  try {
    await db.query(sql, [name, path]);
    res.status(201).send("Parent Treeview Created");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const postChildTreeView = async (req, res) => {
  const { name, path, parent } = req.body;
  let sql = "SELECT id FROM tbltreeviewparent WHERE name = ? AND path = ?";
  let sec_sql =
    "INSERT INTO tbltreeviewchildmenu(name, path, parentID) VALUES (?, ?, ?)";
  try {
    const [result] = await db.query(sql, [parent, path]);
    if (result.length === 0) {
      return res.status(404).send("Parent Name not found");
    }
    const parentID = result[0].id;

    await db.query(sec_sql, [name, path, parentID]);
    res.status(201).send("Child Treeview Created!");
  } catch (error) {
    console.error("Error inserting child treeview content:", error);
    res.status(500).send("Internal Server Error");
  }
};

const putTreeView = async (req, res) => {
  const { parent } = req.body;
  const { path, ...locations } = parent; // Extract the path and the remaining locations

  let allIds = [];
  try {
    for (const [key, value] of Object.entries(locations)) {
      console.log(`Key: ${key}, Name: ${value}, Path: ${path}`);

      // Query for the ID using the name (value) and path
      let sql_1 = `SELECT id FROM tbltreeviewparent WHERE name = ? AND path = ?`;
      console.log(`Querying for: ${value}, Path: ${path}`);

      const [results] = await db.query(sql_1, [key, path]);
      const ids = results.map((row) => row.id);
      allIds = [...allIds, ...ids]; // Add to the allIds array
    }

    if (allIds.length > 0) {
      console.log("Collected IDs:", allIds);
      let index = 0;

      // Update each record with its respective value (location name)
      for (const id of allIds) {
        const nameToUpdate = Object.values(locations)[index];
        let sql_2 = `UPDATE tbltreeviewparent SET name = ? WHERE id = ?`;

        console.log(`Updating ID: ${id} with Name: ${nameToUpdate}`);
        await db.query(sql_2, [nameToUpdate, id]); // Await the update query

        index++; // Move to the next item
      }
    } else {
      console.log("No matching records found");
    }

    res
      .status(200)
      .json({ message: "Query executed successfully", ids: allIds });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getTreeViewParent,
  getTreeViewChild,
  postParentTreeView,
  postChildTreeView,
  putTreeView,
};
