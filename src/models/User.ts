import mongoose,{Schema,Document} from 'mongoose';
export interface IUser extends Document{name:string;email:string;passwordHash:string;role:'user'|'admin';subscription:string;createdAt:Date}
const schema=new Schema<IUser>({name:{type:String,required:true},email:{type:String,required:true,unique:true},passwordHash:{type:String,required:true},role:{type:String,enum:['user','admin'],default:'user'},subscription:{type:String,default:'free'}},{timestamps:{createdAt:true,updatedAt:false}});
export default mongoose.model<IUser>('User',schema);
