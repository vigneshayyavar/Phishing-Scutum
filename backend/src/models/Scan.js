import mongoose, { Schema } from 'mongoose';
const schema = new Schema({ userId: String, title: String, inputType: String, inputText: String, url: String, riskScore: Number, riskLevel: String, confidence: Number, categories: [String], reasons: [String], recommendations: [String], psychologicalTriggers: [Schema.Types.Mixed], verificationChecks: [String], signalBreakdown: [Schema.Types.Mixed], aiSummary: String, companyVerification: Schema.Types.Mixed, logoAnalysis: Schema.Types.Mixed }, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.model('Scan', schema);
