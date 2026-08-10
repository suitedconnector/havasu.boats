"use client";

import { useState } from "react";

type Props = {
  listingName: string;
  listingSlug: string;
};

/**
 * Lead capture form. At launch this doesn't post anywhere yet — it's the UI
 * seam. Wire it to Resend (already the pattern from haulagua) when you're
 * ready to route inquiries. Featured/paying listings will get inquiries
 * forwarded to them; basic listings collect for you as sales ammunition.
 */
export function LeadForm({ listingName, listingSlug }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = new FormData(e.currentTarget);
    const payload = {
      listingSlug,
      name: form.get("name"),
      email: form.get("email"),
      message: form.get("message"),
    };

    try {
      const response = await fetch("/api/contact-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-sm border border-channel-500 bg-channel-100 p-6 text-center">
        <div className="font-mono text-[11px] uppercase tracking-chart text-channel-700">
          Request received
        </div>
        <p className="mt-2 text-channel-900">
          Thanks — we&rsquo;ll pass this along to {listingName}.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-sm border border-rock bg-white p-6 text-center">
        <div className="font-mono text-[11px] uppercase tracking-chart text-rock">
          Something went wrong
        </div>
        <p className="mt-2 text-channel-700">
          Please try again or contact the business directly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm text-channel-500 hover:text-rock underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="font-mono text-[11px] uppercase tracking-chart text-channel-700">
        Request availability
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field name="name" label="Your name" required />
        <Field name="phone" label="Phone" type="tel" />
        <Field name="email" label="Email" type="email" required />
        <Field name="dates" label="Dates" placeholder="e.g. Jul 25-27" />
      </div>
      <label className="block">
        <span className="text-sm font-medium text-channel-900">
          What are you looking for?
        </span>
        <textarea
          name="message"
          rows={3}
          className="mt-1 w-full rounded-sm border border-channel-900/20 bg-paper px-3 py-2 text-sm focus:border-channel-500 focus:outline-none"
          placeholder="Group size, boat type, questions…"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-sm bg-channel-700 px-4 py-3 font-semibold text-paper transition hover:bg-channel-900 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send request"}
      </button>
      <p className="text-center text-xs text-channel-500">
        No account needed — we&rsquo;ll forward this to the business directly.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-channel-900">
        {label}
        {required && <span className="text-rock">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-channel-900/20 bg-paper px-3 py-2 text-sm focus:border-channel-500 focus:outline-none"
      />
    </label>
  );
}
