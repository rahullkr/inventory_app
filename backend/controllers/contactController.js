const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const contactUs = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const user = await User.findById(req.user._id);
  //  console.log(subject, message);
  if (!user) {
    res.status(400);
    throw new Error("user not found, please signup");
  }

  if (!subject || !message) {
    res.status(400);
    throw new Error("please add subject and message");
  }

  const send_to = process.env.EMAIL_USER;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = user.emal;

  try {
    await sendEmail(subject, message, send_to, sent_from, reply_to);
    res.status(200).json({
      success: true,
      message: " email sent",
    });
  } catch (error) {
    res.status(500);
    throw new Error("email not sent, please try again");
  }
});

module.exports = {
  contactUs,
};
