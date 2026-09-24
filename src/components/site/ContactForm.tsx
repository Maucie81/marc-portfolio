"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 828:64330 — label (Google Sans Flex SemiBold 16/24, ink-2) sits 16px above
// a Roboto Mono 14/22 field whose only chrome is the 1px bottom rule; the
// placeholder is --line (#b0b0b0), lighter than --muted.
const fieldClass =
  "t-body w-full border-b border-line bg-transparent pb-2 text-ink-2 transition-colors placeholder:text-line focus:border-b-2 focus:border-accent focus:pb-[7px] focus-visible:outline-none!";
const groupClass = "flex flex-col gap-4 lg:gap-[clamp(8px,calc(2.6dvh-11px),16px)]";
const labelClass = "t-label text-ink-2";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValid =
    name.trim().length > 0 &&
    EMAIL_PATTERN.test(email.trim()) &&
    message.trim().length > 0;

  async function handleSubmit() {
    if (!isValid || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2">
        <p className="t-section-title">Message sent.</p>
        <p className="t-body text-ink-2">Thanks for reaching out — I&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[617px] flex-col gap-12 lg:min-h-0 lg:flex-1 lg:gap-[clamp(16px,calc(10.5dvh-60px),48px)]">
      <div className={groupClass}>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={fieldClass}
        />
      </div>

      <div className={groupClass}>
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourname.com"
          className={fieldClass}
        />
      </div>

      <div className={`${groupClass} lg:min-h-0 lg:flex-1`}>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind?"
          rows={5}
          className={`${fieldClass} min-h-[132px] resize-none lg:min-h-[56px] lg:flex-1`}
        />
      </div>

      {status === "error" ? (
        <p className="text-sm text-accent">{errorMessage}</p>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid || status === "loading"}
        className="cta self-start transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </div>
  );
}
