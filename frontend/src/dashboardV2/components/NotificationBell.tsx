import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, Check, Loader2 } from "lucide-react";
import { listAlerts, acknowledgeAlert } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Alert {
  id: string;
  query: string;
  message: string;
  created_at: string;
  acknowledged: boolean;
  new_entities: any[];
}

const POLL_MS = 30_000;

export default function NotificationBell() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listAlerts(false);
      setAlerts(data);
      setAvailable(true);
    } catch {
      setAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = alerts.filter((a) => !a.acknowledged).length;

  const handleAck = async (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    try {
      await acknowledgeAlert(id);
    } catch {
      refresh();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-cyan-500"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-accent-red px-1 text-[9px] font-bold text-white shadow-[0_0_6px_#FF3B5C]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-white/10 p-2 shadow-2xl"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold text-white">Alerts</span>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />}
            </div>

            {!available && (
              <div className="px-2 py-4 text-center text-xs text-slate-500">
                Alerts require MONGO_URI to be configured on the backend.
              </div>
            )}

            {available && alerts.length === 0 && !loading && (
              <div className="px-2 py-4 text-center text-xs text-slate-500">
                No alerts yet. Add a target to your watchlist to get notified
                when new entities appear.
              </div>
            )}

            {available && alerts.length > 0 && (
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                      a.acknowledged ? "opacity-50" : "bg-white/5"
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-slate-200">{a.message}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!a.acknowledged && (
                      <button
                        onClick={() => handleAck(a.id)}
                        title="Mark as read"
                        className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-emerald-400"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
