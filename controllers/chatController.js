const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

exports.chat_navigator_post = asyncHandler(async (req, res, next) => {
  if (req.user) {
    console.log(req.body.user);
    const recipient = await User.findById(req.body.user).exec();

    if (recipient !== null) {
      if (
        recipient.friends.includes(req.user._id) &&
        req.user.friends.includes(req.body.user)
      ) {
        // Users are friends.
        const chat = await Chat.findOne({
          users: { $in: [req.user._id, req.body.user] },
        });
        if (chat === null) {
          // Chat does not exist. Create new chat.
          const new_chat = new Chat({
            users: [req.body.user, req.user._id],
          });

          const result = await new_chat.save();
          res.redirect(result.url);
        } else {
          res.redirect(chat.url);
        }
      }
      //   Users are not friends. Throw error.
      throw new Error("Users need to be friends before starting a chat");
    }
    // User does not exist. Throw error.
    throw new Error("User does not exist");
  } else {
    res.redirect("/log-in");
  }
});

exports.chat_get = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      const chats = await Chat.find({ users: req.user })
        .populate("users")
        .exec();
      const friends = await User.find({
        _id: { $in: req.user.friends },
        friends: req.user._id,
      }).exec();
      const chat = await Chat.findById(req.params.id).exec();

      let userChats = [];
      let rec_id;
      let rec;

      chats.forEach((chat) => {
        chat.users.forEach((user) => {
          if (!req.user._id.equals(user._id)) {
            let data = {
              url: chat.url,
              user: user,
            };
            userChats.push(data);
            return;
          }
        });
      });

      if (chat !== null) {
        const messages = await Message.find({ chat: chat._id })
          .populate("author")
          .exec();

        chat.users.forEach((user_id) => {
          if (!req.user._id.equals(user_id)) {
            rec_id = user_id;
          }
        });

        rec = await User.findById(rec_id);

        if (chat.users.includes(req.user._id)) {
          res.render("chat", {
            user: req.user,
            chats: userChats,
            chat: chat,
            messages: messages,
            recipient: rec,
            friends: friends,
          });
          return;
        } else {
          // User is not a part of chat.
          return res.status(404).render("404");
        }
      } else {
        // No results.
        return res.status(404).render("404");
      }
    } else {
      // User is not logged in.
      res.redirect("/log-in");
    }
  } catch (err) {
    return next(err);
  }
});
