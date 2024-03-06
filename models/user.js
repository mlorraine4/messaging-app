const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 15 },
  password: { type: String, required: true },
  display_name: { type: String, required: true, maxLength: 20 },
  photo_url: { type: String },
  profile_info: { type: String },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

// Virtual for author's URL
UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/strife/profile/${this._id}`;
});

// Export model
module.exports = mongoose.model("User", UserSchema);