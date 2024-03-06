// import controllers

var express = require("express");
var router = express.Router();

const chatController = require("../controllers/chatController");
const userController = require("../controllers/userController");
const messageController = require("../controllers/messageController");

router.get("/", userController.homepage_get);
router.get("/friends", userController.friend_list_get);
router.get("/add-friend", userController.friend_form_get);
router.post("/add-friend", userController.friend_form_post);

router.get("/friends-pending", userController.friend_list_pending_get);
// Get request for list of all friend requests.
router.get("/friend-requests", userController.friend_request_list_get);
// Post request for accepting a friend request.
router.post("/friend-requests/:id", userController.friend_request_post);

router.get("/log-in", userController.log_in_get);
router.post("/log-in", userController.log_in_post);
router.get("/log-out", userController.log_out_get);
router.get("/sign-up", userController.sign_up_get);
router.post("/sign-up", userController.sign_up_post);
router.get('/404', userController.not_found);

router.post("/get-chat", chatController.chat_navigator_post);
router.get("/chat/:id", chatController.chat_get);

router.post("/send-message", messageController.send_message_post);

module.exports = router;
