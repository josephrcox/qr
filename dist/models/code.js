const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema(
    {
        type: { type: String, required: true },
        redirect_url: { type: String, required: true },
        isDynamic: { type: Boolean, required: true },
        short_id: { type: String, required: true },
        name: { type: String, required: true },
        owner: { type: String, required: true },
        code: { type: String, required: false },
        visits: { type: Number, default: 0 },
        visitor_metadata: { type: Array, default: [] },
    },
    { collection: "codes", timestamps: true }
);

const Code = mongoose.model("codeSchema", codeSchema);

module.exports = Code;
