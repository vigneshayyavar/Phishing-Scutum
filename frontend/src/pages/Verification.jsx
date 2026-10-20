import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../api';
import { Search, CheckCircle2, AlertTriangle, Globe2 } from 'lucide-react';
export default function Verification() { const [domain, setDomain] = useState(''); const [data, setData] = useState(null); const [busy, setBusy] = useState(false); const check = async () => { setBusy(true); try {
    const r = await api.get(`/companies/${encodeURIComponent(domain)}`);
    setData(r.data.company);
}
catch (e) {
    setData({ name: domain, verified: false, status: 'No verification record found', domain });
}
finally {
    setBusy(false);
} }; return _jsxs(_Fragment, { children: [_jsx("div", { className: "page-head", children: _jsxs("div", { children: [_jsx("div", { className: "section-kicker", children: "Company intelligence" }), _jsx("h1", { children: "Verify before you trust." }), _jsx("p", { children: "Check a recruiter or company domain against your verification records." })] }) }), _jsxs("section", { className: "panel verify-hero", children: [_jsxs("div", { className: "verify-search", children: [_jsx(Globe2, {}), _jsx("input", { value: domain, onChange: e => setDomain(e.target.value), onKeyDown: e => e.key === 'Enter' && check(), placeholder: "company.com" }), _jsx("button", { className: "btn primary", onClick: check, disabled: !domain || busy, children: busy ? 'Checking…' : _jsxs(_Fragment, { children: [_jsx(Search, { size: 17 }), " Verify"] }) })] }), _jsxs("div", { className: "verify-note", children: [_jsx(AlertTriangle, { size: 16 }), " A missing record is not proof of fraud. Use official company channels for final verification."] })] }), data && _jsxs("section", { className: "panel verification-result", children: [_jsxs("div", { className: `verification-status ${data.verified ? 'verified' : 'unknown'}`, children: [data.verified ? _jsx(CheckCircle2, {}) : _jsx(AlertTriangle, {}), _jsxs("div", { children: [_jsx("b", { children: data.verified ? 'Verified company record' : 'Verification incomplete' }), _jsx("span", { children: data.status })] })] }), _jsxs("div", { className: "company-data", children: [_jsxs("div", { children: [_jsx("span", { children: "Company" }), _jsx("b", { children: data.name })] }), _jsxs("div", { children: [_jsx("span", { children: "Domain" }), _jsx("b", { children: data.domain })] }), _jsxs("div", { children: [_jsx("span", { children: "Website" }), _jsx("b", { children: data.website || 'Not available' })] })] })] })] }); }
