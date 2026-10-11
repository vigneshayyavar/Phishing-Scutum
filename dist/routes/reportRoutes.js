import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth.js';
import { saveReport, getReports } from '../services/storage.js';
const r = Router();
r.use(auth);
r.post('/reports', async (req, res) => { try {
    const b = z.object({ company: z.string().min(2), reason: z.string().min(2), description: z.string().max(5000).default(''), url: z.string().max(2000).optional().or(z.literal('')) }).parse(req.body);
    const report = await saveReport({ ...b, userId: req.user.id, status: 'Received' });
    res.json({ report });
}
catch {
    res.status(400).json({ message: 'Invalid report details' });
} });
r.get('/reports/my', async (req, res) => res.json({ reports: await getReports(req.user.id) }));
export default r;
