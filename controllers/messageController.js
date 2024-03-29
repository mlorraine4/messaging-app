const asyncHandler = require("express-async-handler");
const Message = require("../models/message");

exports.send_message_post = asyncHandler(async (req, res, next) => {
  if (req.user) {
    // User is logged in.

    const message = new Message({
      chat: req.body.chat,
      author: req.user._id,
      text: req.body.text,
      timestamp: req.body.timestamp,
    });

    await message.save();
    return res.sendStatus(200);
  } else {
    // User not logged in.
    res
      .status(401)
      .send("User needs to be authorized before sending a message.");
  }
});
