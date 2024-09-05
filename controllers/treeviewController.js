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

module.exports = {
  getTreeViewParent,
  getTreeViewChild,
  postParentTreeView,
  postChildTreeView,
};
