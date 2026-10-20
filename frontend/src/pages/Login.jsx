import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, ArrowRight, } from "lucide-react";
import { api } from "../api";
export default function Login({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("demo@PhishingScutum.app");
    const [password, setPassword] = useState("Demo@12345");
    const [show, setShow] = useState(false);
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);
    const nav = useNavigate();
    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        setBusy(true);
        try {
            const r = await api.post(mode === "login" ? "/auth/login" : "/auth/register", mode === "login"
                ? { email, password }
                : { name, email, password });
            localStorage.setItem("Phishing Scutum_token", r.data.token);
            onLogin();
            nav("/dashboard");
        }
        catch (e) {
            setErr(e?.response?.data?.message ||
                (e?.code === 'ERR_NETWORK' ? 'Backend API is not reachable. Start the Phishing Scutum backend on port 5000.' : 'Something went wrong. Please try again.'));
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "auth", children: [_jsxs("div", { className: "auth-art", children: [_jsxs(Link, { to: "/", className: "brand", children: [_jsx("div", { className: "logo", children: _jsx(ShieldCheck, {}) }), _jsxs("div", { children: [_jsx("b", { children: "Phishing Scutum" }), _jsx("span", { children: "Job safety intelligence" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "eyebrow", children: [_jsx("span", { className: "pulse" }), "Your job-search safety layer"] }), _jsx("h1", { children: "Don't let a great-looking job hide a bad signal." }), _jsx("p", { children: "Scan suspicious offers before you share money, documents or personal information." })] }), _jsx("div", { className: "auth-note", children: "\u201CA risk estimate should explain itself.\u201D" })] }), _jsx("div", { className: "auth-panel", children: _jsxs("div", { className: "auth-card", children: [_jsx("div", { className: "mobile-brand", children: _jsx(ShieldCheck, {}) }), _jsx("h2", { children: mode === "login"
                                ? "Welcome back"
                                : "Create your account" }), _jsx("p", { children: mode === "login"
                                ? "Sign in to your safety workspace."
                                : "Start checking job opportunities in seconds." }), _jsxs("form", { onSubmit: submit, children: [mode === "register" && (_jsxs("label", { children: ["Name", _jsx("input", { type: "text", name: "name", placeholder: "Enter your name", value: name, onChange: (e) => {
                                                const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                                                setName(value);
                                            }, required: true, minLength: 2, maxLength: 50, autoComplete: "name" })] })), _jsxs("label", { children: ["Email", _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "you@example.com" })] }), _jsxs("label", { children: ["Password", _jsxs("div", { className: "password", children: [_jsx("input", { type: show ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 8 }), _jsx("button", { type: "button", onClick: () => setShow(!show), children: show ? (_jsx(EyeOff, { size: 17 })) : (_jsx(Eye, { size: 17 })) })] })] }), err && _jsx("div", { className: "error", children: err }), _jsxs("button", { className: "btn primary full", disabled: busy, children: [busy
                                            ? "Working…"
                                            : mode === "login"
                                                ? "Sign in"
                                                : "Create account", _jsx(ArrowRight, { size: 17 })] })] }), _jsx("div", { className: "switch", children: mode === "login" ? (_jsxs(_Fragment, { children: ["New here?", " ", _jsx("button", { type: "button", onClick: () => setMode("register"), children: "Create an account" })] })) : (_jsxs(_Fragment, { children: ["Already have an account?", " ", _jsx("button", { type: "button", onClick: () => setMode("login"), children: "Sign in" })] })) }), _jsxs("div", { className: "demo", children: ["Demo account prefilled:", " ", _jsx("b", { children: "demo@PhishingScutum.app" }), " /", " ", _jsx("b", { children: "Demo@12345" })] })] }) })] }));
}
