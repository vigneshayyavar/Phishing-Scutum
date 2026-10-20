import mongoose, { Schema } from 'mongoose';
const schema = new Schema({ name: String, domain: { type: String, unique: true }, website: String, verificationStatus: String, emailDomains: [String], riskSignals: [String] }, { timestamps: true });
export default mongoose.model('Company', schema);
