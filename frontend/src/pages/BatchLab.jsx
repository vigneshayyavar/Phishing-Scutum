import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { DatabaseZap, Gauge, LoaderCircle, Play, TimerReset, Zap } from 'lucide-react';
import { batchAnalyze } from '../api';
const examples = [
    { inputText: 'Congratulations! You are selected. Pay ₹999 registration fee today to secure your job. Contact HR on WhatsApp.', url: 'http://apply-now-careers.example.com/verify' },
    { inputText: 'We reviewed your application. Please attend the interview using the official careers portal. No payment is required.', url: 'https://careers.example.com/jobs/123' },
    { inputText: 'Urgent: send OTP and UPI PIN to complete onboarding. 100% selected, no interview.', url: 'https://verify-account.example.com/onboard' },
];
export default function BatchLab() {
    const [count, setCount] = useState(10000);
    const [targetMs, setTargetMs] = useState(10000);
    const [concurrency, setConcurrency] = useState(128);
    const [persist, setPersist] = useState(false);
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const items = useMemo(() => Array.from({ length: count }, (_, i) => examples[i % examples.length]), [count]);
    const run = async () => {
        setRunning(true);
        setProgress(12);
        setError('');
        setResult(null);
        const tick = window.setInterval(() => setProgress(p => Math.min(92, p + Math.max(1, Math.round(100000 / Math.max(10000, targetMs))))), 1000);
        try {
            const r = await batchAnalyze({ items, targetMs, concurrency, persist });
            setProgress(100);
            setResult(r);
        }
        catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Batch analysis failed');
        }
        finally {
            window.clearInterval(tick);
            setRunning(false);
        }
    };
    const sec = result ? (result.elapsedMs / 1000).toFixed(2) : '—';
    return _jsxs(_Fragment, { children: [_jsx("div", { className: "page-head", children: _jsxs("div", { children: [_jsx("div", { className: "section-kicker", children: "Performance lab" }), _jsx("h1", { children: "10,000-analysis benchmark." }), _jsx("p", { children: "Run a controlled batch against the same explainable risk engine. The service enforces a configurable 10,000\u201360,000 ms completion window." })] }) }), _jsxs("div", { className: "batch-grid", children: [_jsxs("section", { className: "panel batch-control", children: [_jsx("div", { className: "mini-icon", children: _jsx(DatabaseZap, {}) }), _jsx("h2", { children: "Batch configuration" }), _jsxs("label", { children: ["Analyses ", _jsx("span", { className: "optional", children: "max 10,000" }), _jsx("input", { type: "number", min: 1, max: 10000, value: count, onChange: e => setCount(Math.min(10000, Math.max(1, Number(e.target.value) || 1))) })] }), _jsxs("label", { children: ["Target duration ", _jsx("span", { className: "optional", children: "10\u201360 seconds" }), _jsxs("select", { value: targetMs, onChange: e => setTargetMs(Number(e.target.value)), children: [_jsx("option", { value: 10000, children: "10,000 ms" }), _jsx("option", { value: 20000, children: "20,000 ms" }), _jsx("option", { value: 30000, children: "30,000 ms" }), _jsx("option", { value: 45000, children: "45,000 ms" }), _jsx("option", { value: 60000, children: "60,000 ms" })] })] }), _jsxs("label", { children: ["Concurrency ", _jsx("span", { className: "optional", children: "CPU/event-loop friendly" }), _jsx("input", { type: "number", min: 1, max: 256, value: concurrency, onChange: e => setConcurrency(Math.min(256, Math.max(1, Number(e.target.value) || 1))) })] }), _jsxs("label", { className: "toggle-line", children: [_jsx("input", { type: "checkbox", checked: persist, onChange: e => setPersist(e.target.checked) }), _jsx("span", { children: "Persist all results to scan history" })] }), _jsx("button", { className: "btn primary large full", onClick: run, disabled: running, children: running ? _jsxs(_Fragment, { children: [_jsx(LoaderCircle, { className: "spin" }), " Running ", count.toLocaleString(), " analyses\u2026"] }) : _jsxs(_Fragment, { children: [_jsx(Play, { size: 18 }), " Run benchmark"] }) }), running && _jsxs("div", { className: "progress-wrap", children: [_jsxs("div", { className: "progress-head", children: [_jsx("span", { children: "Processing" }), _jsxs("b", { children: [progress, "%"] })] }), _jsx("div", { className: "progress-track", children: _jsx("i", { style: { width: `${progress}%` } }) })] }), error && _jsx("div", { className: "error", children: error })] }), _jsxs("aside", { className: "panel batch-stats", children: [_jsxs("div", { className: "metric", children: [_jsx(Gauge, {}), _jsx("span", { children: "Requested window" }), _jsxs("b", { children: [targetMs.toLocaleString(), " ms"] })] }), _jsxs("div", { className: "metric", children: [_jsx(TimerReset, {}), _jsx("span", { children: "Actual elapsed" }), _jsx("b", { children: result ? `${sec} s` : '—' })] }), _jsxs("div", { className: "metric", children: [_jsx(Zap, {}), _jsx("span", { children: "Analyses completed" }), _jsx("b", { children: result ? result.count.toLocaleString() : '—' })] }), _jsxs("div", { className: "benchmark-note", children: [_jsx("b", { children: "Performance contract" }), _jsx("p", { children: "For a 10,000-item batch, the endpoint accepts a target from 10,000 to 60,000 ms and deliberately holds the response until that target when computation finishes sooner." })] })] })] }), result && _jsxs("section", { className: "panel batch-result", children: [_jsxs("div", { className: "panel-head", children: [_jsxs("div", { children: [_jsx("h2", { children: "Benchmark complete" }), _jsxs("p", { children: [result.count.toLocaleString(), " analyses processed in ", sec, " seconds."] })] }), _jsx("span", { className: "risk low", children: "Completed" })] }), _jsxs("div", { className: "batch-summary", children: [_jsxs("div", { children: [_jsx("span", { children: "Requested" }), _jsxs("b", { children: [targetMs.toLocaleString(), " ms"] })] }), _jsxs("div", { children: [_jsx("span", { children: "Actual" }), _jsxs("b", { children: [result.elapsedMs.toLocaleString(), " ms"] })] }), _jsxs("div", { children: [_jsx("span", { children: "Persisted" }), _jsx("b", { children: result.persisted.toLocaleString() })] }), _jsxs("div", { children: [_jsx("span", { children: "Sample risk" }), _jsxs("b", { children: [result.results.slice(0, 100).filter(x => x.riskScore >= 60).length, "/100"] })] })] })] })] });
}
