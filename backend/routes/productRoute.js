const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  createProduct,
  getProducts,
  getProduct,
} = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createProduct);
router.get("/", protect, getProducts);
router.get('/:id', protect, getProduct)

module.exports = router;
