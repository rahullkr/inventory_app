const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;

  if (!name || !sku || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error("please fill in all the details");
  }

  //product bnega yha pe
  let fileData = {};
  //   console.log(req.file);
  if (req.file) {
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Inventory App",
        resource_type: "image",
      });
    } catch (err) {
      res.status(500);
      throw new Error("image could not be uploaded");
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  const product = await Product.create({
    user: req.user.id,
    name,
    sku,
    category,
    quantity,
    price,
    description,
    image: [fileData],
  });
  console.log(product);
  res.status(201).json(product);
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user.id }).sort("-createdAt");
  res.status(200).json(products);
});

const getProduct =  asyncHandler(async (req,res)=>{
  const product = await Product.findById(req.params.id);
  if(!product)
  {
    res.status(404)
    throw new Error('product not found')
  }
  if(product.user.toString()!== req.user.id){
    res.status(401)
    throw new Error('user not authrorized')
  }
  res.status(200).json(product);
})
module.exports = {
  createProduct,
  getProducts,
  getProduct,
};
