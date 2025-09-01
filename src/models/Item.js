const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Prevents "Cannot overwrite model" error
module.exports = mongoose.models.Item || mongoose.model("Item", ItemSchema);
