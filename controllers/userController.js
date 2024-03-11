const passport = require("passport");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Chat = require("../models/chat");
const bcrypt = require("bcryptjs");

// GET request for log in form.
exports.homepage_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.redirect("/strife/log-in");
  } else {
    const user = await User.findById(req.user._id).exec();
    const chats = await Chat.find({ users: req.user }).populate("users").exec();
    const friends = await User.find({
      _id: { $in: req.user.friends },
      friends: req.user._id,
    }).exec();
    let userChats = [];

    // list of recipients in each user chat
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

    res.render("index", { user: user, chats: userChats, friends: friends });
    return;
  }
});

exports.friend_list_get = asyncHandler(async (req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  if (!req.session.passport) {
    res.redirect("/strife/log-in");
  } else {
    // Get friend list
    // Get friends who are online
    const user = await User.findById(req.session.passport.user).exec();
    const friends = await User.find({
      _id: { $in: req.user.friends },
      friends: req.user._id,
    }).exec();
    const chats = await Chat.find({ users: req.user }).populate("users").exec();
    let userChats = [];

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

    res.render("friend-list", {
      user: req.user,
      friends: friends,
      chats: userChats,
    });
    return;
  }
});

exports.friend_form_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.redirect("/strife/log-in");
  } else {
    // Get friend list
    // Get friends who are online
    const chats = await Chat.find({ users: req.user }).populate("users").exec();
    const friends = await User.find({
      _id: { $in: req.user.friends },
      friends: req.user._id,
    }).exec();
    let userChats = [];

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
    res.render("friend-form", {
      user: req.user,
      chats: userChats,
      friends: friends,
    });
    return;
  }
});

// all users who have sent a request, that you haven't added:
// db.users.find({'_id':{'$nin': my_friend_ids, 'friend_ids': my_id}})
// all friends
// // db.users.find({'_id':{'$in': my_friend_ids, 'friend_ids': my_id}})

exports.friend_form_post = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.redirect("/strife/log-in");
  } else {
    const friends = await User.find({
      _id: { $in: req.user.friends },
      friends: req.user._id,
    }).exec();
    const user = await User.findById(req.user._id).exec();
    const user_query = await User.findOne({
      username: req.body.username,
    })
      .populate("friends")
      .exec();

    if (user_query !== null) {
      // User found. Check status of friendship.

      const user_status = user.friends.some((friend) => {
        return friend.equals(user_query._id);
      });
      const user_query_status = user_query.friends.some((friend) => {
        return friend.equals(req.user._id);
      });

      if (user_status && user_query_status) {
        // FRIENDS: Both users are friends with each other.
        const chats = await Chat.find({ users: req.user })
          .populate("users")
          .exec();
        let userChats = [];

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

        res.render("friend-form", {
          user: req.user,
          username: req.body.username,
          errors: [{ msg: "Error: You are already friends with user." }],
          chats: userChats,
          friends: friends,
        });
        return;
      } else if (user_status && !user_query_status) {
        // PENDING: Current user has sent friend request, but queried user has not added current user.
        const chats = await Chat.find({ users: req.user })
          .populate("users")
          .exec();
        let userChats = [];

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

        res.render("friend-form", {
          user: req.user,
          username: req.body.username,
          errors: [{ msg: "Error: Friend request is already pending." }],
          chats: userChats,
          friends: friends,
        });
      } else if (!user_status && user_query_status) {
        // REQUESTS: Queried user has sent current user a request, current user has not added them back.
        // Add user, redirect to friend list.
        user.friends.push(user_query._id);
        await user.save();
        res.redirect("/strife/friends");
      } else {
        // Neither users have sent friend requests.
        // Add user, redirect to pending requests.
        user.friends.push(user_query._id);
        await user.save();
        res.redirect("/strife/friends-pending");
      }
    } else {
      // No results.
      const chats = await Chat.find({ users: req.user })
        .populate("users")
        .exec();
      let userChats = [];

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

      res.render("friend-form", {
        user: req.user,
        username: req.body.username,
        errors: [{ msg: "User not found with that username." }],
        chats: userChats,
        friends: friends,
      });
      return;
    }
  }
});

exports.friend_request_list_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    const requestList = await User.find({
      _id: { $nin: req.user.friends },
      friends: req.user._id,
    });
    const chats = await Chat.find({ users: req.user }).populate("users").exec();
    const friends = await User.find({
      _id: { $in: req.user.friends },
      friends: req.user._id,
    }).exec();
    let userChats = [];

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

    res.render("friend-request-list", {
      user: req.user,
      requestList: requestList,
      chats: userChats,
      friends: friends,
    });
    return;
  } else {
    res.redirect("/strife/log-in");
  }
});

exports.friend_request_post = asyncHandler(async (req, res, next) => {
  if (req.user) {
    const user = await User.findById(req.user._id).exec();
    const queried_user = await User.findById(req.params.id).exec();
    if (queried_user) {
      if (req.user.friends.includes(req.params.id)) {
        // Users are already friends.
      } else {
        // Add friend to user friend list.
        user.friends.push(queried_user);
        await user.save();
        res.redirect("/strife/friends");
      }
    }
  } else {
    res.status(404).send("User not found.");
  }
});

exports.friend_list_pending_get = asyncHandler(async (req, res, next) => {
  try {
    if (req.user) {
      const friends = await User.find({
        _id: { $in: req.user.friends },
        friends: req.user._id,
      }).exec();
      const pendingList = await User.find({
        _id: { $in: req.user.friends },
        friends: { $ne: req.user._id },
      }).exec();
      const chats = await Chat.find({ users: req.user })
        .populate("users")
        .exec();
      let userChats = [];

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

      res.render("friend-pending-list", {
        user: req.user,
        pendingList: pendingList,
        chats: userChats,
        friends: friends,
      });
    } else {
      res.redirect("/strife/log-in");
    }
  } catch (err) {
    return next(err);
  }
});

// GET request for log in form.
exports.log_in_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.render("log-in");
  } else {
    res.redirect("/");
  }
});

// POST request for log in form submission.
exports.log_in_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/strife/log-in",
});

// GET request for user log out (no POST, log out is handled by express middleware)
exports.log_out_get = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/strife/log-in");
  });
});

exports.sign_up_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.render("sign-up");
  } else {
    res.redirect("/");
  }
});

exports.sign_up_post = asyncHandler(async (req, res, next) => {
  try {
    const userExists = await User.findOne({ username: req.body.username });

    if (userExists === null) {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          display_name: req.body.display_name,
          friends: [],
          timestamp: Date.now(),
        });
        const result = await user.save();
        res.redirect("/strife/log-in");
      });
    } else {
      res.render("sign-up", {
        errors: [{ msg: "Username is already taken." }],
        user: {
          username: req.body.username,
          display_name: req.body.display_name,
        },
      });
    }
  } catch (err) {
    return next(err);
  }
});
