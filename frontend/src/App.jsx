import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate, } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, ScanSearch, History, Flag, Building2, CreditCard, LogOut, Menu, X, ChevronRight, LockKeyhole, } from 'lucide-react';
import { api } from './api';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import HistoryPage from './pages/HistoryPage';
import Reports from './pages/Reports';
import Verification from './pages/Verification';
import Subscription from './pages/Subscription';
import Admin from './pages/Admin';
import BatchLab from './pages/BatchLab';
const nav = [
    ['/dashboard', 'Dashboard', LayoutDashboard],
    ['/analyze', 'Analyze', ScanSearch],
    ['/history', 'History', History],
    ['/reports', 'Reports', Flag],
    ['/verification', 'Verification', Building2],
    ['/subscription', 'Subscription', CreditCard],
    ['/batch', 'Batch Lab', ScanSearch],
];
function Shell() {
    const loc = useLocation();
    const navg = useNavigate();
    const [open, setOpen] = useState(false);
    const [me, setMe] = useState(null);
    useEffect(() => {
        api
            .get('/auth/me')
            .then((r) => setMe(r.data.user))
            .catch(() => navg('/login'));
    }, [navg]);
    const logout = () => {
        localStorage.removeItem('Phishing Scutum_token');
        navg('/login');
    };
    if (!me) {
        return (_jsxs("div", { className: "boot", children: [_jsx(ShieldCheck, {}), _jsx("span", { children: "Securing your workspace\u2026" })] }));
    }
    return (_jsxs("div", { className: "app", children: [_jsxs("aside", { className: open ? 'sidebar open' : 'sidebar', children: [_jsxs("div", { className: "brand", children: [_jsx("div", { className: "logo", children: _jsx(ShieldCheck, { size: 22 }) }), _jsxs("div", { children: [_jsx("b", { children: "Phishing Scutum" }), _jsx("span", { children: "Job safety intelligence" })] }), _jsx("button", { className: "mobile-close", onClick: () => setOpen(false), "aria-label": "Close navigation", children: _jsx(X, {}) })] }), _jsxs("nav", { children: [nav.map(([p, l, I]) => (_jsxs(Link, { onClick: () => setOpen(false), className: loc.pathname === p ? 'active' : '', to: p, children: [_jsx(I, { size: 18 }), _jsx("span", { children: l })] }, p))), me.role === 'admin' && (_jsxs(Link, { className: loc.pathname.startsWith('/admin') ? 'active' : '', to: "/admin", onClick: () => setOpen(false), children: [_jsx(LayoutDashboard, { size: 18 }), _jsx("span", { children: "Admin" })] }))] }), _jsxs("div", { className: "side-bottom", children: [_jsxs("div", { className: "trust", children: [_jsx(LockKeyhole, { size: 16 }), _jsxs("div", { children: [_jsx("b", { children: "Private by design" }), _jsx("span", { children: "Your scans stay in your account." })] })] }), _jsxs("button", { className: "profile", onClick: logout, children: [_jsx("div", { className: "avatar", children: me.name?.[0]?.toUpperCase() || 'U' }), _jsxs("div", { children: [_jsx("b", { children: me.name }), _jsx("span", { children: me.email })] }), _jsx(LogOut, { size: 16 })] })] })] }), _jsxs("main", { className: "main", children: [_jsxs("header", { children: [_jsx("button", { className: "menu", onClick: () => setOpen(true), "aria-label": "Open navigation", children: _jsx(Menu, {}) }), _jsxs("div", { className: "crumb", children: [_jsx("span", { children: "Workspace" }), _jsx(ChevronRight, { size: 14 }), _jsx("b", { children: loc.pathname.slice(1) || 'dashboard' })] }), _jsx("div", { className: "top-actions", children: _jsx(Link, { className: "analyze-top", to: "/analyze", children: "+ New scan" }) })] }), _jsx("div", { className: "content", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/analyze", element: _jsx(Analyze, {}) }), _jsx(Route, { path: "/history", element: _jsx(HistoryPage, {}) }), _jsx(Route, { path: "/reports", element: _jsx(Reports, {}) }), _jsx(Route, { path: "/verification", element: _jsx(Verification, {}) }), _jsx(Route, { path: "/subscription", element: _jsx(Subscription, {}) }), _jsx(Route, { path: "/batch", element: _jsx(BatchLab, {}) }), _jsx(Route, { path: "/admin", element: _jsx(Admin, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }) })] })] }));
}
function App() {
    const [token, setToken] = useState(localStorage.getItem('Phishing Scutum_token'));
    useEffect(() => {
        const f = () => setToken(localStorage.getItem('Phishing Scutum_token'));
        window.addEventListener('storage', f);
        return () => window.removeEventListener('storage', f);
    }, []);
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: token ? (_jsx(Navigate, { to: "/dashboard", replace: true })) : (_jsx(Landing, {})) }), _jsx(Route, { path: "/login", element: _jsx(Login, { onLogin: () => setToken(localStorage.getItem('Phishing Scutum_token')) }) }), _jsx(Route, { path: "/*", element: token ? _jsx(Shell, {}) : _jsx(Navigate, { to: "/login", replace: true }) })] }));
}
export default App;
