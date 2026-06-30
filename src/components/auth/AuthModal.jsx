import { AnimatePresence, motion } from "framer-motion";
import { Lock, LogIn, Mail, ShieldCheck, User, UserPlus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../shared/Button";
import { useAuth } from "../../hooks/useAuth";

const defaultForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  remember: true
};

const authTabs = [
  { id: "login", label: "Login", icon: LogIn },
  { id: "signup", label: "Signup", icon: UserPlus }
];

function Field({ error, icon: Icon, label, ...props }) {
  const inputId = useId();

  return (
    <div>
      <label className="text-sm font-medium text-slate-200" htmlFor={inputId}>
        {label}
      </label>
      <div
        className={`mt-2 flex items-center gap-3 rounded-lg border bg-slate-950/70 px-3 transition ${
          error ? "border-rose-400/70" : "border-white/10 focus-within:border-cyan-300/70"
        }`}
      >
        <Icon className={error ? "text-rose-300" : "text-slate-500"} size={18} />
        <input
          className="min-h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          id={inputId}
          {...props}
        />
      </div>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

export function AuthModal({ initialMode = "login", isOpen, onClose }) {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors({});
    }
  }, [initialMode, isOpen]);

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validate() {
    const nextErrors = {};
    const email = formData.email.trim();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (mode === "signup") {
      if (formData.name.trim().length < 2) {
        nextErrors.name = "Enter your full name.";
      }

      if (formData.confirmPassword !== formData.password) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      if (mode === "login") {
        await login({
          email: formData.email.trim(),
          password: formData.password
        });
        toast.success("Welcome back.");
      } else {
        await signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        });
        toast.success("Account created.");
      }

      onClose?.();
      navigate("/app/dashboard");
    } catch (error) {
      setErrors({ form: error.message || "Unable to continue. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setErrors({});
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 grid min-h-screen place-items-center overflow-y-auto bg-slate-950/80 px-4 py-8 backdrop-blur-xl"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-black/50 md:grid-cols-[0.9fr_1.1fr]"
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22 }}
          >
            <aside className="bg-[linear-gradient(145deg,rgba(54,24,230,0.3),rgba(136,34,210,0.2)_48%,rgba(26,20,70,0.95))] p-6 md:p-8">
              <img alt="CryptoCraze" className="h-12 w-auto" src="/crypto-logo.png" />
              <div className="mt-12 max-w-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Secure Access
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                  Trade-ready account access in one clean window.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Sign in or create your account without leaving the product flow.
                </p>
              </div>
              <div className="mt-10 grid gap-3 text-sm text-slate-200">
                {["Encrypted credentials", "Responsive fintech interface", "Firebase-ready workflow"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                      <ShieldCheck className="text-cyan-300" size={18} />
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </aside>

            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              {onClose ? (
                <div className="mb-4 flex justify-end">
                  <button
                    aria-label="Close authentication modal"
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                    onClick={onClose}
                    type="button"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/5 p-1.5 shadow-inner shadow-black/20">
                {authTabs.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    aria-pressed={mode === id}
                    className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition duration-200 ${
                      mode === id
                        ? "bg-[linear-gradient(135deg,#3618E6_0%,#8822D2_52%,#E127E5_100%)] text-white shadow-[0_12px_32px_rgba(225,39,229,0.26)]"
                        : "text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                    onClick={() => switchMode(id)}
                    type="button"
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-6 space-y-4"
                  exit={{ opacity: 0, x: mode === "login" ? -12 : 12 }}
                  initial={{ opacity: 0, x: mode === "login" ? 12 : -12 }}
                  transition={{ duration: 0.18 }}
                >
                  {mode === "signup" ? (
                    <Field
                      autoComplete="name"
                      error={errors.name}
                      icon={User}
                      label="Full name"
                      onChange={(event) => updateField("name", event.target.value)}
                      placeholder="Alex Carter"
                      type="text"
                      value={formData.name}
                    />
                  ) : null}

                  <Field
                    autoComplete="email"
                    error={errors.email}
                    icon={Mail}
                    label="Email"
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={formData.email}
                  />

                  <Field
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    error={errors.password}
                    icon={Lock}
                    label="Password"
                    onChange={(event) => updateField("password", event.target.value)}
                    placeholder="Minimum 6 characters"
                    type="password"
                    value={formData.password}
                  />

                  {mode === "signup" ? (
                    <Field
                      autoComplete="new-password"
                      error={errors.confirmPassword}
                      icon={Lock}
                      label="Confirm password"
                      onChange={(event) => updateField("confirmPassword", event.target.value)}
                      placeholder="Repeat password"
                      type="password"
                      value={formData.confirmPassword}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-slate-300">
                  <input
                    checked={formData.remember}
                    className="h-4 w-4 accent-cyan-400"
                    onChange={(event) => updateField("remember", event.target.checked)}
                    type="checkbox"
                  />
                  Remember me
                </label>
                <button
                  className="font-medium text-cyan-300 transition hover:text-cyan-200"
                  onClick={() => toast("Password reset can be connected from Firebase Auth.")}
                  type="button"
                >
                  Forgot password?
                </button>
              </div>

              {errors.form ? (
                <p className="mt-5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errors.form}
                </p>
              ) : null}

              <Button className="mt-6 w-full" disabled={submitting} type="submit">
                {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
