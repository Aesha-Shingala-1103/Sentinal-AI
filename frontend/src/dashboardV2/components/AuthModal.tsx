import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Shield, Mail, Lock, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Signed in.");
      } else {
        await register(name, email, password);
        toast.success("Account created.");
      }
      close();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative w-full max-w-sm rounded-2xl border border-white/10 p-6"
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center gap-2.5">
              <div className="relative">
                <Shield className="h-6 w-6 text-cyan-500" strokeWidth={2.2} />
                <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {mode === "login" ? "Sign in" : "Create account"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {mode === "login"
                    ? "Access your saved cases and watchlist"
                    : "Save cases, tag them, and get alerts"}
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-3">
              {mode === "register" && (
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 8 characters)"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={submitting}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 text-sm font-semibold text-navy-900 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "login" ? "Sign in" : "Create account"}
              </motion.button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500">
              {mode === "login" ? (
                <>
                  No account yet?{" "}
                  <button
                    onClick={() => {
                      reset();
                      setMode("register");
                    }}
                    className="font-medium text-cyan-400 hover:underline"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      reset();
                      setMode("login");
                    }}
                    className="font-medium text-cyan-400 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
