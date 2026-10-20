import jwt from 'jsonwebtoken';
const secret = () => process.env.JWT_SECRET || 'Phishing Scutum-development-secret-change-me';
export function signToken(user) { return jwt.sign(user, secret(), { expiresIn: '7d' }); }
export function auth(req, res, next) { const h = req.headers.authorization; if (!h?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Authentication required' }); try {
    req.user = jwt.verify(h.slice(7), secret());
    next();
}
catch {
    return res.status(401).json({ message: 'Invalid or expired session' });
} }
export function admin(req, res, next) { if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' }); next(); }
