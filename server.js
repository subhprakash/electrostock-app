// server.js

// 1. IMPORT PACKAGES
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// NEW: Authentication packages
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
app.use(express.urlencoded({ extended: false })); // Needed for passport

// NEW: Session Middleware Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_random_secret_string', // Use an environment variable for this in production!
    resave: false,
    saveUninitialized: false,
}));

// NEW: Passport Middleware Setup
app.use(passport.initialize());
app.use(passport.session());

// 4. CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// 5. DEFINE DATA MODELS (User and Item)
// --- NEW: User Schema and Model ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// --- Item Schema and Model (from before) ---
const itemSchema = new mongoose.Schema({ /* ... your item schema ... */ });
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
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// 7. DEFINE ROUTES
// --- NEW: Authentication Middleware ---
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
}

// --- NEW: Auth Routes ---
app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
    // If this function gets called, authentication was successful.
    res.json({ message: 'Logged in successfully', user: req.user.username });
});

app.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.json({ message: 'Logged out successfully' });
    });
});

// --- SECURE your existing API routes ---
// Now, all your item routes will require a user to be logged in.
app.get('/api/items', isAuthenticated, async (req, res) => { /* ... your get items logic ... */ });
app.post('/api/items', isAuthenticated, async (req, res) => { /* ... your add item logic ... */ });
app.put('/api/items/:id', isAuthenticated, async (req, res) => { /* ... your update item logic ... */ });
app.delete('/api/items/:id', isAuthenticated, async (req, res) => { /* ... your delete item logic ... */ });


// 8. START THE SERVER
app.listen(PORT, () => {
    console.log(`⚡ Server running on http://localhost:${PORT}`);
});