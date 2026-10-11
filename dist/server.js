import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '3mb' }));
app.get('/api/health', (_, res) => res.json({ ok: true, service: 'Phishing Scutum-api', version: '2.0.0', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api', scanRoutes);
app.use('/api', reportRoutes);
app.use('/api', companyRoutes);
app.use('/api', adminRoutes);
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: 'Internal server error' }); });
const port = Number(process.env.PORT || 5000);
connectDB().finally(() => app.listen(port, () => console.log(`Phishing Scutum API running on http://localhost:${port}`)));
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
};
app.use(errorHandler);
app.get('/api/health', (_, res) => res.json({
    ok: true,
    service: 'Phishing Scutum-api',
    version: '2.0.0',
    time: new Date().toISOString()
}));
