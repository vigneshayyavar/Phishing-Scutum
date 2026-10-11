import mongoose, { Schema } from 'mongoose';
const schema = new Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true }, passwordHash: { type: String, required: true }, role: { type: String, enum: ['user', 'admin'], default: 'user' }, subscription: { type: String, default: 'free' } }, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.model('User', schema);
