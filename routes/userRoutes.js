const express = require("express");
const { getUsers, addUser } = require("../controllers/userController");
const { getNavbar } = require("../controllers/navbarController");
const {
  getTreeViewParent,
  getTreeViewChild,
} = require("../controllers/treeviewController");
const {
  cardSettings,
  cardPath,
  cardDesc,
  cardInfo,
  imageURL,
} = require("../controllers/cardsettingController");
const { getLanguage } = require("../controllers/translateController");
const {
  getBusinessData,
  getHomeViewBusiness,
  getCompanySettings,
  getBusinessCategories,
} = require("../controllers/businessController");
const router = express.Router();

router.get("/users", getUsers);
router.get("/treeview/parent", getTreeViewParent);
router.get("/treeview/child", getTreeViewChild);
router.get("/navbarcontent", getNavbar);
router.get("/translation/language", getLanguage);
router.get("/business-types/:type", cardSettings);
router.get("/card-desciption/:type", cardDesc);
router.get("/card_path", cardPath);
router.get("/card_info/:type", cardInfo);
router.get("/business-data", getBusinessData);
router.get("/imageURL/:type", imageURL);
router.get("/homeview-business", getHomeViewBusiness);
router.get("/business-settings", getCompanySettings);
router.get("/business-category", getBusinessCategories);
router.post("/users", addUser);

module.exports = router;
