const mongoose = require('mongoose');


module.exports = async function connectDB() {
const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI not set');
mongoose.set('strictQuery', true);
await mongoose.connect(uri, { dbName: 'electrostock' });
console.log('✅ MongoDB connected');
};