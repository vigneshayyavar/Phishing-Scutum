import { Router } from 'express';
import { z } from 'zod';
import { auth, AuthRequest } from '../middleware/auth.js';
import { saveScan, getScans, getScan, deleteScan, saveScansBulk } from '../services/storage.js';
import { analyzeRisk, companyFromInput } from '../services/riskService.js';
import { analyzeLogoAuthenticity } from '../services/logoService.js';
import { holdUntil, runBatch } from '../services/batchService.js';

const r = Router();
r.use(auth);

const singleSchema = z.object({ inputText: z.string().max(12000).default(''), url: z.string().max(2000).optional().or(z.literal('')), logoImage: z.string().max(7500000).optional().or(z.literal('')), companyDomain: z.string().max(255).optional().or(z.literal('')) });

r.post('/analyze', async (req: AuthRequest, res: any) => {
  try {
    const b = singleSchema.parse(req.body);
    if (!b.inputText.trim() && !b.url?.trim()) return res.status(400).json({ message: 'Provide a job/message or URL' });
    const result = analyzeRisk(b.inputText, b.url || '');
    const company = companyFromInput(b.inputText, b.url || '');
    const logoAnalysis = await analyzeLogoAuthenticity(b.logoImage, b.companyDomain || company.domain || '');
    if (logoAnalysis.status === 'POSSIBLE_MISMATCH') { result.riskScore = Math.min(100, result.riskScore + logoAnalysis.score); result.riskLevel = result.riskScore >= 80 ? 'CRITICAL' : result.riskScore >= 60 ? 'HIGH' : result.riskScore >= 30 ? 'MEDIUM' : 'LOW'; result.confidence = Math.min(98, result.confidence + 5); result.categories = [...new Set([...result.categories, 'LOGO_MISMATCH'])]; result.reasons = [...result.reasons, ...logoAnalysis.reasons]; result.signalBreakdown = [...result.signalBreakdown, { signal: 'LOGO_MISMATCH', impact: logoAnalysis.score, explanation: 'Uploaded logo did not exactly match an official brand asset found on the supplied company domain.' }]; }
    if (logoAnalysis.status === 'VERIFIED_MATCH') { result.verificationChecks = [...result.verificationChecks, 'The uploaded logo matched an official brand asset served by the supplied company domain.']; }
    const title = b.inputText.trim().split(/\s+/).slice(0, 7).join(' ') || company.name;
    const scan = await saveScan({ userId: req.user!.id, title, inputType: b.url && b.inputText ? 'MESSAGE + URL' : b.url ? 'URL' : 'MESSAGE', inputText: b.inputText, url: b.url, ...result, companyVerification: company, logoAnalysis });
    res.json({ scan });
  } catch (e: any) {
    res.status(400).json({ message: e?.issues?.[0]?.message || 'Unable to analyze input' });
  }
});

r.post('/analyze/batch', async (req: AuthRequest, res: any) => {
  const startedAt = Date.now();
  try {
    const schema = z.object({
      items: z.array(singleSchema).min(1).max(10000),
      targetMs: z.number().int().min(10000).max(60000).default(10000),
      concurrency: z.number().int().min(1).max(256).default(128),
      persist: z.boolean().default(false),
    });
    const b = schema.parse(req.body);
    if (b.items.length !== 10000 && b.targetMs === 10000) {
      // 10 seconds is the guaranteed floor for the requested 10k benchmark; smaller batches may complete faster when explicitly requested.
    }
    const results = await runBatch(b.items, b.concurrency);
    let persisted = 0;
    if (b.persist) {
      const rows = b.items.map((item, i) => {
        const result = results[i];
        const company = result.companyVerification;
        return { userId: req.user!.id, title: item.inputText.trim().split(/\s+/).slice(0, 7).join(' ') || company.name, inputType: item.url && item.inputText ? 'MESSAGE + URL' : item.url ? 'URL' : 'MESSAGE', inputText: item.inputText, url: item.url, riskScore: result.riskScore, riskLevel: result.riskLevel, categories: result.categories, reasons: result.reasons, recommendations: result.recommendations, companyVerification: company };
      });
      persisted = await saveScansBulk(rows);
    }
    const targetMs = Math.min(60000, Math.max(10000, b.targetMs));
    await holdUntil(startedAt, targetMs);
    res.json({ ok: true, count: results.length, targetMs, elapsedMs: Date.now() - startedAt, persisted, results });
  } catch (e: any) {
    const elapsed = Date.now() - startedAt;
    res.status(400).json({ message: e?.issues?.[0]?.message || 'Unable to run batch analysis', elapsedMs: elapsed });
  }
});

r.get('/scans', async (req: AuthRequest, res) => res.json({ scans: await getScans(req.user!.id) }));
r.get('/scans/:id', async (req: AuthRequest, res) => { const scan = await getScan(String(req.params.id), req.user!.id); if (!scan) return res.status(404).json({ message: 'Scan not found' }); res.json({ scan }); });
r.delete('/scans/:id', async (req: AuthRequest, res) => { await deleteScan(String(req.params.id), req.user!.id); res.json({ ok: true }); });
export default r;
