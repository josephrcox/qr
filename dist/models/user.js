const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        googleUID: { type: String, required: true },
        plan: { type: Number, required: true, default: 0 },
        lastLogin: { type: Date, required: true, default: Date.now },
        dynamicCodeCount: { type: Number, required: true, default: 0 },
    },
    { collection: "users", timestamps: true }
);

const User = mongoose.model("userSchema", userSchema);

module.exports = User;
