"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Snapshot } from "@/lib/model";
type Context = {
  state: Snapshot | null;
  busy: boolean;
  error: string;
  notice: string;
  clear: () => void;
  act: (
    action: string,
    data?: Record<string, unknown>,
    success?: string,
  ) => Promise<{ ok: boolean; result?: unknown; state?: Snapshot }>;
  reload: () => Promise<void>;
};
const AppContext = createContext<Context | null>(null);
export function Provider({
  children,
  initialState = null,
}: {
  children: ReactNode;
  initialState?: Snapshot | null;
}) {
  const [state, setState] = useState<Snapshot | null>(initialState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const working = useRef(false);
  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/app", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load the workspace.");
      setState(await res.json());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection unavailable.");
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const act: Context["act"] = async (action, data = {}, success) => {
    if (working.current) return { ok: false };
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const body = await res.json();
      if (!res.ok)
        throw new Error(body.error || "Could not save. Please try again.");
      setState(body.state);
      if (success) setNotice(success);
      return { ok: true, result: body.result, state: body.state };
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Connection unavailable. Your changes have not been saved.",
      );
      return { ok: false };
    } finally {
      working.current = false;
      setBusy(false);
    }
  };
  return (
    <AppContext.Provider
      value={{
        state,
        busy,
        error,
        notice,
        clear: () => {
          setError("");
          setNotice("");
        },
        act,
        reload,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("App provider required");
  return value;
}
