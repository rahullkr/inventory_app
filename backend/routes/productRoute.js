const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createProduct);
router.patch("/", protect, upload.single("image"), updateProduct);
router.get("/", protect, getProducts);
router.get('/:id', protect, getProduct)
router.delete('/:id',protect , deleteProduct);
router.patch('/:id', protect, updateProduct)

module.exports = router;
