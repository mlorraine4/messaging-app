const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 15 },
  password: { type: String, required: true },
  display_name: { type: String, required: true, maxLength: 20 },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  timestamp: { type: Date, required: true },
});

// Export model
module.exports = mongoose.model("User", UserSchema);
