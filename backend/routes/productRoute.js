const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {createProduct} = require('../controllers/productController');
router.post('/', protect, createProduct);

module.exports = router;