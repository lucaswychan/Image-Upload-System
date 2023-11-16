const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    // id: mongoose.Schema.Types.ObjectId,
    name: String,
    dimension: [Number]
});

const UserModel = mongoose.model("images", UserSchema);
module.exports = UserModel;