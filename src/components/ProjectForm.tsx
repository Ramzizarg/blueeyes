"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent, type ReactNode } from "react";
import { EMAIL } from "@/lib/contact";

const serviceOptions = [
  "New website",
  "Redesign",
  "Landing page",
  "E-commerce",
  "Branding",
];

const currencyOptions = [
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "MAD", symbol: "DH" },
  { code: "CAD", symbol: "CA$" },
  { code: "CHF", symbol: "CHF" },
] as const;

type CurrencyCode = (typeof currencyOptions)[number]["code"];
type Status = "idle" | "sending" | "sent" | "mail" | "error";
type Errors = Partial<Record<"name" | "email" | "message", string>>;

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 12);

export function ProjectForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const currencySymbol =
    currencyOptions.find((option) => option.code === currency)?.symbol ?? "€";
  const budgetLabel = budget ? `${currencySymbol}${budget}` : "";

  const toggleService = (service: string) =>
    setServices((current) =>
      current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service],
    );

  const clearError = (field: keyof Errors) =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  const validate = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Please tell me your name";
    if (!isEmail(email.trim())) next.email = "Please enter a valid email";
    if (message.trim().length < 10) next.message = "A sentence or two about your project helps a lot";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openMailFallback = () => {
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      services.length > 0 && `Needs: ${services.join(", ")}`,
      budgetLabel && `Budget: ${budgetLabel}`,
      "",
      message,
    ]
      .filter((line) => line !== false && line !== "")
      .join("\n");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `Website project — ${name}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending" || !validate()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          services,
          budget: budgetLabel,
          currency,
          message,
          website: honeypot,
        }),
      });

      if (res.ok) {
        setStatus("sent");
        return;
      }
      if (res.status === 501) {
        openMailFallback();
        setStatus("mail");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const done = status === "sent" || status === "mail";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center py-6 text-center"
          role="status"
        >
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e3ecff] text-signal ring-1 ring-signal/40"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <motion.path
                d="m5 12.5 4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </svg>
          </motion.span>
          <h4 className="display mb-2 text-[1.2rem] text-ink">
            {status === "sent" ? "Request sent!" : "Almost there!"}
          </h4>
          <p className="max-w-sm text-[0.82rem] leading-relaxed text-ink/60">
            {status === "sent"
              ? `Thanks ${name.split(" ")[0]} — I'll get back to you within 24 hours.`
              : "Your email app just opened with everything filled in — hit send and I'll reply within 24 hours."}
          </p>
          {status === "mail" ? (
            <p className="mt-3 text-[0.72rem] text-ink/45">
              Nothing opened? Write to{" "}
              <a href={`mailto:${EMAIL}`} className="text-signal underline underline-offset-4">
                {EMAIL}
              </a>
            </p>
          ) : null}
        </motion.div>
      ) : (
        <motion.form
          key="form"
          noValidate
          onSubmit={onSubmit}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-3.5"
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Name" required error={errors.name}>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
                aria-invalid={!!errors.name}
                className="field"
              />
            </Field>
            <Field label="Email" required error={errors.email}>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                aria-invalid={!!errors.email}
                className="field"
              />
            </Field>
          </div>

          <fieldset>
            <legend className="field-label">What do you need?</legend>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={services.includes(option)}
                  onClick={() => toggleService(option)}
                  className="chip"
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label="Your budget" hint="Optional — numbers only">
            <div className="budget-field">
              <label className="budget-currency" aria-label="Currency">
                <select
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.symbol} {option.code}
                    </option>
                  ))}
                </select>
              </label>
              <input
                type="text"
                name="budget"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 1500"
                value={budget}
                onChange={(e) => setBudget(digitsOnly(e.target.value))}
                className="field budget-amount"
                autoComplete="off"
              />
            </div>
          </Field>

          <Field label="About your project" required error={errors.message}>
            <textarea
              name="message"
              rows={3}
              placeholder="What do you do, and what should your new website achieve?"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                clearError("message");
              }}
              aria-invalid={!!errors.message}
              className="field resize-none"
            />
          </Field>

          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            aria-hidden
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="submit-btn"
          >
            <span>{status === "sending" ? "Sending…" : "Request a proposal"}</span>
            <span className="submit-icon" aria-hidden>
              {status === "sending" ? (
                <span className="spinner" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>

          {status === "error" ? (
            <p role="alert" className="text-center text-[0.75rem] text-[#d64545]">
              Something went wrong.{" "}
              <button type="button" onClick={openMailFallback} className="underline underline-offset-4">
                Send it by email instead
              </button>
            </p>
          ) : (
            <p className="text-center text-[0.72rem] text-[#1c2230]/55">
              No spam, no newsletter. Your details are only used to reply to you.
            </p>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col">
      <span className="field-label">
        {label}
        {required ? <span className="text-signal"> *</span> : null}
        {hint ? (
          <span className="ml-2 font-medium normal-case tracking-normal text-[#1c2230]/55">
            {hint}
          </span>
        ) : null}
      </span>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-[0.7rem] text-[#d64545]"
          >
            {error}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </label>
  );
}
