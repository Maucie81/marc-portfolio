"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { describeClick } from "@/lib/proof/anchor";
import type { ProofPin, PublicPin } from "@/lib/proof/types";

/**
 * State for the proof-notes feature (see lib/proof/types.ts). Mounted once
 * in the root layout so a visitor's notes follow them across routes; the
 * pins themselves render in ProofLayer, the list in ProofPanel, and the
 * CMYK lockup (ProofTrigger) opens it.
 *
 * Modes: idle → "placing" (press C or hit New note: the cursor becomes a
 * pin and the next click sets a draft) → a draft is open (composer card)
 * → posted. Escape unwinds one step at a time, like Figma.
 */

export type ClientPin = Omit<ProofPin, "visitorId">;

export type Draft = {
  path: string;
  anchor: string;
  ax: number;
  ay: number;
  px: number;
  py: number;
};

export type Identity = { name: string; email: string };

type Mode = "idle" | "placing";

type JumpRequest = { id: string; nonce: number };

type ProofContextValue = {
  pathname: string;
  pins: ClientPin[];
  /** Own pins on the current route. */
  pinsHere: ClientPin[];
  /** A pin opened via `?pin=` that isn't one of the visitor's own — how
   * Marc sees a note in place from the email link. */
  foreignPin: PublicPin | null;
  mode: Mode;
  panelOpen: boolean;
  draft: Draft | null;
  activeId: string | null;
  jump: JumpRequest | null;
  identity: Identity;
  error: string | null;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  startPlacing: () => void;
  stopPlacing: () => void;
  togglePlacing: () => void;
  placeDraft: (clientX: number, clientY: number) => void;
  cancelDraft: () => void;
  submitDraft: (input: { text: string; name: string; email: string; website: string }) => Promise<boolean>;
  removePin: (id: string) => Promise<void>;
  setActive: (id: string | null) => void;
  jumpTo: (pin: { id: string; path: string }) => void;
  numberOf: (id: string) => number;
};

const ProofContext = createContext<ProofContextValue | null>(null);

const IDENTITY_KEY = "mf:proof-identity";

function readIdentity(): Identity {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Identity>;
      return { name: parsed.name ?? "", email: parsed.email ?? "" };
    }
  } catch {
    /* ignore */
  }
  return { name: "", email: "" };
}

function pinIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("pin");
}

export function ProofProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [pins, setPins] = useState<ClientPin[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [foreignPin, setForeignPin] = useState<PublicPin | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [jump, setJump] = useState<JumpRequest | null>(null);
  const [identity, setIdentity] = useState<Identity>({ name: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const nonce = useRef(0);

  // Load the visitor's notes once; the cookie does the identifying.
  useEffect(() => {
    setIdentity(readIdentity());
    let cancelled = false;
    fetch("/api/proof")
      .then((r) => (r.ok ? r.json() : { pins: [] }))
      .then((data: { pins?: ClientPin[] }) => {
        if (!cancelled) setPins(data.pins ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Route change: drop any in-progress placement, then honor a `?pin=`
  // deep link — jump to it, fetching it if it isn't one of ours.
  useEffect(() => {
    setMode("idle");
    setDraft(null);
    setActiveId(null);
    setForeignPin(null);
    if (!loaded) return;

    const id = pinIdFromUrl();
    if (!id) return;
    const own = pins.find((p) => p.id === id);
    if (own) {
      if (own.path === pathname) {
        setActiveId(id);
        setJump({ id, nonce: ++nonce.current });
      }
      return;
    }
    let cancelled = false;
    fetch(`/api/proof/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { pin?: PublicPin } | null) => {
        if (cancelled || !data?.pin || data.pin.path !== pathname) return;
        setForeignPin(data.pin);
        setActiveId(data.pin.id);
        setJump({ id: data.pin.id, nonce: ++nonce.current });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // `pins` is intentionally not a dep: a fresh post shouldn't re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, loaded]);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const togglePanel = useCallback(() => setPanelOpen((v) => !v), []);

  const startPlacing = useCallback(() => {
    setError(null);
    setDraft(null);
    setActiveId(null);
    setPanelOpen(false);
    setMode("placing");
  }, []);
  const stopPlacing = useCallback(() => setMode("idle"), []);
  const togglePlacing = useCallback(() => {
    setMode((m) => {
      if (m === "placing") return "idle";
      setError(null);
      setDraft(null);
      setActiveId(null);
      setPanelOpen(false);
      return "placing";
    });
  }, []);

  const placeDraft = useCallback(
    (clientX: number, clientY: number) => {
      setDraft({ path: pathname, ...describeClick(clientX, clientY) });
      setMode("idle");
    },
    [pathname],
  );
  const cancelDraft = useCallback(() => {
    setDraft(null);
    setError(null);
  }, []);

  const submitDraft = useCallback(
    async (input: { text: string; name: string; email: string; website: string }) => {
      if (!draft) return false;
      setError(null);
      try {
        const res = await fetch("/api/proof", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, ...input }),
        });
        const data = (await res.json()) as { pin?: ClientPin; error?: string };
        if (!res.ok || !data.pin) {
          setError(data.error ?? "Couldn't save that. Try again.");
          return false;
        }
        const pin = data.pin;
        setPins((prev) => [...prev, pin]);
        setDraft(null);
        setActiveId(pin.id);
        const next = { name: input.name.trim(), email: input.email.trim() };
        setIdentity(next);
        try {
          localStorage.setItem(IDENTITY_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return true;
      } catch {
        setError("Couldn't save that. Try again.");
        return false;
      }
    },
    [draft],
  );

  const removePin = useCallback(async (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
    try {
      await fetch(`/api/proof/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      /* already gone locally; the server copy expires on its own */
    }
  }, []);

  const setActive = useCallback((id: string | null) => {
    setActiveId(id);
    if (id) setDraft(null);
  }, []);

  const jumpTo = useCallback(
    (pin: { id: string; path: string }) => {
      setPanelOpen(false);
      if (pin.path !== pathname) {
        router.push(`${pin.path}?pin=${encodeURIComponent(pin.id)}`);
        return;
      }
      setActiveId(pin.id);
      setJump({ id: pin.id, nonce: ++nonce.current });
    },
    [pathname, router],
  );

  const numberOf = useCallback(
    (id: string) => pins.findIndex((p) => p.id === id) + 1,
    [pins],
  );

  // C toggles placing (unless typing); Escape unwinds one layer at a time.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (draft) cancelDraft();
        else if (mode === "placing") stopPlacing();
        else if (activeId) setActiveId(null);
        else if (panelOpen) closePanel();
        return;
      }
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "c" || e.key === "C") togglePlacing();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft, mode, activeId, panelOpen, cancelDraft, stopPlacing, closePanel, togglePlacing]);

  const pinsHere = useMemo(
    () => pins.filter((p) => p.path === pathname),
    [pins, pathname],
  );

  const value = useMemo<ProofContextValue>(
    () => ({
      pathname,
      pins,
      pinsHere,
      foreignPin,
      mode,
      panelOpen,
      draft,
      activeId,
      jump,
      identity,
      error,
      openPanel,
      closePanel,
      togglePanel,
      startPlacing,
      stopPlacing,
      togglePlacing,
      placeDraft,
      cancelDraft,
      submitDraft,
      removePin,
      setActive,
      jumpTo,
      numberOf,
    }),
    [
      pathname,
      pins,
      pinsHere,
      foreignPin,
      mode,
      panelOpen,
      draft,
      activeId,
      jump,
      identity,
      error,
      openPanel,
      closePanel,
      togglePanel,
      startPlacing,
      stopPlacing,
      togglePlacing,
      placeDraft,
      cancelDraft,
      submitDraft,
      removePin,
      setActive,
      jumpTo,
      numberOf,
    ],
  );

  return <ProofContext.Provider value={value}>{children}</ProofContext.Provider>;
}

export function useProof(): ProofContextValue {
  const ctx = useContext(ProofContext);
  if (!ctx) throw new Error("useProof must be used inside ProofProvider");
  return ctx;
}
