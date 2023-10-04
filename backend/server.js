const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoutes");
const productRoute = require("./routes/productRoute");
const errorHandler = require("./middlewares/userMiddlewares");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("home");
});

app.use(errorHandler);
app.use(cookieParser());
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`server running on port ${PORT} `);
    });
  })
  .catch((err) => console.log(err));
