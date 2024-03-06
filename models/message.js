const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxLength: 150 },
  file: { type: String },
  timestamp: { type: Date, required: true },
});

// Export model
module.exports = mongoose.model("Message", MessageSchema);