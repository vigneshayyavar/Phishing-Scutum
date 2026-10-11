import mongoose from 'mongoose';
export async function connectDB() { const uri = process.env.MONGODB_URI; if (!uri) {
    console.warn('MONGODB_URI not set — using in-memory prototype storage.');
    return false;
} try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('MongoDB connected');
    return true;
}
catch (e) {
    console.warn('MongoDB unavailable — using in-memory prototype storage.');
    return false;
} }
