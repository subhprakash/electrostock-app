// src/controllers/itemsController.js
const Item = require("../models/Item");

// Get all items
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new item
exports.addItem = async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    const newItem = new Item({ name, quantity, price });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update stock (quantity or price)
exports.updateItem = async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
