const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        // plan number
        plan: { type: Number, required: true, default: 0 },
    },
    { collection: "users", timestamps: true }
);

const User = mongoose.model("userSchema", userSchema);

module.exports = User;
