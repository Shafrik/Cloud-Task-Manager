import { useState } from "react";
import { ArrowRight, Check, CheckSquare, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";

export default function Login({ onAuthenticate }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onAuthenticate({ email, password }, mode);
      if (mode === "register") {
        setMode("login");
        setPassword("");
        setSuccess("Account created. Sign in below with your email and password.");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <a className="brand auth-brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><CheckSquare size={20} strokeWidth={2.5} /></span>
          <span>cloud<span className="brand-light">task</span></span>
        </a>
        <div className="showcase-content">
          <span className="showcase-kicker"><Sparkles size={14} /> A CLEARER WAY TO GET THINGS DONE</span>
          <h1>Your work,<br />in <span>focus.</span></h1>
          <p>Plan projects, set priorities, and keep deadlines in one calm workspace. See what’s next, track your progress, and celebrate every finished task.</p>
          <div className="showcase-note">
            <div className="note-check"><Check size={17} /></div>
            <div><strong>Tasks, priorities &amp; deadlines</strong><span>Everything organized in one workspace.</span></div>
            <div className="note-spark">✦</div>
          </div>
        </div>
        <div className="showcase-orbit showcase-orbit-one" />
        <div className="showcase-orbit showcase-orbit-two" />
        <div className="showcase-star">✦</div>
        <div className="auth-footnote">A little more focus, one task at a time.</div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand"><span className="brand-mark"><CheckSquare size={20} strokeWidth={2.5} /></span><span>cloud<span className="brand-light">task</span></span></div>
          <span className="auth-eyebrow">{mode === "login" ? "WELCOME BACK" : "YOUR SPACE STARTS HERE"}</span>
          <h2>{mode === "login" ? "Sign in to your space" : "Create your account"}</h2>
          <p className="auth-intro">{mode === "login" ? "Pick up right where you left off." : "A calmer way to keep on top of it all."}</p>

          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "selected" : ""} onClick={() => switchMode("login")}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "selected" : ""} onClick={() => switchMode("register")}>Create account</button>
          </div>

          <form onSubmit={submit}>
            <label className="auth-label" htmlFor="auth-email">Email address</label>
            <div className="auth-input-wrap"><Mail size={17} /><input id="auth-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>

            <label className="auth-label" htmlFor="auth-password">Password</label>
            <div className="auth-input-wrap"><LockKeyhole size={17} /><input id="auth-password" type={visible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /><button className="password-toggle" type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>

            {mode === "register" && <span className="password-hint">Use at least 8 characters and avoid common passwords.</span>}
            {success && <p className="auth-success" role="status">{success}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>{submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}{!submitting && <ArrowRight size={17} />}</button>
          </form>

          <div className="auth-secure"><LockKeyhole size={13} /> Your tasks are private to your account.</div>
        </div>
        <div className="auth-footer">CloudTask <span>·</span> A quieter kind of productivity</div>
      </section>
    </main>
  );
}
