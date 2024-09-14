const express = require("express");
const { getNavbar } = require("../controllers/navbarController");
const {
  getTreeViewParent,
  getTreeViewChild,
  putTreeView,
  putTreeViewChild,
  postTreeView,
  postChildTreeViewUpdate,
} = require("../controllers/treeviewController");
const {
  cardSettings,
  cardPath,
  cardDesc,
  cardInfo,
  imageURL,
  postCardContent,
} = require("../controllers/cardsettingController");
const { getLanguage } = require("../controllers/translateController");
const {
  getBusinessData,
  getHomeViewBusiness,
  getCompanySettings,
  getBusinessCategories,
  companyFilter,
  getbusinessCompanyView,
  postCategory,
  putCategoryHeader,
  putCategoryChild,
  postCategoryChildUpdate,
  postBusinessContent,
} = require("../controllers/businessController");
const {
  BlogSettings,
  BlogContent,
  BlogPostTitle,
  BlogPostContent,
  BlogCommentPost,
  BlogComment,
  BlogLiked,
  GetBlogLikedStatus,
  postBlogContent,
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
router.get("/comment-section", BlogComment);

router.post("/blog-post-title", BlogPostTitle);
router.post("/blog-post-content", BlogPostContent);
router.post("/blog-post-comment", BlogCommentPost);
router.post("/posts/like", BlogLiked);
router.post("/posts/like-status", GetBlogLikedStatus);
router.post("/treeview/post/data", postTreeView);
router.post("/treeview/post/child-update/data", postChildTreeViewUpdate);
router.post("/category/post/data", postCategory);
router.post("/category/post/child-update/data", postCategoryChildUpdate);
router.post("/card/content/data", postCardContent)
router.post("/company/content/data", postBusinessContent)
router.post("/blog/content/data", postBlogContent)

router.put("/treeview/put/data", putTreeView);
router.put("/treeview/child/put/data", putTreeViewChild);
router.put("/category/put/header/data", putCategoryHeader);
router.put("/category/child/put/data", putCategoryChild);

module.exports = router;
