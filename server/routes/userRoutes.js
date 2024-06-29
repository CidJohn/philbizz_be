const express = require("express");
const { getUsers, addUser } = require("../controllers/userController");
const { getNavbar } = require("../controllers/navbarController");
const {
  getTreeViewParent,
  getTreeViewChild,
} = require("../controllers/treeviewController");

const router = express.Router();

router.get("/users", getUsers);
router.get("/treeview/parent", getTreeViewParent);
router.get("/treeview/child", getTreeViewChild);
router.get("/navbarcontent", getNavbar);
router.post("/users", addUser);

module.exports = router;
