const db = require("../db_conn/db");

const getTreeViewParent = (req, res) => {
  const sql = "SELECT * FROM tbltreeviewparent";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

const getTreeViewChild = (req, res) => {
  const query = `
    SELECT t1.id AS parentID, t1.name AS parentName, t1.path AS parentPath, 
           t2.id AS childID, t2.name AS childName, t2.path AS childPath
    FROM tbltreeviewparent t1
    LEFT JOIN tbltreeviewchildmenu t2 ON t1.id = t2.parentID 
    ;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Error fetching data" });
      return;
    }

    // Format data into desired JSON structure
    const formattedData = results.reduce(
      (
        acc,
        { parentID, parentName, parentPath, childID, childName, childPath }
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
          parent.children.push({
            id: childID,
            name: childName,
            path: childPath,
            children: [],
          });
        }

        return acc;
      },
      []
    );

    // Remove parentID from the final JSON structure
    const finalData = formattedData.map(({ parentID, ...rest }) => rest);

    res.status(200).json(finalData);
  });
};

module.exports = { getTreeViewParent, getTreeViewChild };
