import mongoose,{Schema,Document} from 'mongoose';
export interface ICompany extends Document{name:string;domain:string;website:string;verificationStatus:string;emailDomains:string[];riskSignals:string[]}
const schema=new Schema<ICompany>({name:String,domain:{type:String,unique:true},website:String,verificationStatus:String,emailDomains:[String],riskSignals:[String]},{timestamps:true});export default mongoose.model<ICompany>('Company',schema);
