import mongoose, { Schema } from 'mongoose';
const schema = new Schema({ userId: String, company: String, url: String, reason: String, description: String, status: { type: String, default: 'Received' } }, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.model('Report', schema);
