import { Router } from 'express';
import Company from '../models/Company.js';
import { auth } from '../middleware/auth.js';
const r = Router();
r.use(auth);
r.get('/companies/:domain', async (req, res) => { const domain = req.params.domain.toLowerCase().replace(/^www\./, ''); if (Company.db.readyState === 1) {
    const c = await Company.findOne({ domain });
    if (c)
        return res.json({ company: { name: c.name, domain: c.domain, website: c.website, verified: c.verificationStatus === 'VERIFIED', status: c.verificationStatus } });
} res.json({ company: { name: domain.split('.')[0].replace(/[-_]/g, ' '), domain, website: `https://${domain}`, verified: false, status: 'No verification record found' } }); });
export default r;
