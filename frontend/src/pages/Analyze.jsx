import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanSearch, Link2, MessageSquareText, ArrowRight, LoaderCircle, ShieldCheck, AlertTriangle, BrainCircuit, CheckCircle2, ImagePlus, Building2, BadgeCheck, TriangleAlert, } from 'lucide-react';
import { analyze } from '../api';
export default function Analyze() {
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [companyDomain, setCompanyDomain] = useState('');
    const [logoImage, setLogoImage] = useState('');
    const [logoName, setLogoName] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const nav = useNavigate();
    const handleLogo = (file) => {
        if (!file)
            return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Logo image must be 5 MB or smaller.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setLogoImage(String(reader.result));
            setLogoName(file.name);
        };
        reader.readAsDataURL(file);
    };
    const submit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !url.trim())
            return;
        setBusy(true);
        setResult(null);
        try {
            const r = await analyze({
                inputText: text,
                url,
                logoImage,
                companyDomain,
            });
            setResult(r.scan);
        }
        catch (e) {
            alert(e?.response?.data?.message || 'Analysis failed');
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { children: [_jsx("div", { className: "page-head", children: _jsxs("div", { children: [_jsx("div", { className: "section-kicker", children: "Threat analysis" }), _jsx("h1", { children: "Analyze an opportunity." }), _jsx("p", { children: "Paste the message, application URL, or both. Phishing Scutum combines technical, recruiter, psychological and logo signals." })] }) }), _jsxs("div", { className: "analyze-grid", children: [_jsxs("form", { className: "panel analyze-form", onSubmit: submit, children: [_jsx("div", { className: "input-tabs", children: _jsxs("div", { className: "tab active", children: [_jsx(MessageSquareText, { size: 17 }), "Job / message"] }) }), _jsxs("label", { children: ["Job or recruiter message", _jsx("textarea", { value: text, onChange: (e) => setText(e.target.value), placeholder: 'Example:\n“Congratulations! You have been selected. Pay a ₹999 registration fee to complete onboarding…”', rows: 8 })] }), _jsxs("label", { children: ["Application URL ", _jsx("span", { className: "optional", children: "optional" }), _jsxs("div", { className: "url-input", children: [_jsx(Link2, { size: 17 }), _jsx("input", { value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://careers-example.com/apply" })] })] }), _jsxs("div", { className: "logo-upload", children: [_jsxs("div", { className: "logo-upload-head", children: [_jsxs("div", { children: [_jsxs("b", { children: [_jsx(Building2, { size: 15 }), "Company logo verification"] }), _jsx("span", { children: "Upload the logo shown in the job post, email, WhatsApp message or website screenshot." })] }), _jsx("span", { className: "logo-badge", children: "NEW" })] }), _jsxs("label", { className: "logo-file", children: [_jsx(ImagePlus, { size: 18 }), _jsx("span", { children: logoName || 'Choose logo image' }), _jsx("input", { type: "file", accept: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml", onChange: (e) => handleLogo(e.target.files?.[0]) })] }), _jsxs("label", { children: ["Official company website/domain", ' ', _jsx("span", { className: "optional", children: "recommended" }), _jsxs("div", { className: "url-input", children: [_jsx(Building2, { size: 17 }), _jsx("input", { value: companyDomain, onChange: (e) => setCompanyDomain(e.target.value), placeholder: "https://www.company.com" })] })] }), _jsxs("div", { className: "logo-note", children: [_jsx(ShieldCheck, { size: 15 }), "We compare the uploaded logo against brand/logo assets served by the supplied official domain. A mismatch is a warning signal, not proof by itself."] }), logoImage && (_jsxs("div", { className: "logo-preview", children: [_jsx("img", { src: logoImage, alt: "Uploaded company logo" }), _jsxs("div", { children: [_jsx("b", { children: "Logo ready for verification" }), _jsx("span", { children: logoName })] })] }))] }), _jsx("button", { className: "btn primary large full", disabled: busy, children: busy ? (_jsxs(_Fragment, { children: [_jsx(LoaderCircle, { className: "spin" }), "Running contextual analysis\u2026"] })) : (_jsxs(_Fragment, { children: ["Analyze now ", _jsx(ArrowRight, { size: 18 })] })) }), _jsxs("div", { className: "form-foot", children: [_jsx(ShieldCheck, { size: 16 }), "Your input is used to generate this assessment and save your scan history."] })] }), _jsxs("aside", { className: "panel side-info", children: [_jsx("div", { className: "mini-icon", children: _jsx(ScanSearch, {}) }), _jsx("h3", { children: "What we inspect" }), _jsx(Info, { title: "Language & psychology", text: "Urgency, payment requests, unrealistic promises, fear and desire-based manipulation." }), _jsx(Info, { title: "URL & domain", text: "Suspicious hostnames, insecure links and domain complexity." }), _jsx(Info, { title: "Recruiter behaviour", text: "Personal email, off-platform contact and identity-impersonation signals." }), _jsx(Info, { title: "Company logo", text: "Checks whether the uploaded logo exactly matches a logo/brand asset served by the supplied official company domain." }), _jsxs("div", { className: "notice", children: [_jsx(AlertTriangle, { size: 16 }), _jsx("span", { children: "Logo verification cannot prove authenticity from pixels alone. Always cross-check the official company website and recruiter identity." })] })] })] }), result && (_jsx(Result, { result: result, onHistory: () => nav('/history') }))] }));
}
function Info({ title, text }) {
    return (_jsxs("div", { className: "info", children: [_jsx("b", { children: title }), _jsx("p", { children: text })] }));
}
function Result({ result, onHistory, }) {
    const logo = result.logoAnalysis;
    return (_jsxs("section", { className: "panel result-panel", children: [_jsxs("div", { className: "result-top", children: [_jsxs("div", { children: [_jsx("div", { className: "section-kicker", children: "Analysis complete" }), _jsx("h2", { children: "Risk assessment" }), _jsxs("p", { className: "muted", children: ["Contextual multi-signal assessment \u00B7 ", result.confidence, "% signal confidence"] })] }), _jsx("span", { className: `risk big ${result.riskLevel.toLowerCase()}`, children: result.riskLevel })] }), _jsxs("div", { className: "result-body", children: [_jsxs("div", { className: "score-card", children: [_jsxs("div", { className: "score-ring large", children: [_jsx("strong", { children: result.riskScore }), _jsx("span", { children: "/100" })] }), _jsx("p", { children: "Dynamic risk estimate" })] }), _jsxs("div", { className: "result-details", children: [_jsx("h3", { children: "Why this was flagged" }), result.reasons.map((r, i) => (_jsxs("div", { className: "reason", children: [_jsx("span", { children: "!" }), r] }, i))), _jsx("h3", { className: "mt", children: "Risk categories" }), _jsx("div", { className: "chips", children: result.categories.map((c) => (_jsx("span", { children: c.replaceAll('_', ' ') }, c))) })] }), _jsxs("div", { className: "recommend", children: [_jsx("h3", { children: "Recommended next steps" }), result.recommendations.map((r, i) => (_jsxs("div", { className: "rec", children: [_jsx(ShieldCheck, { size: 17 }), r] }, i))), _jsxs("div", { className: "company-mini", children: [_jsx("b", { children: result.companyVerification.name }), _jsx("span", { children: result.companyVerification.status })] })] })] }), _jsxs("div", { className: "analysis-insights", children: [_jsxs("div", { className: "insight-card", children: [_jsxs("div", { className: "insight-title", children: [_jsx(BrainCircuit, { size: 18 }), "Psychological triggers"] }), result.psychologicalTriggers.length ? (result.psychologicalTriggers.map((t, i) => (_jsxs("div", { className: "trigger", children: [_jsx("b", { children: t.label }), _jsx("span", { children: t.evidence })] }, i)))) : (_jsx("div", { className: "muted", children: "No strong manipulation trigger detected." }))] }), _jsxs("div", { className: "insight-card", children: [_jsxs("div", { className: "insight-title", children: [_jsx(CheckCircle2, { size: 18 }), "Independent verification"] }), result.verificationChecks.length ? (result.verificationChecks.slice(0, 5).map((v, i) => (_jsxs("div", { className: "verify-check", children: [_jsx(CheckCircle2, { size: 15 }), _jsx("span", { children: v })] }, i)))) : (_jsx("div", { className: "muted", children: "Use the employer\u2019s official channels before sharing sensitive information." }))] }), _jsxs("div", { className: "insight-card", children: [_jsxs("div", { className: "insight-title", children: [_jsx(ShieldCheck, { size: 18 }), "Context summary"] }), _jsx("p", { className: "summary", children: result.aiSummary }), _jsxs("div", { className: "confidence", children: [_jsx("span", { children: "Signal confidence" }), _jsxs("b", { children: [result.confidence, "%"] })] })] })] }), _jsxs("div", { className: "logo-result", children: [_jsxs("div", { className: "logo-result-head", children: [_jsxs("div", { className: "insight-title", children: [_jsx(ImagePlus, { size: 18 }), "Company logo authenticity"] }), _jsx(LogoStatus, { status: logo.status })] }), _jsxs("div", { className: "logo-result-body", children: [_jsxs("div", { className: "logo-score", children: [_jsxs("strong", { children: [logo.confidence, "%"] }), _jsx("span", { children: "verification confidence" })] }), _jsxs("div", { className: "logo-result-text", children: [logo.reasons.map((r, i) => (_jsxs("div", { className: "logo-reason", children: [logo.status === 'VERIFIED_MATCH' ? (_jsx(BadgeCheck, { size: 16 })) : logo.status === 'POSSIBLE_MISMATCH' ? (_jsx(TriangleAlert, { size: 16 })) : (_jsx(AlertTriangle, { size: 16 })), _jsx("span", { children: r })] }, i))), logo.checks.map((c, i) => (_jsxs("div", { className: "verify-check", children: [_jsx(CheckCircle2, { size: 15 }), _jsx("span", { children: c })] }, `c${i}`)))] })] })] }), _jsxs("div", { className: "result-actions", children: [_jsx("button", { className: "btn secondary", onClick: onHistory, children: "View scan history" }), _jsx("button", { className: "btn primary", onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }), children: "Scan another" })] })] }));
}
function LogoStatus({ status }) {
    const map = {
        VERIFIED_MATCH: ['VERIFIED', 'low'],
        POSSIBLE_MISMATCH: ['POSSIBLE MISMATCH', 'high'],
        UNABLE_TO_VERIFY: ['UNABLE TO VERIFY', 'medium'],
        NO_LOGO_PROVIDED: ['NOT PROVIDED', 'medium'],
    };
    const [label, level] = map[status] || ['CHECKED', 'medium'];
    return _jsx("span", { className: `risk ${level}`, children: label });
}
