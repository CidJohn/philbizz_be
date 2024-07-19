const db = require("../db_conn/db");

const getNavbar = async (req, res) => {
  const sql = `SELECT t1.id AS parentID, t1.name AS parentName, t1.path AS parentPath, t1.businessPath AS businessPath, 
               t2.id AS childID, t2.name AS childName, t2.path AS childPath
               FROM tblnavbarcontent t1
               LEFT JOIN tblnavbarchild t2 ON t1.id = t2.parentID`;

  try {
    // Execute the query
    const [results] = await db.query(sql);
    // Format the results into the desired JSON structure
    const formattedData = results.reduce(
      (
        acc,
        {
          parentID,
          parentName,
          parentPath,
          businessPath,
          childID,
          childName,
          childPath,
        }
      ) => {
        let parent = acc.find((item) => item.id === parentID);
        if (!parent) {
          parent = {
            id: parentID,
            name: parentName,
            path: parentPath,
            businessPath: businessPath,
            children: [],
          };
          acc.push(parent);
        } 
        if (childID) {
          parent.children.push({
            id: childID,
            name: childName,
            path: childPath,
            children: [], // Assuming children for child are empty for now
          });
        }
        return acc;
      },
      []
    );

    // Send the formatted data as the response
    res.status(200).json(formattedData);
  } catch (error) {
    // Log and handle errors
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getNavbar };
