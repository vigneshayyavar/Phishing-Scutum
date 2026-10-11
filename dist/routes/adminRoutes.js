import { Router } from 'express';
import { auth, admin } from '../middleware/auth.js';
import { metrics, allScans } from '../services/storage.js';
const r = Router();
r.use(auth, admin);
r.get('/admin/dashboard', async (req, res) => { const stats = await metrics(); const scans = await allScans(); const riskMix = { LOW: scans.filter((s) => s.riskLevel === 'LOW').length, MEDIUM: scans.filter((s) => s.riskLevel === 'MEDIUM').length, HIGH: scans.filter((s) => s.riskLevel === 'HIGH').length, CRITICAL: scans.filter((s) => s.riskLevel === 'CRITICAL').length }; const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); return { day: key, scans: scans.filter((s) => new Date(s.createdAt).toDateString() === d.toDateString()).length }; }); res.json({ stats, riskMix, chart: days }); });
export default r;
