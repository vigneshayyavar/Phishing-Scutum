import User from '../models/User.js';
import Scan from '../models/Scan.js';
import Report from '../models/Report.js';
let memoryUsers: any[] = [];
let memoryScans: any[] = [];
let memoryReports: any[] = [];
export function useMongo() { return !!(User.db?.readyState === 1); }
export async function findUser(email: string) { if (useMongo()) return User.findOne({ email }); return memoryUsers.find(u => u.email === email) || null; }
export async function saveUser(data: any) { if (useMongo()) return User.create(data); const u = { ...data, _id: crypto.randomUUID(), createdAt: new Date() }; memoryUsers.push(u); return u; }
export async function getUser(id: string) { if (useMongo()) return User.findById(id); return memoryUsers.find(u => u._id === id) || null; }
export async function saveScan(data: any) { if (useMongo()) return Scan.create(data); const s = { ...data, _id: crypto.randomUUID(), createdAt: new Date() }; memoryScans.unshift(s); return s; }
export async function saveScansBulk(data: any[]) { if (data.length === 0) return 0; if (useMongo()) { const docs = await Scan.insertMany(data, { ordered: false }); return docs.length; } const now = new Date(); const rows = data.map((d, i) => ({ ...d, _id: crypto.randomUUID(), createdAt: new Date(now.getTime() + i) })); memoryScans = [...rows.reverse(), ...memoryScans]; return rows.length; }
export async function getScans(userId: string) { if (useMongo()) return Scan.find({ userId }).sort({ createdAt: -1 }).limit(500); return memoryScans.filter(s => s.userId === userId).slice(0, 500); }
export async function getScan(id: string, userId: string) { if (useMongo()) return Scan.findOne({ _id: id, userId }); return memoryScans.find(s => s._id === id && s.userId === userId) || null; }
export async function deleteScan(id: string, userId: string) { if (useMongo()) return Scan.deleteOne({ _id: id, userId }); memoryScans = memoryScans.filter(s => !(s._id === id && s.userId === userId)); return { deletedCount: 1 }; }
export async function saveReport(data: any) { if (useMongo()) return Report.create(data); const r = { ...data, _id: crypto.randomUUID(), createdAt: new Date() }; memoryReports.unshift(r); return r; }
export async function getReports(userId: string) { if (useMongo()) return Report.find({ userId }).sort({ createdAt: -1 }).limit(500); return memoryReports.filter(r => r.userId === userId); }
export async function metrics() { if (useMongo()) { const [users, scans, reports, high] = await Promise.all([User.countDocuments(), Scan.countDocuments(), Report.countDocuments(), Scan.countDocuments({ riskScore: { $gte: 60 } })]); return { users, scans, reports, highRisk: high }; } return { users: memoryUsers.length, scans: memoryScans.length, reports: memoryReports.length, highRisk: memoryScans.filter(s => s.riskScore >= 60).length }; }
export async function allScans() { if (useMongo()) return Scan.find().limit(5000); return memoryScans.slice(0, 5000); }
