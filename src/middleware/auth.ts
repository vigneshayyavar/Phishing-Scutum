import {Request,Response,NextFunction} from 'express';import jwt from 'jsonwebtoken';
export interface AuthRequest extends Request{user?:{id:string;role:string;name?:string;email?:string}}
const secret=()=>process.env.JWT_SECRET||'Phishing Scutum-development-secret-change-me';
export function signToken(user:{id:string;role:string;name?:string;email?:string}){return jwt.sign(user,secret(),{expiresIn:'7d'})}
export function auth(req:AuthRequest,res:Response,next:NextFunction){const h=req.headers.authorization;if(!h?.startsWith('Bearer '))return res.status(401).json({message:'Authentication required'});try{req.user=jwt.verify(h.slice(7),secret()) as AuthRequest['user'];next()}catch{return res.status(401).json({message:'Invalid or expired session'})}}
export function admin(req:AuthRequest,res:Response,next:NextFunction){if(req.user?.role!=='admin')return res.status(403).json({message:'Admin access required'});next()}
