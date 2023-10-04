const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoutes");
const productRoute = require("./routes/productRoute");
const contactRoute = require("./routes/contactRoute");
const errorHandler = require("./middlewares/userMiddlewares");
const cookieParser = require("cookie-parser");
const path = require("path");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(errorHandler);
app.use(cookieParser());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contactus", contactRoute);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`server running on port ${PORT} `);
    });
  })
  .catch((err) => console.log(err));
