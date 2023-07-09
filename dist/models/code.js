const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema(
    {
        redirect_url: { type: String, required: true },
        code: { type: String, required: false },
        name: { type: String, required: true },
        owner: { type: String, required: true },
        visits: { type: Number, default: 0 },
        visitor_metadata: { type: Array, default: [] },
    },
    { collection: "codes", timestamps: true }
);

const Code = mongoose.model("codeSchema", codeSchema);

module.exports = Code;
