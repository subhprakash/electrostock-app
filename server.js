// 1. IMPORT PACKAGES
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// 2. SETUP THE APP
const app = express();
const PORT = process.env.PORT || 3000;

// 3. SETUP MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'a_random_secret_string',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// 4. CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// 5. DEFINE DATA MODELS
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// --- CORRECTED: Item Schema is now filled in ---
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { timestamps: true });
const Item = mongoose.model('Item', itemSchema);

// 6. CONFIGURE PASSPORT
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });
            if (!user) { return done(null, false, { message: 'Incorrect username.' }); }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) { return done(null, false, { message: 'Incorrect password.' }); }
            return done(null, user);
        } catch (err) { return done(err); }
    }
));
passport.serializeUser((user, done) => { done(null, user.id); });
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) { done(err); }
});

// 7. DEFINE ROUTES
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.status(401).json({ message: 'Unauthorized' });
}

// --- Auth Routes ---
app.post('/api/register', async (req, res) => { /* ... registration logic from before ... */ });
app.post('/api/login', passport.authenticate('local'), (req, res) => { res.json({ message: 'Logged in successfully' }); });
app.get('/api/logout', (req, res, next) => { /* ... logout logic from before ... */ });

// --- CORRECTED: All Item API routes are now implemented ---

// GET ALL ITEMS (with Search and Filter)
app.get('/api/items', isAuthenticated, async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [{ name: searchRegex }, { category: searchRegex }];
    }
    if (category) { filter.category = category; }
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) { res.status(500).json({ message: 'Error fetching items' }); }
});

// ADD A NEW ITEM
app.post('/api/items', isAuthenticated, async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const newItem = new Item({ name, category, price, quantity });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) { res.status(500).json({ message: 'Error adding item' }); }
});

// UPDATE AN ITEM
app.put('/api/items/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name, category, price, quantity },
      { new: true }
    );
    if (!updatedItem) { return res.status(404).json({ message: 'Item not found' }); }
    res.json(updatedItem);
  } catch (error) { res.status(500).json({ message: 'Error updating item' }); }
});

// DELETE AN ITEM
app.delete('/api/items/:id', isAuthenticated, async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) { return res.status(404).json({ message: 'Item not found' }); }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Error deleting item' }); }
});


// 8. START THE SERVER
app.listen(PORT, () => {
    console.log(`⚡ Server running on http://localhost:${PORT}`);
});