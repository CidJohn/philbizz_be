const express = require("express");
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
  companyFilter,
  getbusinessCompanyView,
} = require("../controllers/businessController");
const {
  BlogSettings,
  BlogContent,
  BlogPostTitle,
  BlogPostContent,
} = require("../controllers/blogController");
const router = express.Router();

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
router.get("/business-company-filter", companyFilter);
router.get("/business-company-viewpage", getbusinessCompanyView);
router.get("/blog-settings", BlogSettings);
router.get("/blog-content", BlogContent);

router.post("/blog-post-title", BlogPostTitle);
router.post("/blog-post-content", BlogPostContent);

module.exports = router;
