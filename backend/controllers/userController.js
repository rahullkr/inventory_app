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
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

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

// getting the login status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  const verified = jwt.verify(token, process.env.JWT_SECRETS);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

//updating the user
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  // console.log(user);
  if (user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});
// change password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;
  if (!user) {
    res.status(400);
    throw new Error("user not found");
  }
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("enter the password correctly");
  }
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("password change successful");
  } else {
    res.status(400);
    throw new Error("old password is incoorect");
  }
});

//forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  // res.send('forgot passwoed')
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("user does not exists");
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await Token.deleteOne();
  }
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log((resetToken));
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // console.log(hashedToken);
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000),
  }).save();

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;


  const message = `<h2> Hello ${user.name}</h2>
   <p>Use the url below to reset your password</p>
   <p>the given link is valid for only 30 minutes.</p>
   <a href = ${resetUrl} clicktracking = off>${resetUrl}</a>`;


  const subject = "forgot password link";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({
      success: true,
      message: "reset email sent",
    });
  } catch (error) {
    res.status(500);
    throw new Error("email not sent, please try again");
  }

  res.send("forgot password");
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest('hex');

  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: {$gt: Date.now()}
  })
  if(!userToken){
    res.status();
    throw new Error('invalid or expired token');
  }

  const user = await User.findOne({_id: userToken.userId})
  user.password = password;
  await user.save();
  res.status(200).json({
    message: "password reset successful, please login"
  })
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
