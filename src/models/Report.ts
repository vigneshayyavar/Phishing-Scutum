import mongoose,{Schema,Document} from 'mongoose';
export interface IReport extends Document{userId:string;company:string;url?:string;reason:string;description:string;status:string;createdAt:Date}
const schema=new Schema<IReport>({userId:String,company:String,url:String,reason:String,description:String,status:{type:String,default:'Received'}},{timestamps:{createdAt:true,updatedAt:false}});
export default mongoose.model<IReport>('Report',schema);
