const express = require("express");
const { getUsers, addUser } = require("../controllers/userController");
const { getNavbar } = require("../controllers/navbarController");
const {
  getTreeViewParent,
  getTreeViewChild,
} = require("../controllers/treeviewController");
const { cardSettings } = require("../controllers/cardsettingController");
const { getLanguage } = require("../controllers/translateController");

const router = express.Router();

router.get("/users", getUsers);
router.get("/treeview/parent", getTreeViewParent);
router.get("/treeview/child", getTreeViewChild);
router.get("/navbarcontent", getNavbar);
router.get("/translation/language", getLanguage);
router.post("/users", addUser);
router.post("/card-settings", cardSettings);

module.exports = router;
