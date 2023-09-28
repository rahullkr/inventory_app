// const registerUser = (req,res) => {
//     if(!req.body.email){
//         res.status(400);
//             throw new Error('Please enter the email');
//     }
//     res.send('register user');
// }

const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { Error } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETS, { expiresIn: "1d" });
};
// register user

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //validation part karna hoga and for that
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("please fill all the details");
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error("password must be of 8 characters");
  }

  // check if email already exist

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  // generate token
  const token = generateToken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("invalid user data");
  }
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("invalid user data");
  }

  // now the checking part
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("user not found, sign up right now");
  }


  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  const token = generateToken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });
  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("invalid email or password");
  }
});

// logout user

const logout = asyncHandler(async (req, res) => {
  //there are two ways to logout, one is to delete the cookie and other one is to expire the cookie
  //here we are expiring the cookie
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({
    message: "successfully logged out",
  });
});
//getting the user info
const getUser = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id);
  console.log(user);

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      
    });
  } else {
    res.status(400);
    throw new Error("user not found");
  }
});

module.exports = { registerUser, loginUser, logout, getUser };
